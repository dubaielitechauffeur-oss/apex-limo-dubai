import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Prisma, PublishStatus } from "@/lib/generated/prisma/client";
import { requireCmsPermission } from "./guard";
import { isValidSlug } from "./slug";
import { emptyLocalizedText, type LocalizedText } from "./localized";
import { emptySeoMeta, type SeoMeta } from "./seo";

export interface ServiceListItem {
  id: string;
  slug: string;
  name: string;
  status: PublishStatus;
  sortOrder: number;
  updatedAt: Date;
}

export interface ServiceDetail {
  id: string;
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  heroSubtitle: LocalizedText;
  shortDescription: LocalizedText;
  longDescription: LocalizedText;
  benefits: LocalizedText;
  whyChoose: LocalizedText;
  tags: LocalizedText;
  ratingMetricValue: string;
  ratingMetricLabel: LocalizedText;
  imageId: string | null;
  seo: SeoMeta;
  status: PublishStatus;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceInput {
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  heroSubtitle: LocalizedText;
  shortDescription: LocalizedText;
  longDescription: LocalizedText;
  benefits: LocalizedText;
  whyChoose: LocalizedText;
  tags: LocalizedText;
  ratingMetricValue: string;
  ratingMetricLabel: LocalizedText;
  imageId: string | null;
  seo: SeoMeta;
  status: PublishStatus;
  sortOrder: number;
}

export interface ListServicesParams {
  q?: string;
  status?: PublishStatus;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListServicesResult {
  items: ServiceListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;

/** Splits a textarea's lines into a trimmed, non-empty string array — the
 *  admin-form representation of `Localized<string[]>` fields (benefits,
 *  whyChoose, tags) matching `data/services.ts`'s existing shape. */
function linesToArray(text: string): string[] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}
function arrayToLines(value: unknown): string {
  return Array.isArray(value) ? value.join("\n") : "";
}
/** `longDescription` is paragraphs (blank-line separated), not single lines. */
function paragraphsToArray(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
function arrayToParagraphs(value: unknown): string {
  return Array.isArray(value) ? value.join("\n\n") : "";
}

function localizedArrayField(value: LocalizedText, toArray: (text: string) => string[]): Prisma.InputJsonValue {
  const out: Record<string, string[]> = {};
  for (const [locale, text] of Object.entries(value)) out[locale] = toArray(text);
  return out;
}
function jsonToLocalizedText(value: unknown, toText: (arr: unknown) => string): LocalizedText {
  const result = emptyLocalizedText();
  if (value && typeof value === "object") {
    for (const [locale, arr] of Object.entries(value as Record<string, unknown>)) {
      if (locale in result) result[locale as keyof LocalizedText] = toText(arr);
    }
  }
  return result;
}

function toListItem(row: { id: string; slug: string; name: Prisma.JsonValue; status: PublishStatus; sortOrder: number; updatedAt: Date }): ServiceListItem {
  const name = row.name as LocalizedText | null;
  return { id: row.id, slug: row.slug, name: name?.en ?? row.slug, status: row.status, sortOrder: row.sortOrder, updatedAt: row.updatedAt };
}

export async function listServices(params: ListServicesParams): Promise<RoleAdminResult<ListServicesResult>> {
  const gate = await requireCmsPermission(PERMISSIONS.SERVICES_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.ServiceWhereInput = {
    ...(params.includeDeleted ? {} : { deletedAt: null }),
    ...(params.status ? { status: params.status } : {}),
    ...(params.q
      ? { OR: [{ slug: { contains: params.q, mode: "insensitive" as const } }, { name: { string_contains: params.q } }] }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, slug: true, name: true, status: true, sortOrder: true, updatedAt: true },
    }),
  ]);

  return { success: true, data: { items: rows.map(toListItem), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getService(id: string): Promise<RoleAdminResult<ServiceDetail>> {
  const gate = await requireCmsPermission(PERMISSIONS.SERVICES_READ);
  if (!gate.success) return gate;

  const row = await prisma.service.findFirst({ where: { id, deletedAt: null } });
  if (!row) return { success: false, error: "Service not found." };

  const ratingMetric = (row.ratingMetric as { value?: string; label?: LocalizedText } | null) ?? {};

  return {
    success: true,
    data: {
      id: row.id,
      slug: row.slug,
      name: (row.name as LocalizedText | null) ?? emptyLocalizedText(),
      tagline: (row.tagline as LocalizedText | null) ?? emptyLocalizedText(),
      heroSubtitle: (row.heroSubtitle as LocalizedText | null) ?? emptyLocalizedText(),
      shortDescription: (row.shortDescription as LocalizedText | null) ?? emptyLocalizedText(),
      longDescription: jsonToLocalizedText(row.longDescription, arrayToParagraphs),
      benefits: jsonToLocalizedText(row.benefits, arrayToLines),
      whyChoose: jsonToLocalizedText(row.whyChoose, arrayToLines),
      tags: jsonToLocalizedText(row.tags, arrayToLines),
      ratingMetricValue: ratingMetric.value ?? "",
      ratingMetricLabel: ratingMetric.label ?? emptyLocalizedText(),
      imageId: row.imageId,
      seo: (row.seo as unknown as SeoMeta | null) ?? emptySeoMeta(),
      status: row.status,
      sortOrder: row.sortOrder,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  };
}

async function assertSlugAvailable(slug: string, excludeId?: string): Promise<string | null> {
  if (!isValidSlug(slug)) return "Slug must be lowercase letters, numbers, and hyphens only.";
  const existing = await prisma.service.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== excludeId) return "This slug is already in use by another service.";
  return null;
}

function buildData(input: ServiceInput): Prisma.ServiceUncheckedCreateInput {
  return {
    slug: input.slug,
    name: input.name as Prisma.InputJsonValue,
    tagline: input.tagline as Prisma.InputJsonValue,
    heroSubtitle: input.heroSubtitle as Prisma.InputJsonValue,
    shortDescription: input.shortDescription as Prisma.InputJsonValue,
    longDescription: localizedArrayField(input.longDescription, paragraphsToArray),
    benefits: localizedArrayField(input.benefits, linesToArray),
    whyChoose: localizedArrayField(input.whyChoose, linesToArray),
    tags: localizedArrayField(input.tags, linesToArray),
    ratingMetric: { value: input.ratingMetricValue, label: input.ratingMetricLabel } as Prisma.InputJsonValue,
    imageId: input.imageId,
    seo: input.seo as unknown as Prisma.InputJsonValue,
    status: input.status,
    sortOrder: input.sortOrder,
    publishedAt: input.status === "published" ? new Date() : null,
  };
}

export async function createService(input: ServiceInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.SERVICES_CREATE);
  if (!gate.success) return gate;

  const slugError = await assertSlugAvailable(input.slug);
  if (slugError) return { success: false, error: slugError };
  if (!input.name.en.trim()) return { success: false, error: "English name is required." };

  const created = await prisma.service.create({ data: buildData(input) });
  await writeAuditLog({
    action: "create",
    entityType: "service",
    entityId: created.id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "slug", after: created.slug }],
  });

  return { success: true, data: { id: created.id } };
}

export async function updateService(id: string, input: ServiceInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.SERVICES_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.service.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Service not found." };

  const slugError = await assertSlugAvailable(input.slug, id);
  if (slugError) return { success: false, error: slugError };
  if (!input.name.en.trim()) return { success: false, error: "English name is required." };

  const wasPublished = existing.status === "published";
  const willBePublished = input.status === "published";
  const data = buildData(input);
  // Preserve the original publish timestamp across edits; only stamp it the
  // moment status first transitions into "published".
  data.publishedAt = willBePublished ? (existing.publishedAt ?? new Date()) : wasPublished ? existing.publishedAt : null;

  await prisma.service.update({ where: { id }, data });
  await writeAuditLog({
    action: "update",
    entityType: "service",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "slug", before: existing.slug, after: input.slug }],
  });

  return { success: true, data: { id } };
}

export async function setServiceStatus(id: string, status: PublishStatus): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.SERVICES_PUBLISH);
  if (!gate.success) return gate;

  const existing = await prisma.service.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Service not found." };

  await prisma.service.update({
    where: { id },
    data: { status, publishedAt: status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt },
  });
  await writeAuditLog({
    action: status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish",
    entityType: "service",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "status", before: existing.status, after: status }],
  });

  return { success: true, data: { id } };
}

export async function softDeleteService(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.SERVICES_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.service.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Service not found." };

  await prisma.service.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({
    action: "delete",
    entityType: "service",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "slug", before: existing.slug }],
  });

  return { success: true, data: { id } };
}

export async function restoreService(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.SERVICES_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing || !existing.deletedAt) return { success: false, error: "Service not found or not deleted." };

  await prisma.service.update({ where: { id }, data: { deletedAt: null } });
  await writeAuditLog({
    action: "restore",
    entityType: "service",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "slug", after: existing.slug }],
  });

  return { success: true, data: { id } };
}
