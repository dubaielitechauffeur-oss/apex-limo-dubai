import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Prisma, PublishStatus } from "@/lib/generated/prisma/client";
import { requireCmsPermission } from "./guard";
import { isValidSlug } from "./slug";
import { emptyLocalizedText, type LocalizedText } from "./localized";
import { emptySeoMeta, type SeoMeta } from "./seo";

// ── Vehicle categories ──────────────────────────────────────────────────

export interface VehicleCategoryItem {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  sortOrder: number;
  vehicleCount: number;
}

export interface VehicleCategoryInput {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  sortOrder: number;
}

export async function listVehicleCategories(): Promise<RoleAdminResult<VehicleCategoryItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_READ);
  if (!gate.success) return gate;

  const rows = await prisma.vehicleCategory.findMany({
    orderBy: [{ sortOrder: "asc" }],
    include: { _count: { select: { vehicles: true } } },
  });

  return {
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: (r.name as LocalizedText | null) ?? emptyLocalizedText(),
      description: (r.description as LocalizedText | null) ?? emptyLocalizedText(),
      sortOrder: r.sortOrder,
      vehicleCount: r._count.vehicles,
    })),
  };
}

export async function createVehicleCategory(input: VehicleCategoryInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_CREATE);
  if (!gate.success) return gate;

  if (!isValidSlug(input.slug)) return { success: false, error: "Slug must be lowercase letters, numbers, and hyphens only." };
  if (!input.name.en.trim()) return { success: false, error: "English name is required." };

  const existing = await prisma.vehicleCategory.findUnique({ where: { slug: input.slug } });
  if (existing) return { success: false, error: "This slug is already in use." };

  const created = await prisma.vehicleCategory.create({
    data: {
      slug: input.slug,
      name: input.name as Prisma.InputJsonValue,
      description: input.description as Prisma.InputJsonValue,
      sortOrder: input.sortOrder,
    },
  });
  await writeAuditLog({ action: "create", entityType: "vehicle_category", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", after: created.slug }] });

  return { success: true, data: { id: created.id } };
}

export async function updateVehicleCategory(id: string, input: VehicleCategoryInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.vehicleCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Category not found." };
  if (!isValidSlug(input.slug)) return { success: false, error: "Slug must be lowercase letters, numbers, and hyphens only." };

  const slugOwner = await prisma.vehicleCategory.findUnique({ where: { slug: input.slug } });
  if (slugOwner && slugOwner.id !== id) return { success: false, error: "This slug is already in use." };

  await prisma.vehicleCategory.update({
    where: { id },
    data: {
      slug: input.slug,
      name: input.name as Prisma.InputJsonValue,
      description: input.description as Prisma.InputJsonValue,
      sortOrder: input.sortOrder,
    },
  });
  await writeAuditLog({ action: "update", entityType: "vehicle_category", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug, after: input.slug }] });

  return { success: true, data: { id } };
}

export async function deleteVehicleCategory(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.vehicleCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Category not found." };

  const vehicleCount = await prisma.vehicle.count({ where: { categoryId: id } });
  if (vehicleCount > 0) {
    return { success: false, error: `This category has ${vehicleCount} vehicle(s) — reassign or delete them first.` };
  }

  await prisma.vehicleCategory.delete({ where: { id } });
  await writeAuditLog({ action: "delete", entityType: "vehicle_category", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug }] });

  return { success: true, data: { id } };
}

// ── Vehicles ─────────────────────────────────────────────────────────────

export interface VehicleListItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  categoryId: string;
  categoryName: string;
  status: PublishStatus;
  isFeatured: boolean;
  isElectric: boolean;
  passengers: number;
  luggage: number;
  sortOrder: number;
  primaryImageUrl: string | null;
  updatedAt: Date;
}

export interface VehicleRatesInput {
  tenHours: number;
  fiveHours: number;
  oneHour: number;
  airport: number;
  extraHour: number;
  additionalCity: number;
}

export interface VehicleDetail {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  categoryId: string;
  isElectric: boolean;
  isFeatured: boolean;
  isPlaceholder: boolean;
  tagline: LocalizedText;
  description: LocalizedText;
  longDescription: LocalizedText;
  idealFor: LocalizedText;
  features: LocalizedText;
  whyChoose: LocalizedText;
  badge: LocalizedText;
  passengers: number;
  luggage: number;
  rates: VehicleRatesInput;
  images: { id: string; mediaId: string; url: string; alt: string; sortOrder: number }[];
  seo: SeoMeta;
  status: PublishStatus;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleInput {
  slug: string;
  name: string;
  brand: string;
  model: string;
  categoryId: string;
  isElectric: boolean;
  isFeatured: boolean;
  isPlaceholder: boolean;
  tagline: LocalizedText;
  description: LocalizedText;
  longDescription: LocalizedText;
  idealFor: LocalizedText;
  features: LocalizedText;
  whyChoose: LocalizedText;
  badge: LocalizedText;
  passengers: number;
  luggage: number;
  rates: VehicleRatesInput;
  imageIds: string[];
  seo: SeoMeta;
  status: PublishStatus;
  sortOrder: number;
}

export interface ListVehiclesParams {
  q?: string;
  categoryId?: string;
  status?: PublishStatus;
  featuredOnly?: boolean;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListVehiclesResult {
  items: VehicleListItem[];
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
  id: string; slug: string; name: string; brand: string; model: string; categoryId: string;
  status: PublishStatus; isFeatured: boolean; isElectric: boolean; passengers: number; luggage: number;
  sortOrder: number; updatedAt: Date;
  category: { name: Prisma.JsonValue };
  images: { media: { url: string } }[];
}): VehicleListItem {
  return {
    id: row.id, slug: row.slug, name: row.name, brand: row.brand, model: row.model,
    categoryId: row.categoryId, categoryName: (row.category.name as LocalizedText | null)?.en ?? "",
    status: row.status, isFeatured: row.isFeatured, isElectric: row.isElectric,
    passengers: row.passengers, luggage: row.luggage, sortOrder: row.sortOrder,
    primaryImageUrl: row.images[0]?.media.url ?? null, updatedAt: row.updatedAt,
  };
}

export async function listVehicles(params: ListVehiclesParams): Promise<RoleAdminResult<ListVehiclesResult>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.VehicleWhereInput = {
    ...(params.includeDeleted ? {} : { deletedAt: null }),
    ...(params.status ? { status: params.status } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.featuredOnly ? { isFeatured: true } : {}),
    ...(params.q
      ? {
          OR: [
            { slug: { contains: params.q, mode: "insensitive" as const } },
            { name: { contains: params.q, mode: "insensitive" as const } },
            { brand: { contains: params.q, mode: "insensitive" as const } },
            { model: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, include: { media: { select: { url: true } } } },
      },
    }),
  ]);

  return { success: true, data: { items: rows.map(toListItem), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getVehicle(id: string): Promise<RoleAdminResult<VehicleDetail>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_READ);
  if (!gate.success) return gate;

  const row = await prisma.vehicle.findFirst({
    where: { id, deletedAt: null },
    include: { images: { orderBy: { sortOrder: "asc" }, include: { media: { select: { url: true, alt: true } } } } },
  });
  if (!row) return { success: false, error: "Vehicle not found." };

  const rates = (row.rates as unknown as VehicleRatesInput | null) ?? {
    tenHours: 0, fiveHours: 0, oneHour: 0, airport: 0, extraHour: 0, additionalCity: 0,
  };

  return {
    success: true,
    data: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      brand: row.brand,
      model: row.model,
      categoryId: row.categoryId,
      isElectric: row.isElectric,
      isFeatured: row.isFeatured,
      isPlaceholder: row.isPlaceholder,
      tagline: (row.tagline as LocalizedText | null) ?? emptyLocalizedText(),
      description: (row.description as LocalizedText | null) ?? emptyLocalizedText(),
      longDescription: (row.longDescription as LocalizedText | null) ?? emptyLocalizedText(),
      idealFor: (row.idealFor as LocalizedText | null) ?? emptyLocalizedText(),
      features: jsonToLocalizedText(row.features, arrayToLines),
      whyChoose: jsonToLocalizedText(row.whyChoose, arrayToLines),
      badge: (row.badge as LocalizedText | null) ?? emptyLocalizedText(),
      passengers: row.passengers,
      luggage: row.luggage,
      rates,
      images: row.images.map((img) => ({ id: img.id, mediaId: img.mediaId, url: img.media.url, alt: (img.media.alt as LocalizedText | null)?.en ?? "", sortOrder: img.sortOrder })),
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
  const existing = await prisma.vehicle.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== excludeId) return "This slug is already in use by another vehicle.";
  return null;
}

async function assertCategoryExists(categoryId: string): Promise<string | null> {
  const category = await prisma.vehicleCategory.findUnique({ where: { id: categoryId } });
  return category ? null : "Selected category does not exist.";
}

async function assertImagesExist(imageIds: string[]): Promise<string | null> {
  if (imageIds.length === 0) return null;
  const count = await prisma.mediaItem.count({ where: { id: { in: imageIds }, deletedAt: null } });
  return count === imageIds.length ? null : "One or more selected images could not be found.";
}

function buildData(input: VehicleInput): Omit<Prisma.VehicleUncheckedCreateInput, "images"> {
  return {
    slug: input.slug,
    name: input.name,
    brand: input.brand,
    model: input.model,
    categoryId: input.categoryId,
    isElectric: input.isElectric,
    isFeatured: input.isFeatured,
    isPlaceholder: input.isPlaceholder,
    tagline: input.tagline as Prisma.InputJsonValue,
    description: input.description as Prisma.InputJsonValue,
    longDescription: input.longDescription as Prisma.InputJsonValue,
    idealFor: input.idealFor as Prisma.InputJsonValue,
    features: localizedArrayField(input.features, linesToArray),
    whyChoose: localizedArrayField(input.whyChoose, linesToArray),
    badge: (Object.values(input.badge).some((v) => v.trim()) ? input.badge : null) as Prisma.InputJsonValue,
    passengers: input.passengers,
    luggage: input.luggage,
    rates: input.rates as unknown as Prisma.InputJsonValue,
    seo: input.seo as unknown as Prisma.InputJsonValue,
    status: input.status,
    sortOrder: input.sortOrder,
    publishedAt: input.status === "published" ? new Date() : null,
  };
}

function validateVehicleInput(input: VehicleInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (!input.brand.trim()) return "Brand is required.";
  if (!input.model.trim()) return "Model is required.";
  if (!input.description.en.trim()) return "English description is required.";
  if (input.passengers < 1) return "Passenger capacity must be at least 1.";
  if (input.luggage < 0) return "Luggage capacity cannot be negative.";
  return null;
}

export async function createVehicle(input: VehicleInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_CREATE);
  if (!gate.success) return gate;

  const slugError = await assertSlugAvailable(input.slug);
  if (slugError) return { success: false, error: slugError };
  const inputError = validateVehicleInput(input);
  if (inputError) return { success: false, error: inputError };
  const categoryError = await assertCategoryExists(input.categoryId);
  if (categoryError) return { success: false, error: categoryError };
  const imagesError = await assertImagesExist(input.imageIds);
  if (imagesError) return { success: false, error: imagesError };

  const created = await prisma.vehicle.create({
    data: {
      ...buildData(input),
      images: { create: input.imageIds.map((mediaId, index) => ({ mediaId, sortOrder: index })) },
    },
  });
  await writeAuditLog({ action: "create", entityType: "vehicle", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", after: created.slug }] });

  return { success: true, data: { id: created.id } };
}

export async function updateVehicle(id: string, input: VehicleInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.vehicle.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Vehicle not found." };

  const slugError = await assertSlugAvailable(input.slug, id);
  if (slugError) return { success: false, error: slugError };
  const inputError = validateVehicleInput(input);
  if (inputError) return { success: false, error: inputError };
  const categoryError = await assertCategoryExists(input.categoryId);
  if (categoryError) return { success: false, error: categoryError };
  const imagesError = await assertImagesExist(input.imageIds);
  if (imagesError) return { success: false, error: imagesError };

  const wasPublished = existing.status === "published";
  const willBePublished = input.status === "published";
  const data = buildData(input);
  data.publishedAt = willBePublished ? (existing.publishedAt ?? new Date()) : wasPublished ? existing.publishedAt : null;

  await prisma.$transaction([
    prisma.vehicleImage.deleteMany({ where: { vehicleId: id } }),
    prisma.vehicle.update({
      where: { id },
      data: { ...data, images: { create: input.imageIds.map((mediaId, index) => ({ mediaId, sortOrder: index })) } },
    }),
  ]);
  await writeAuditLog({ action: "update", entityType: "vehicle", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug, after: input.slug }] });

  return { success: true, data: { id } };
}

export async function setVehicleStatus(id: string, status: PublishStatus): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_PUBLISH);
  if (!gate.success) return gate;

  const existing = await prisma.vehicle.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Vehicle not found." };

  await prisma.vehicle.update({ where: { id }, data: { status, publishedAt: status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt } });
  await writeAuditLog({
    action: status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish",
    entityType: "vehicle", entityId: id, userId: gate.data.userId, userName: gate.data.roleName,
    changes: [{ field: "status", before: existing.status, after: status }],
  });

  return { success: true, data: { id } };
}

export async function softDeleteVehicle(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.vehicle.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Vehicle not found." };

  await prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({ action: "delete", entityType: "vehicle", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug }] });

  return { success: true, data: { id } };
}

export async function restoreVehicle(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FLEET_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing || !existing.deletedAt) return { success: false, error: "Vehicle not found or not deleted." };

  await prisma.vehicle.update({ where: { id }, data: { deletedAt: null } });
  await writeAuditLog({ action: "restore", entityType: "vehicle", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", after: existing.slug }] });

  return { success: true, data: { id } };
}
