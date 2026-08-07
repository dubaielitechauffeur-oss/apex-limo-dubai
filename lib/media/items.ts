import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import { Prisma, type ImageVariant, type MediaType, type StorageProvider } from "@/lib/generated/prisma/client";
import { routing, type Locale } from "@/i18n/routing";
import { requireMediaPermission } from "./guard";
import { validateUpload, sanitizeOriginalFilename } from "./validation";
import { generateStorageKey } from "./keys";
import { readImageDimensions } from "./dimensions";
import { getStorageDriver, getDefaultStorageProvider } from "./storage";

export type LocalizedText = Partial<Record<Locale, string>>;

export interface MediaListItem {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: LocalizedText;
  type: MediaType;
  variant: ImageVariant | null;
  storageProvider: StorageProvider;
  url: string;
  folderId: string | null;
  folderName: string | null;
  uploadedByName: string | null;
  createdAt: Date;
}

export interface ListMediaParams {
  q?: string;
  /** `"root"` filters to items with no folder; a folder id filters to that
   *  folder; omitted means "every folder" (no filter). */
  folderId?: string;
  type?: MediaType;
  variant?: ImageVariant;
  storageProvider?: StorageProvider;
  sort?: "createdAt" | "filename" | "sizeBytes";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface MediaListResult {
  items: MediaListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 24;

function toListItem(row: {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: Prisma.JsonValue;
  type: MediaType;
  variant: ImageVariant | null;
  storageProvider: StorageProvider;
  url: string;
  folderId: string | null;
  folder: { name: string } | null;
  uploadedBy: { name: string } | null;
  createdAt: Date;
}): MediaListItem {
  return {
    id: row.id,
    filename: row.filename,
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    alt: (row.alt ?? {}) as LocalizedText,
    type: row.type,
    variant: row.variant,
    storageProvider: row.storageProvider,
    url: row.url,
    folderId: row.folderId,
    folderName: row.folder?.name ?? null,
    uploadedByName: row.uploadedBy?.name ?? null,
    createdAt: row.createdAt,
  };
}

export async function listMedia(params: ListMediaParams): Promise<RoleAdminResult<MediaListResult>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const sort = params.sort ?? "createdAt";
  const order = params.order ?? "desc";

  const where: Prisma.MediaItemWhereInput = {
    deletedAt: null,
    ...(params.folderId === "root" ? { folderId: null } : params.folderId ? { folderId: params.folderId } : {}),
    ...(params.type ? { type: params.type } : {}),
    ...(params.variant ? { variant: params.variant } : {}),
    ...(params.storageProvider ? { storageProvider: params.storageProvider } : {}),
    ...(params.q
      ? {
          OR: [
            { filename: { contains: params.q, mode: "insensitive" as const } },
            { originalFilename: { contains: params.q, mode: "insensitive" as const } },
            // `alt` is a JSON object of locale -> string; `string_contains`
            // searches its serialized text, which is good enough for an
            // admin search box without a dedicated per-locale query.
            // Postgres's JSON `string_contains` filter doesn't support
            // `mode: "insensitive"` (Prisma issues a `lower(jsonb)` call
            // that Postgres has no overload for) — case-sensitive alt-text
            // matching is an acceptable trade-off here since filename/
            // originalFilename above already cover the primary,
            // case-insensitive search path.
            { alt: { string_contains: params.q } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.mediaItem.count({ where }),
    prisma.mediaItem.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { folder: { select: { name: true } }, uploadedBy: { select: { name: true } } },
    }),
  ]);

  return {
    success: true,
    data: {
      items: rows.map(toListItem),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getMediaItem(id: string): Promise<RoleAdminResult<MediaListItem & { caption: LocalizedText | null; storagePath: string; updatedAt: Date }>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_READ);
  if (!gate.success) return gate;

  const row = await prisma.mediaItem.findFirst({
    where: { id, deletedAt: null },
    include: { folder: { select: { name: true } }, uploadedBy: { select: { name: true } } },
  });
  if (!row) return { success: false, error: "Media item not found." };

  return {
    success: true,
    data: {
      ...toListItem(row),
      caption: (row.caption as LocalizedText | null) ?? null,
      storagePath: row.storagePath,
      updatedAt: row.updatedAt,
    },
  };
}

function emptyLocalizedText(seed?: string): Prisma.InputJsonValue {
  const value: Record<string, string> = {};
  for (const locale of routing.locales) {
    value[locale] = locale === routing.defaultLocale ? (seed ?? "") : "";
  }
  return value;
}

/** Derives a readable default alt text from the original filename (e.g.
 *  "mercedes_s-class-front.jpg" -> "mercedes s class front") so a freshly
 *  uploaded image is never left with empty alt text — the admin can
 *  refine it via `updateMediaMetadata` afterward. */
function altSeedFromFilename(originalFilename: string): string {
  return originalFilename
    .replace(/\.[^./]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

export interface UploadMediaInput {
  buffer: Buffer;
  originalFilename: string;
  folderId?: string | null;
  variant?: ImageVariant | null;
}

export async function uploadMedia(input: UploadMediaInput): Promise<RoleAdminResult<MediaListItem>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_CREATE);
  if (!gate.success) return gate;

  const validation = validateUpload(input.buffer);
  if (!validation.ok) return { success: false, error: validation.error };

  if (input.folderId) {
    const folder = await prisma.mediaFolder.findUnique({ where: { id: input.folderId } });
    if (!folder) return { success: false, error: "Selected folder not found." };
  }

  const originalFilename = sanitizeOriginalFilename(input.originalFilename);
  const dimensions = readImageDimensions(input.buffer);
  const storageKey = generateStorageKey(validation.extension);
  const storageProvider = getDefaultStorageProvider();
  const driver = getStorageDriver(storageProvider);

  const stored = await driver.save({ key: storageKey, buffer: input.buffer, contentType: validation.mimeType });

  const created = await prisma.mediaItem.create({
    data: {
      filename: storageKey.split("/").pop()!,
      originalFilename,
      mimeType: validation.mimeType,
      sizeBytes: input.buffer.length,
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
      alt: emptyLocalizedText(altSeedFromFilename(originalFilename)),
      type: "image",
      variant: input.variant ?? null,
      storageProvider,
      storagePath: stored.storagePath,
      url: stored.url,
      folderId: input.folderId ?? null,
      uploadedById: gate.data.userId,
    },
    include: { folder: { select: { name: true } }, uploadedBy: { select: { name: true } } },
  });

  await writeAuditLog({
    action: "create",
    entityType: "media_item",
    entityId: created.id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "upload", originalFilename, mimeType: validation.mimeType, sizeBytes: input.buffer.length }],
  });

  return { success: true, data: toListItem(created) };
}

export interface UpdateMediaMetadataInput {
  alt?: LocalizedText;
  caption?: LocalizedText | null;
  folderId?: string | null;
  variant?: ImageVariant | null;
}

export async function updateMediaMetadata(id: string, input: UpdateMediaMetadataInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.mediaItem.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Media item not found." };

  if (input.folderId) {
    const folder = await prisma.mediaFolder.findUnique({ where: { id: input.folderId } });
    if (!folder) return { success: false, error: "Selected folder not found." };
  }

  await prisma.mediaItem.update({
    where: { id },
    data: {
      ...(input.alt !== undefined ? { alt: input.alt as Prisma.InputJsonValue } : {}),
      ...(input.caption !== undefined
        ? { caption: input.caption === null ? Prisma.NullableJsonNullValueInput.JsonNull : (input.caption as Prisma.InputJsonValue) }
        : {}),
      ...(input.folderId !== undefined ? { folderId: input.folderId } : {}),
      ...(input.variant !== undefined ? { variant: input.variant } : {}),
    },
  });

  await writeAuditLog({
    action: "update",
    entityType: "media_item",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "metadata", updated: Object.keys(input) }],
  });

  return { success: true, data: { id } };
}

export interface MediaUsageRef {
  source: string;
  entityId: string;
  label: string;
}

/**
 * Reverse-lookup across every FK relation MediaItem currently has, exactly
 * as specified in DATABASE_ARCHITECTURE.md §7 ("Usage Tracking") — no
 * separate tracking table, computed fresh at delete time. `Location` and
 * `Service` currently store image URLs as plain strings rather than a
 * MediaItem FK (a pre-existing architectural gap, not something this phase
 * changes — see MEDIA_LIBRARY.md), so they can't be included here yet.
 */
export async function findMediaUsage(id: string): Promise<MediaUsageRef[]> {
  // Gated independently, same as every other exported function here —
  // `deleteMedia` already checks `media:delete` before calling this, but
  // this function is also called directly from the detail page (to show
  // "used in N places" before the admin even opens the delete dialog), so
  // it must not assume it's only ever reached through an already-gated path.
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_READ);
  if (!gate.success) return [];

  const [vehicleImages, blogPosts, heroDesktop, heroMobile, brands, settingsLogo, settingsFavicon] = await Promise.all([
    prisma.vehicleImage.findMany({ where: { mediaId: id }, select: { vehicleId: true } }),
    prisma.blogPost.findMany({ where: { featuredImageId: id }, select: { id: true } }),
    prisma.heroSlide.findMany({ where: { desktopImageId: id }, select: { id: true } }),
    prisma.heroSlide.findMany({ where: { mobileImageId: id }, select: { id: true } }),
    prisma.brand.findMany({ where: { logoId: id }, select: { id: true, name: true } }),
    prisma.globalSettings.findMany({ where: { logoId: id }, select: { id: true } }),
    prisma.globalSettings.findMany({ where: { faviconId: id }, select: { id: true } }),
  ]);

  return [
    ...vehicleImages.map((r) => ({ source: "vehicle_image", entityId: r.vehicleId, label: "Vehicle gallery image" })),
    ...blogPosts.map((r) => ({ source: "blog_featured_image", entityId: r.id, label: "Blog post featured image" })),
    ...heroDesktop.map((r) => ({ source: "hero_desktop_image", entityId: r.id, label: "Homepage hero (desktop)" })),
    ...heroMobile.map((r) => ({ source: "hero_mobile_image", entityId: r.id, label: "Homepage hero (mobile)" })),
    ...brands.map((r) => ({ source: "brand_logo", entityId: r.id, label: `Brand logo (${r.name})` })),
    ...settingsLogo.map((r) => ({ source: "settings_logo", entityId: r.id, label: "Site logo (Settings)" })),
    ...settingsFavicon.map((r) => ({ source: "settings_favicon", entityId: r.id, label: "Site favicon (Settings)" })),
  ];
}

/**
 * Soft-deletes a media item (schema-approved strategy — see
 * DATABASE_ARCHITECTURE.md §7: soft delete "ensures the reference stays
 * valid until all usages are cleaned up"). Never physically removes the
 * stored file: every FK to MediaItem is `onDelete: SetNull`, but a
 * *soft*-deleted row is never actually deleted, so any entity still
 * referencing this id keeps rendering the real file — it simply disappears
 * from the media library's browse/search results and can't be selected for
 * new usage. A true hard-delete (freeing the physical file) is out of this
 * phase's scope — see MEDIA_LIBRARY.md's "future: trash / hard delete".
 */
export async function deleteMedia(id: string): Promise<RoleAdminResult<{ id: string; usage: MediaUsageRef[] }>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.mediaItem.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Media item not found." };

  const usage = await findMediaUsage(id);

  await prisma.mediaItem.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({
    action: "delete",
    entityType: "media_item",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "originalFilename", before: existing.originalFilename }, { field: "usageAtDeletion", value: usage.length }],
  });

  return { success: true, data: { id, usage } };
}
