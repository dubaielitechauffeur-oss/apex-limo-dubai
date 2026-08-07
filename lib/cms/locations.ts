import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Prisma, PublishStatus } from "@/lib/generated/prisma/client";
import { requireCmsPermission } from "./guard";
import { isValidSlug } from "./slug";
import { emptyLocalizedText, type LocalizedText } from "./localized";
import { emptySeoMeta, type SeoMeta } from "./seo";

export interface LocationListItem {
  id: string;
  slug: string;
  name: string;
  status: PublishStatus;
  isAirport: boolean;
  sortOrder: number;
  updatedAt: Date;
}

export interface PopularRouteItem {
  id: string;
  from: LocalizedText;
  to: LocalizedText;
  duration: LocalizedText;
  sortOrder: number;
}

export interface LocationDetail {
  id: string;
  slug: string;
  name: string;
  tagline: LocalizedText;
  heroSubtitle: LocalizedText;
  shortDescription: LocalizedText;
  longDescription: LocalizedText;
  isAirport: boolean;
  landmarks: LocalizedText;
  whyChoose: LocalizedText;
  tags: LocalizedText;
  geoLat: string;
  geoLng: string;
  heroDesktopImageId: string | null;
  heroMobileImageId: string | null;
  seo: SeoMeta;
  status: PublishStatus;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  popularRoutes: PopularRouteItem[];
}

export interface LocationInput {
  slug: string;
  name: string;
  tagline: LocalizedText;
  heroSubtitle: LocalizedText;
  shortDescription: LocalizedText;
  longDescription: LocalizedText;
  isAirport: boolean;
  landmarks: LocalizedText;
  whyChoose: LocalizedText;
  tags: LocalizedText;
  geoLat: string;
  geoLng: string;
  heroDesktopImageId: string | null;
  heroMobileImageId: string | null;
  seo: SeoMeta;
  status: PublishStatus;
  sortOrder: number;
}

export interface ListLocationsParams {
  q?: string;
  status?: PublishStatus;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListLocationsResult {
  items: LocationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;

function linesToArray(text: string): string[] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}
function arrayToLines(value: unknown): string {
  return Array.isArray(value) ? value.join("\n") : "";
}
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

function toListItem(row: {
  id: string; slug: string; name: string; status: PublishStatus; isAirport: boolean; sortOrder: number; updatedAt: Date;
}): LocationListItem {
  return { id: row.id, slug: row.slug, name: row.name, status: row.status, isAirport: row.isAirport, sortOrder: row.sortOrder, updatedAt: row.updatedAt };
}

export async function listLocations(params: ListLocationsParams): Promise<RoleAdminResult<ListLocationsResult>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.LocationWhereInput = {
    ...(params.includeDeleted ? {} : { deletedAt: null }),
    ...(params.status ? { status: params.status } : {}),
    ...(params.q ? { OR: [{ slug: { contains: params.q, mode: "insensitive" as const } }, { name: { contains: params.q, mode: "insensitive" as const } }] } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.location.count({ where }),
    prisma.location.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, slug: true, name: true, status: true, isAirport: true, sortOrder: true, updatedAt: true },
    }),
  ]);

  return { success: true, data: { items: rows.map(toListItem), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getLocation(id: string): Promise<RoleAdminResult<LocationDetail>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_READ);
  if (!gate.success) return gate;

  const row = await prisma.location.findFirst({ where: { id, deletedAt: null }, include: { popularRoutes: { orderBy: { sortOrder: "asc" } } } });
  if (!row) return { success: false, error: "Location not found." };

  const geo = (row.geo as { lat?: number; lng?: number } | null) ?? {};

  return {
    success: true,
    data: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: (row.tagline as LocalizedText | null) ?? emptyLocalizedText(),
      heroSubtitle: (row.heroSubtitle as LocalizedText | null) ?? emptyLocalizedText(),
      shortDescription: (row.shortDescription as LocalizedText | null) ?? emptyLocalizedText(),
      longDescription: jsonToLocalizedText(row.longDescription, arrayToParagraphs),
      isAirport: row.isAirport,
      landmarks: jsonToLocalizedText(row.landmarks, arrayToLines),
      whyChoose: jsonToLocalizedText(row.whyChoose, arrayToLines),
      tags: jsonToLocalizedText(row.tags, arrayToLines),
      geoLat: geo.lat !== undefined ? String(geo.lat) : "",
      geoLng: geo.lng !== undefined ? String(geo.lng) : "",
      heroDesktopImageId: row.heroDesktopImageId,
      heroMobileImageId: row.heroMobileImageId,
      seo: (row.seo as unknown as SeoMeta | null) ?? emptySeoMeta(),
      status: row.status,
      sortOrder: row.sortOrder,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      popularRoutes: row.popularRoutes.map((r) => ({
        id: r.id,
        from: (r.from as LocalizedText | null) ?? emptyLocalizedText(),
        to: (r.to as LocalizedText | null) ?? emptyLocalizedText(),
        duration: (r.duration as LocalizedText | null) ?? emptyLocalizedText(),
        sortOrder: r.sortOrder,
      })),
    },
  };
}

async function assertSlugAvailable(slug: string, excludeId?: string): Promise<string | null> {
  if (!isValidSlug(slug)) return "Slug must be lowercase letters, numbers, and hyphens only.";
  const existing = await prisma.location.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== excludeId) return "This slug is already in use by another location.";
  return null;
}

function buildData(input: LocationInput): Prisma.LocationUncheckedCreateInput {
  const lat = Number(input.geoLat);
  const lng = Number(input.geoLng);
  const geo = input.geoLat && input.geoLng && !Number.isNaN(lat) && !Number.isNaN(lng) ? { lat, lng } : null;

  return {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline as Prisma.InputJsonValue,
    heroSubtitle: input.heroSubtitle as Prisma.InputJsonValue,
    shortDescription: input.shortDescription as Prisma.InputJsonValue,
    longDescription: localizedArrayField(input.longDescription, paragraphsToArray),
    isAirport: input.isAirport,
    landmarks: localizedArrayField(input.landmarks, linesToArray),
    whyChoose: localizedArrayField(input.whyChoose, linesToArray),
    tags: localizedArrayField(input.tags, linesToArray),
    geo: geo as Prisma.InputJsonValue,
    heroDesktopImageId: input.heroDesktopImageId,
    heroMobileImageId: input.heroMobileImageId,
    seo: input.seo as unknown as Prisma.InputJsonValue,
    status: input.status,
    sortOrder: input.sortOrder,
    publishedAt: input.status === "published" ? new Date() : null,
  };
}

export async function createLocation(input: LocationInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_CREATE);
  if (!gate.success) return gate;

  const slugError = await assertSlugAvailable(input.slug);
  if (slugError) return { success: false, error: slugError };
  if (!input.name.trim()) return { success: false, error: "Name is required." };

  const created = await prisma.location.create({ data: buildData(input) });
  await writeAuditLog({ action: "create", entityType: "location", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", after: created.slug }] });

  return { success: true, data: { id: created.id } };
}

export async function updateLocation(id: string, input: LocationInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.location.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Location not found." };

  const slugError = await assertSlugAvailable(input.slug, id);
  if (slugError) return { success: false, error: slugError };
  if (!input.name.trim()) return { success: false, error: "Name is required." };

  const wasPublished = existing.status === "published";
  const willBePublished = input.status === "published";
  const data = buildData(input);
  data.publishedAt = willBePublished ? (existing.publishedAt ?? new Date()) : wasPublished ? existing.publishedAt : null;

  await prisma.location.update({ where: { id }, data });
  await writeAuditLog({ action: "update", entityType: "location", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug, after: input.slug }] });

  return { success: true, data: { id } };
}

export async function setLocationStatus(id: string, status: PublishStatus): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_PUBLISH);
  if (!gate.success) return gate;

  const existing = await prisma.location.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Location not found." };

  await prisma.location.update({ where: { id }, data: { status, publishedAt: status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt } });
  await writeAuditLog({
    action: status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish",
    entityType: "location", entityId: id, userId: gate.data.userId, userName: gate.data.roleName,
    changes: [{ field: "status", before: existing.status, after: status }],
  });

  return { success: true, data: { id } };
}

export async function softDeleteLocation(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.location.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Location not found." };

  await prisma.location.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({ action: "delete", entityType: "location", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug }] });

  return { success: true, data: { id } };
}

export async function restoreLocation(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing || !existing.deletedAt) return { success: false, error: "Location not found or not deleted." };

  await prisma.location.update({ where: { id }, data: { deletedAt: null } });
  await writeAuditLog({ action: "restore", entityType: "location", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", after: existing.slug }] });

  return { success: true, data: { id } };
}

// ── Popular routes ──────────────────────────────────────────────────────

export async function addPopularRoute(
  locationId: string,
  input: { from: string; to: string; duration: string }
): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_UPDATE);
  if (!gate.success) return gate;

  const location = await prisma.location.findFirst({ where: { id: locationId, deletedAt: null } });
  if (!location) return { success: false, error: "Location not found." };
  if (!input.from.trim() || !input.to.trim()) return { success: false, error: "From and To are required." };

  const maxSort = await prisma.locationPopularRoute.aggregate({ where: { locationId }, _max: { sortOrder: true } });
  const route = await prisma.locationPopularRoute.create({
    data: {
      locationId,
      from: emptyLocalizedText(input.from) as Prisma.InputJsonValue,
      to: emptyLocalizedText(input.to) as Prisma.InputJsonValue,
      duration: emptyLocalizedText(input.duration) as Prisma.InputJsonValue,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  return { success: true, data: { id: route.id } };
}

export async function deletePopularRoute(routeId: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.LOCATIONS_UPDATE);
  if (!gate.success) return gate;

  await prisma.locationPopularRoute.delete({ where: { id: routeId } }).catch(() => null);
  return { success: true, data: { id: routeId } };
}
