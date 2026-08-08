import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireCmsPermission } from "./guard";
import { emptyLocalizedText, type LocalizedText } from "./localized";

// ── Categories ───────────────────────────────────────────────────────────

export interface FaqCategoryItem {
  id: string;
  key: string;
  name: LocalizedText;
  showChip: boolean;
  sortOrder: number;
  faqCount: number;
}

export async function listFaqCategories(): Promise<RoleAdminResult<FaqCategoryItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_READ);
  if (!gate.success) return gate;

  const rows = await prisma.faqCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    include: { _count: { select: { faqs: true } } },
  });

  return {
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      key: r.key,
      name: (r.name as LocalizedText | null) ?? emptyLocalizedText(),
      showChip: r.showChip,
      sortOrder: r.sortOrder,
      faqCount: r._count.faqs,
    })),
  };
}

export interface FaqCategoryInput {
  key: string;
  name: LocalizedText;
  showChip: boolean;
  sortOrder: number;
}

const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createFaqCategory(input: FaqCategoryInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_CREATE);
  if (!gate.success) return gate;

  if (!KEY_PATTERN.test(input.key)) return { success: false, error: "Key must be lowercase letters, numbers, and hyphens only." };
  if (!input.name.en.trim()) return { success: false, error: "English name is required." };

  const existing = await prisma.faqCategory.findUnique({ where: { key: input.key } });
  if (existing) return { success: false, error: "This key is already in use." };

  const created = await prisma.faqCategory.create({
    data: { key: input.key, name: input.name as Prisma.InputJsonValue, showChip: input.showChip, sortOrder: input.sortOrder },
  });
  await writeAuditLog({ action: "create", entityType: "faq_category", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "key", after: created.key }] });

  return { success: true, data: { id: created.id } };
}

export async function updateFaqCategory(id: string, input: FaqCategoryInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.faqCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Category not found." };
  if (!KEY_PATTERN.test(input.key)) return { success: false, error: "Key must be lowercase letters, numbers, and hyphens only." };

  const keyOwner = await prisma.faqCategory.findUnique({ where: { key: input.key } });
  if (keyOwner && keyOwner.id !== id) return { success: false, error: "This key is already in use." };

  await prisma.faqCategory.update({
    where: { id },
    data: { key: input.key, name: input.name as Prisma.InputJsonValue, showChip: input.showChip, sortOrder: input.sortOrder },
  });
  await writeAuditLog({ action: "update", entityType: "faq_category", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "key", before: existing.key, after: input.key }] });

  return { success: true, data: { id } };
}

export async function deleteFaqCategory(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.faqCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Category not found." };

  // FKs from Faq.categoryId are onDelete: SetNull — deleting a category
  // safely detaches its FAQs (they become uncategorized) rather than
  // deleting or blocking on them.
  await prisma.faqCategory.delete({ where: { id } });
  await writeAuditLog({ action: "delete", entityType: "faq_category", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "key", before: existing.key }] });

  return { success: true, data: { id } };
}

// ── FAQ entries ──────────────────────────────────────────────────────────

export type FaqParentType = "general" | "vehicle" | "service" | "location";

export interface FaqListItem {
  id: string;
  question: string;
  categoryName: string | null;
  parentType: FaqParentType;
  parentLabel: string | null;
  sortOrder: number;
}

export interface FaqDetail {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  categoryId: string | null;
  vehicleId: string | null;
  serviceId: string | null;
  locationId: string | null;
  sortOrder: number;
}

export interface FaqInput {
  question: LocalizedText;
  answer: LocalizedText;
  categoryId: string | null;
  parentType: FaqParentType;
  vehicleId: string | null;
  serviceId: string | null;
  locationId: string | null;
  sortOrder: number;
}

export interface ListFaqsParams {
  q?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export interface ListFaqsResult {
  items: FaqListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 25;

function parentTypeOf(row: { vehicleId: string | null; serviceId: string | null; locationId: string | null }): FaqParentType {
  if (row.vehicleId) return "vehicle";
  if (row.serviceId) return "service";
  if (row.locationId) return "location";
  return "general";
}

/** Mirrors the DB's `faqs_single_parent_check` CHECK constraint
 *  (migration.sql) in application code — a clean validation error here
 *  beats a raw Postgres constraint-violation surfacing to the admin. */
function validateSingleParent(input: Pick<FaqInput, "vehicleId" | "serviceId" | "locationId">): string | null {
  const count = [input.vehicleId, input.serviceId, input.locationId].filter(Boolean).length;
  if (count > 1) return "A FAQ can be scoped to at most one of vehicle, service, or location.";
  return null;
}

export async function listFaqs(params: ListFaqsParams): Promise<RoleAdminResult<ListFaqsResult>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.FaqWhereInput = {
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    // `path` is required for `string_contains` to match inside an
    // object-shaped Json column (LocalizedText) — without it Prisma never
    // matches, since the filter only applies to a JSON value that's a
    // string at the given path. Searches English text, matching every
    // other localized-field search in this codebase.
    ...(params.q ? { question: { path: ["en"], string_contains: params.q } } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.faq.count({ where }),
    prisma.faq.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true } },
        vehicle: { select: { name: true } },
        service: { select: { slug: true, name: true } },
        location: { select: { slug: true, name: true } },
      },
    }),
  ]);

  return {
    success: true,
    data: {
      items: rows.map((r) => {
        const parentType = parentTypeOf(r);
        const serviceName = (r.service?.name as LocalizedText | null)?.en;
        return {
          id: r.id,
          question: (r.question as LocalizedText | null)?.en ?? "",
          categoryName: ((r.category?.name as LocalizedText | null)?.en) ?? null,
          parentType,
          parentLabel: r.vehicle?.name ?? serviceName ?? r.location?.name ?? null,
          sortOrder: r.sortOrder,
        };
      }),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getFaq(id: string): Promise<RoleAdminResult<FaqDetail>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_READ);
  if (!gate.success) return gate;

  const row = await prisma.faq.findUnique({ where: { id } });
  if (!row) return { success: false, error: "FAQ not found." };

  return {
    success: true,
    data: {
      id: row.id,
      question: (row.question as LocalizedText | null) ?? emptyLocalizedText(),
      answer: (row.answer as LocalizedText | null) ?? emptyLocalizedText(),
      categoryId: row.categoryId,
      vehicleId: row.vehicleId,
      serviceId: row.serviceId,
      locationId: row.locationId,
      sortOrder: row.sortOrder,
    },
  };
}

function parentFields(input: FaqInput): { vehicleId: string | null; serviceId: string | null; locationId: string | null } {
  return {
    vehicleId: input.parentType === "vehicle" ? input.vehicleId : null,
    serviceId: input.parentType === "service" ? input.serviceId : null,
    locationId: input.parentType === "location" ? input.locationId : null,
  };
}

export async function createFaq(input: FaqInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_CREATE);
  if (!gate.success) return gate;

  if (!input.question.en.trim()) return { success: false, error: "English question is required." };
  const parentError = validateSingleParent(input);
  if (parentError) return { success: false, error: parentError };

  const created = await prisma.faq.create({
    data: {
      question: input.question as Prisma.InputJsonValue,
      answer: input.answer as Prisma.InputJsonValue,
      categoryId: input.categoryId,
      sortOrder: input.sortOrder,
      ...parentFields(input),
    },
  });
  await writeAuditLog({ action: "create", entityType: "faq", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "question", after: input.question.en }] });

  return { success: true, data: { id: created.id } };
}

export async function updateFaq(id: string, input: FaqInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "FAQ not found." };
  if (!input.question.en.trim()) return { success: false, error: "English question is required." };
  const parentError = validateSingleParent(input);
  if (parentError) return { success: false, error: parentError };

  await prisma.faq.update({
    where: { id },
    data: {
      question: input.question as Prisma.InputJsonValue,
      answer: input.answer as Prisma.InputJsonValue,
      categoryId: input.categoryId,
      sortOrder: input.sortOrder,
      ...parentFields(input),
    },
  });
  await writeAuditLog({ action: "update", entityType: "faq", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "question", before: (existing.question as LocalizedText | null)?.en, after: input.question.en }] });

  return { success: true, data: { id } };
}

export async function deleteFaq(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "FAQ not found." };

  await prisma.faq.delete({ where: { id } });
  await writeAuditLog({ action: "delete", entityType: "faq", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "question", before: (existing.question as LocalizedText | null)?.en }] });

  return { success: true, data: { id } };
}

// ── Parent option lists (for the FAQ form's scope pickers) ───────────────

export interface ParentOption {
  id: string;
  label: string;
}

export async function listFaqParentOptions(): Promise<RoleAdminResult<{ vehicles: ParentOption[]; services: ParentOption[]; locations: ParentOption[] }>> {
  const gate = await requireCmsPermission(PERMISSIONS.FAQ_READ);
  if (!gate.success) return gate;

  const [vehicles, services, locations] = await Promise.all([
    prisma.vehicle.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { slug: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    success: true,
    data: {
      vehicles: vehicles.map((v) => ({ id: v.id, label: v.name })),
      services: services.map((s) => ({ id: s.id, label: (s.name as LocalizedText | null)?.en ?? s.id })),
      locations: locations.map((l) => ({ id: l.id, label: l.name })),
    },
  };
}
