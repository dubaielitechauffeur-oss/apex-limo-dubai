import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";

/**
 * Snapshots and field-level diffs for the audit log, plus the inverse
 * ("apply these values back") that powers Undo.
 *
 * Every admin write already records an audit entry, but most entries only
 * said "updated, slug: x → x", so the owner could not see what an editor (the
 * SEO agency in particular) actually changed, and nothing could be put back.
 * Each covered write now captures the full row before and after, and the
 * entry stores every changed column with both values. The same data lets
 * Undo restore exactly the columns that one save changed.
 *
 * Only content the agency can edit is covered (see the Agency role in
 * lib/permissions/roles.ts). Bookings, quotes, contacts and users keep their
 * existing summary entries and are never undoable.
 */

export interface AuditFieldChange {
  field: string;
  before?: unknown;
  after?: unknown;
  value?: unknown;
}

/** Pseudo-fields: data that lives in a related table, not on the row. */
export const IMAGES_FIELD = "__images";
export const TAGS_FIELD = "__tags";
/** A hard-deleted row's full contents, so Undo can recreate it. */
export const RECORD_FIELD = "__record";
/** Present on entries that carry complete before/after values (undoable). */
export const DETAIL_FIELD = "__detail";
/** Marks an update that created the row (an upsert's first save). */
export const CREATED_FIELD = "__created";
/** Marks an entry that undid another one; `after` is the undone entry's id. */
export const UNDO_OF_FIELD = "__undoOf";

interface RecordConfig {
  /** Prisma client delegate name. */
  model: string;
  /** Unique column the audit entry's `entityId` refers to. */
  key: "id" | "page";
  /** Has a `deletedAt` column: delete/restore is a field change. */
  softDelete?: boolean;
  images?: boolean;
  tags?: boolean;
}

export const AUDITED_RECORDS: Record<string, RecordConfig> = {
  service: { model: "service", key: "id", softDelete: true },
  location: { model: "location", key: "id", softDelete: true },
  vehicle: { model: "vehicle", key: "id", softDelete: true, images: true },
  vehicle_category: { model: "vehicleCategory", key: "id" },
  blog_post: { model: "blogPost", key: "id", softDelete: true, tags: true },
  blog_category: { model: "blogCategory", key: "id" },
  faq: { model: "faq", key: "id" },
  faq_category: { model: "faqCategory", key: "id" },
  hero_slide: { model: "heroSlide", key: "id" },
  testimonial: { model: "testimonial", key: "id" },
  brand: { model: "brand", key: "id" },
  page_hero: { model: "pageHero", key: "page" },
  page_seo: { model: "pageSeo", key: "page" },
  global_settings: { model: "globalSettings", key: "id" },
  media_item: { model: "mediaItem", key: "id", softDelete: true },
  media_folder: { model: "mediaFolder", key: "id" },
};

/** Bookkeeping columns that change on every save and mean nothing to a reader. */
const IGNORED_FIELDS = new Set(["id", "createdAt", "updatedAt"]);

type Snapshot = Record<string, unknown>;

interface Delegate {
  findUnique(args: unknown): Promise<Snapshot | null>;
  update(args: unknown): Promise<unknown>;
  create(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
}

function delegate(config: RecordConfig): Delegate {
  return (prisma as unknown as Record<string, Delegate>)[config.model];
}

/** JSON round-trip so Dates become ISO strings, matching what is stored. */
function normalize(value: unknown): unknown {
  return value === undefined ? null : JSON.parse(JSON.stringify(value));
}

/**
 * The record as it is now, including related images/tags as pseudo-fields.
 * Null when the type is not covered or the row does not exist. Never throws:
 * a failed snapshot must not fail the save it describes.
 */
export async function readSnapshot(entityType: string, entityId: string): Promise<Snapshot | null> {
  const config = AUDITED_RECORDS[entityType];
  if (!config) return null;
  try {
    const row = await delegate(config).findUnique({ where: { [config.key]: entityId } });
    if (!row) return null;
    const snapshot: Snapshot = normalize(row) as Snapshot;
    if (config.images) {
      const images = await prisma.vehicleImage.findMany({
        where: { vehicleId: String(row.id) },
        orderBy: { sortOrder: "asc" },
        select: { mediaId: true, mobileMediaId: true, sortOrder: true },
      });
      snapshot[IMAGES_FIELD] = images;
    }
    if (config.tags) {
      const tags = await prisma.blogPostTag.findMany({ where: { blogPostId: String(row.id) }, select: { tagId: true } });
      snapshot[TAGS_FIELD] = tags.map((t) => t.tagId).sort();
    }
    return snapshot;
  } catch (error) {
    console.error("[audit] snapshot failed", entityType, entityId, error);
    return null;
  }
}

/** Every column whose value differs between two snapshots, with both values. */
export function diffSnapshots(before: Snapshot | null, after: Snapshot | null): AuditFieldChange[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  const changes: AuditFieldChange[] = [];
  for (const key of keys) {
    if (IGNORED_FIELDS.has(key)) continue;
    // A pseudo-field the caller's "before" row never loaded is unknown, not empty.
    if (key.startsWith("__") && (!before || !(key in before) || !after || !(key in after))) continue;
    const b = normalize(before?.[key]);
    const a = normalize(after?.[key]);
    if (JSON.stringify(b) !== JSON.stringify(a)) changes.push({ field: key, before: b, after: a });
  }
  return changes.sort((x, y) => x.field.localeCompare(y.field));
}

/** Prisma rejects a bare `null` for a Json column; DbNull clears it. Text and
 *  date columns take a plain null. The other side of the change tells us
 *  which kind of column this is. */
function toWritable(value: unknown, counterpart: unknown): unknown {
  if (value !== null) return value;
  const looksJson = counterpart !== null && typeof counterpart === "object";
  return looksJson ? Prisma.DbNull : null;
}

/**
 * Writes `values` (column → value, pseudo-fields included) onto the record.
 * `counterparts` are the values being replaced, used only to pick DbNull.
 */
export async function applyValues(
  entityType: string,
  entityId: string,
  values: Record<string, unknown>,
  counterparts: Record<string, unknown>
): Promise<void> {
  const config = AUDITED_RECORDS[entityType];
  if (!config) throw new Error(`Undo is not supported for ${entityType}.`);
  const row = await delegate(config).findUnique({ where: { [config.key]: entityId } });
  if (!row) throw new Error("The record no longer exists.");
  const id = String(row.id);

  const data: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(values)) {
    if (field === IMAGES_FIELD || field === TAGS_FIELD) continue;
    data[field] = toWritable(value, counterparts[field]);
  }

  const operations: Prisma.PrismaPromise<unknown>[] = [];
  if (Object.keys(data).length > 0) {
    operations.push(delegate(config).update({ where: { id }, data }) as Prisma.PrismaPromise<unknown>);
  }
  if (IMAGES_FIELD in values) {
    const images = (values[IMAGES_FIELD] as { mediaId: string; mobileMediaId: string | null; sortOrder: number }[]) ?? [];
    operations.push(prisma.vehicleImage.deleteMany({ where: { vehicleId: id } }));
    if (images.length > 0) {
      operations.push(prisma.vehicleImage.createMany({ data: images.map((img) => ({ ...img, vehicleId: id })) }));
    }
  }
  if (TAGS_FIELD in values) {
    const tagIds = (values[TAGS_FIELD] as string[]) ?? [];
    operations.push(prisma.blogPostTag.deleteMany({ where: { blogPostId: id } }));
    if (tagIds.length > 0) {
      operations.push(prisma.blogPostTag.createMany({ data: tagIds.map((tagId) => ({ blogPostId: id, tagId })) }));
    }
  }
  await prisma.$transaction(operations);
}

/** Recreates a hard-deleted row from its stored snapshot. */
export async function recreateRecord(entityType: string, record: Snapshot): Promise<void> {
  const config = AUDITED_RECORDS[entityType];
  if (!config) throw new Error(`Undo is not supported for ${entityType}.`);
  const data: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(record)) {
    if (field === IMAGES_FIELD || field === TAGS_FIELD) continue;
    data[field] = value === null ? undefined : value;
  }
  await delegate(config).create({ data });
}

/** Removes a record that an undone "create" added: soft delete where the model has it. */
export async function removeCreatedRecord(entityType: string, entityId: string): Promise<void> {
  const config = AUDITED_RECORDS[entityType];
  if (!config) throw new Error(`Undo is not supported for ${entityType}.`);
  if (config.softDelete) {
    await delegate(config).update({ where: { [config.key]: entityId }, data: { deletedAt: new Date() } });
  } else {
    await delegate(config).delete({ where: { [config.key]: entityId } });
  }
}

/** A short human name for a snapshot, for the log and the daily email. */
export function snapshotLabel(snapshot: Snapshot | null): string | null {
  if (!snapshot) return null;
  for (const key of ["name", "title", "page", "slug", "key", "originalFilename", "companyName"]) {
    const value = snapshot[key];
    if (typeof value === "string" && value) return value;
    if (value && typeof value === "object" && "en" in value && typeof (value as { en: unknown }).en === "string") {
      return (value as { en: string }).en;
    }
  }
  return null;
}
