import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Prisma, PublishStatus } from "@/lib/generated/prisma/client";
import { requireCmsPermission } from "./guard";
import { emptyLocalizedText, type LocalizedText } from "./localized";

// ── Hero Slides ──────────────────────────────────────────────────────────

export interface HeroCta {
  label: LocalizedText;
  href: string;
}

export interface HeroSlideItem {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  desktopImageId: string | null;
  mobileImageId: string | null;
  ctas: HeroCta[];
  status: PublishStatus;
  sortOrder: number;
}

export interface HeroSlideInput {
  title: LocalizedText;
  subtitle: LocalizedText;
  desktopImageId: string | null;
  mobileImageId: string | null;
  ctas: HeroCta[];
  status: PublishStatus;
  sortOrder: number;
}

function toHeroSlideItem(row: { id: string; title: Prisma.JsonValue; subtitle: Prisma.JsonValue | null; desktopImageId: string | null; mobileImageId: string | null; ctas: Prisma.JsonValue | null; status: PublishStatus; sortOrder: number }): HeroSlideItem {
  return {
    id: row.id,
    title: (row.title as LocalizedText | null) ?? emptyLocalizedText(),
    subtitle: (row.subtitle as LocalizedText | null) ?? emptyLocalizedText(),
    desktopImageId: row.desktopImageId,
    mobileImageId: row.mobileImageId,
    ctas: Array.isArray(row.ctas) ? (row.ctas as unknown as HeroCta[]) : [],
    status: row.status,
    sortOrder: row.sortOrder,
  };
}

export async function listHeroSlides(): Promise<RoleAdminResult<HeroSlideItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_READ);
  if (!gate.success) return gate;
  const rows = await prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }] });
  return { success: true, data: rows.map(toHeroSlideItem) };
}

export async function createHeroSlide(input: HeroSlideInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_CREATE);
  if (!gate.success) return gate;
  if (!input.title.en.trim()) return { success: false, error: "English title is required." };

  const created = await prisma.heroSlide.create({
    data: {
      title: input.title as Prisma.InputJsonValue,
      subtitle: input.subtitle as Prisma.InputJsonValue,
      desktopImageId: input.desktopImageId,
      mobileImageId: input.mobileImageId,
      ctas: input.ctas as unknown as Prisma.InputJsonValue,
      status: input.status,
      sortOrder: input.sortOrder,
    },
  });
  await writeAuditLog({ action: "create", entityType: "hero_slide", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "title", after: input.title.en }] });
  return { success: true, data: { id: created.id } };
}

export async function updateHeroSlide(id: string, input: HeroSlideInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_UPDATE);
  if (!gate.success) return gate;
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Hero slide not found." };
  if (!input.title.en.trim()) return { success: false, error: "English title is required." };

  await prisma.heroSlide.update({
    where: { id },
    data: {
      title: input.title as Prisma.InputJsonValue,
      subtitle: input.subtitle as Prisma.InputJsonValue,
      desktopImageId: input.desktopImageId,
      mobileImageId: input.mobileImageId,
      ctas: input.ctas as unknown as Prisma.InputJsonValue,
      status: input.status,
      sortOrder: input.sortOrder,
    },
  });
  await writeAuditLog({ action: "update", entityType: "hero_slide", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "title", after: input.title.en }] });
  return { success: true, data: { id } };
}

export async function setHeroSlideStatus(id: string, status: PublishStatus): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_PUBLISH);
  if (!gate.success) return gate;
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Hero slide not found." };

  await prisma.heroSlide.update({ where: { id }, data: { status } });
  await writeAuditLog({
    action: status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish",
    entityType: "hero_slide", entityId: id, userId: gate.data.userId, userName: gate.data.roleName,
    changes: [{ field: "status", before: existing.status, after: status }],
  });
  return { success: true, data: { id } };
}

export async function deleteHeroSlide(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_DELETE);
  if (!gate.success) return gate;
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Hero slide not found." };

  await prisma.heroSlide.delete({ where: { id } });
  await writeAuditLog({ action: "delete", entityType: "hero_slide", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "title", before: (existing.title as LocalizedText | null)?.en }] });
  return { success: true, data: { id } };
}

// ── Testimonials ─────────────────────────────────────────────────────────
// Schema has no localized fields, no `isActive`, no `deletedAt` — form and
// delete behavior match that exactly rather than inventing fields.

export interface TestimonialItem {
  id: string;
  name: string;
  rating: number;
  text: string;
  serviceUsed: string;
  location: string;
  date: string;
  source: string;
  avatarInitials: string;
  profileUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
}

export type TestimonialInput = Omit<TestimonialItem, "id">;

export async function listTestimonials(): Promise<RoleAdminResult<TestimonialItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_READ);
  if (!gate.success) return gate;
  const rows = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }] });
  return { success: true, data: rows };
}

export async function createTestimonial(input: TestimonialInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_CREATE);
  if (!gate.success) return gate;
  if (!input.name.trim() || !input.text.trim()) return { success: false, error: "Name and testimonial text are required." };
  if (input.rating < 1 || input.rating > 5) return { success: false, error: "Rating must be between 1 and 5." };

  const created = await prisma.testimonial.create({ data: input });
  await writeAuditLog({ action: "create", entityType: "testimonial", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "name", after: input.name }] });
  return { success: true, data: { id: created.id } };
}

export async function updateTestimonial(id: string, input: TestimonialInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_UPDATE);
  if (!gate.success) return gate;
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Testimonial not found." };
  if (!input.name.trim() || !input.text.trim()) return { success: false, error: "Name and testimonial text are required." };
  if (input.rating < 1 || input.rating > 5) return { success: false, error: "Rating must be between 1 and 5." };

  await prisma.testimonial.update({ where: { id }, data: input });
  await writeAuditLog({ action: "update", entityType: "testimonial", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "name", after: input.name }] });
  return { success: true, data: { id } };
}

export async function deleteTestimonial(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_DELETE);
  if (!gate.success) return gate;
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Testimonial not found." };

  await prisma.testimonial.delete({ where: { id } });
  await writeAuditLog({ action: "delete", entityType: "testimonial", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "name", before: existing.name }] });
  return { success: true, data: { id } };
}

// ── Brands ───────────────────────────────────────────────────────────────

export interface BrandItem {
  id: string;
  name: string;
  logoId: string | null;
  sortOrder: number;
}

export interface BrandInput {
  name: string;
  logoId: string | null;
  sortOrder: number;
}

export async function listBrands(): Promise<RoleAdminResult<BrandItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_READ);
  if (!gate.success) return gate;
  const rows = await prisma.brand.findMany({ orderBy: [{ sortOrder: "asc" }] });
  return { success: true, data: rows.map((r) => ({ id: r.id, name: r.name, logoId: r.logoId, sortOrder: r.sortOrder })) };
}

export async function createBrand(input: BrandInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_CREATE);
  if (!gate.success) return gate;
  if (!input.name.trim()) return { success: false, error: "Name is required." };

  const existing = await prisma.brand.findUnique({ where: { name: input.name } });
  if (existing) return { success: false, error: "A brand with this name already exists." };

  const created = await prisma.brand.create({ data: { name: input.name, logoId: input.logoId, sortOrder: input.sortOrder } });
  await writeAuditLog({ action: "create", entityType: "brand", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "name", after: input.name }] });
  return { success: true, data: { id: created.id } };
}

export async function updateBrand(id: string, input: BrandInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_UPDATE);
  if (!gate.success) return gate;
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Brand not found." };
  if (!input.name.trim()) return { success: false, error: "Name is required." };

  const nameOwner = await prisma.brand.findUnique({ where: { name: input.name } });
  if (nameOwner && nameOwner.id !== id) return { success: false, error: "A brand with this name already exists." };

  await prisma.brand.update({ where: { id }, data: { name: input.name, logoId: input.logoId, sortOrder: input.sortOrder } });
  await writeAuditLog({ action: "update", entityType: "brand", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "name", before: existing.name, after: input.name }] });
  return { success: true, data: { id } };
}

export async function deleteBrand(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_DELETE);
  if (!gate.success) return gate;
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Brand not found." };

  await prisma.brand.delete({ where: { id } });
  await writeAuditLog({ action: "delete", entityType: "brand", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "name", before: existing.name }] });
  return { success: true, data: { id } };
}
