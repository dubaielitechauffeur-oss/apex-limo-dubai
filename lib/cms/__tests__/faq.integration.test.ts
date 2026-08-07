import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import {
  listFaqCategories,
  createFaqCategory,
  updateFaqCategory,
  deleteFaqCategory,
  listFaqs,
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  type FaqInput,
  type FaqCategoryInput,
} from "@/lib/cms/faq";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";

let users: Record<SystemRole, TestUser>;
const categoryIds: string[] = [];
const faqIds: string[] = [];
let serviceId: string;
let locationId: string;

beforeAll(async () => {
  users = await createTestUsers();
  const service = await prisma.service.create({
    data: {
      slug: `vitest-faq-svc-${Math.random().toString(36).slice(2, 8)}`,
      name: emptyLocalizedText("Vitest FAQ Service"),
      tagline: emptyLocalizedText(),
      shortDescription: emptyLocalizedText(),
      longDescription: emptyLocalizedText(),
      benefits: emptyLocalizedText(),
      whyChoose: emptyLocalizedText(),
      tags: emptyLocalizedText(),
      seo: emptySeoMeta() as unknown as object,
    },
  });
  serviceId = service.id;
  const location = await prisma.location.create({
    data: {
      slug: `vitest-faq-loc-${Math.random().toString(36).slice(2, 8)}`,
      name: "Vitest FAQ Location",
      tagline: emptyLocalizedText(),
      shortDescription: emptyLocalizedText(),
      longDescription: emptyLocalizedText(),
      landmarks: emptyLocalizedText(),
      whyChoose: emptyLocalizedText(),
      tags: emptyLocalizedText(),
      seo: emptySeoMeta() as unknown as object,
    },
  });
  locationId = location.id;
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityId: { in: [...faqIds, ...categoryIds] } } });
  await prisma.faq.deleteMany({ where: { id: { in: faqIds } } });
  await prisma.faqCategory.deleteMany({ where: { id: { in: categoryIds } } });
  await prisma.service.delete({ where: { id: serviceId } }).catch(() => null);
  await prisma.location.delete({ where: { id: locationId } }).catch(() => null);
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

function categoryFixture(overrides?: Partial<FaqCategoryInput>): FaqCategoryInput {
  return {
    key: `vitest-cat-${Math.random().toString(36).slice(2, 10)}`,
    name: emptyLocalizedText("Vitest Category"),
    showChip: true,
    sortOrder: 0,
    ...overrides,
  };
}

function faqFixture(overrides?: Partial<FaqInput>): FaqInput {
  return {
    question: emptyLocalizedText("What is Vitest?"),
    answer: emptyLocalizedText("A testing framework."),
    categoryId: null,
    parentType: "general",
    vehicleId: null,
    serviceId: null,
    locationId: null,
    sortOrder: 0,
    ...overrides,
  };
}

async function makeCategory(overrides?: Partial<FaqCategoryInput>): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createFaqCategory(categoryFixture(overrides));
  if (!result.success) throw new Error(`Fixture category creation failed: ${result.error}`);
  categoryIds.push(result.data.id);
  return result.data.id;
}

async function makeFaq(overrides?: Partial<FaqInput>): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createFaq(faqFixture(overrides));
  if (!result.success) throw new Error(`Fixture FAQ creation failed: ${result.error}`);
  faqIds.push(result.data.id);
  return result.data.id;
}

describe("FAQ categories — permission gating and CRUD", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createFaqCategory(categoryFixture());
    expect(result.success).toBe(false);
  });

  it("booking_manager lacks faq:create and is denied", async () => {
    mockSessionFor(users.booking_manager);
    const result = await createFaqCategory(categoryFixture());
    expect(result.success).toBe(false);
  });

  it("rejects a duplicate key", async () => {
    const key = `vitest-dup-cat-${Math.random().toString(36).slice(2, 8)}`;
    await makeCategory({ key });
    mockSessionFor(users.content_manager);
    const result = await createFaqCategory(categoryFixture({ key }));
    expect(result.success).toBe(false);
  });

  it("content_manager creates, updates, and deletes a category", async () => {
    const id = await makeCategory();
    mockSessionFor(users.content_manager);
    const updateResult = await updateFaqCategory(id, categoryFixture({ key: `vitest-upd-${Math.random().toString(36).slice(2, 8)}`, name: emptyLocalizedText("Updated") }));
    expect(updateResult.success).toBe(true);

    const listResult = await listFaqCategories();
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.some((c) => c.id === id)).toBe(true);
    }

    const deleteResult = await deleteFaqCategory(id);
    expect(deleteResult.success).toBe(true);
    categoryIds.splice(categoryIds.indexOf(id), 1);

    const afterDelete = await listFaqCategories();
    expect(afterDelete.success).toBe(true);
    if (afterDelete.success) {
      expect(afterDelete.data.some((c) => c.id === id)).toBe(false);
    }
  });
});

describe("FAQ entries — permission gating and validation", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createFaq(faqFixture());
    expect(result.success).toBe(false);
  });

  it("viewer lacks faq:create and is denied", async () => {
    mockSessionFor(users.viewer);
    const result = await createFaq(faqFixture());
    expect(result.success).toBe(false);
  });

  it("rejects a missing English question", async () => {
    mockSessionFor(users.content_manager);
    const result = await createFaq(faqFixture({ question: emptyLocalizedText() }));
    expect(result.success).toBe(false);
  });

  it("content_manager can create a general FAQ, audit-logged", async () => {
    mockSessionFor(users.content_manager);
    const before = await prisma.auditLog.count({ where: { action: "create", entityType: "faq" } });
    const id = await makeFaq();
    const row = await prisma.faq.findUniqueOrThrow({ where: { id } });
    expect(row.vehicleId).toBeNull();
    expect(row.serviceId).toBeNull();
    expect(row.locationId).toBeNull();
    expect(await prisma.auditLog.count({ where: { action: "create", entityType: "faq" } })).toBe(before + 1);
  });
});

describe("FAQ single-parent constraint (mirrors DB CHECK faqs_single_parent_check)", () => {
  it("allows scoping to a single parent — service", async () => {
    mockSessionFor(users.content_manager);
    const result = await createFaq(faqFixture({ parentType: "service", serviceId }));
    expect(result.success).toBe(true);
    if (result.success) faqIds.push(result.data.id);
  });

  it("allows scoping to a single parent — location", async () => {
    mockSessionFor(users.content_manager);
    const result = await createFaq(faqFixture({ parentType: "location", locationId }));
    expect(result.success).toBe(true);
    if (result.success) faqIds.push(result.data.id);
  });

  it("rejects create when both serviceId and locationId are set (application-level check)", async () => {
    mockSessionFor(users.content_manager);
    const result = await createFaq({ ...faqFixture(), serviceId, locationId });
    expect(result.success).toBe(false);
  });

  it("rejects update when both serviceId and locationId are set", async () => {
    const id = await makeFaq();
    mockSessionFor(users.content_manager);
    const result = await updateFaq(id, { ...faqFixture(), serviceId, locationId });
    expect(result.success).toBe(false);
  });

  it("the DB CHECK constraint itself rejects a raw multi-parent row (defense in depth)", async () => {
    await expect(
      prisma.faq.create({
        data: {
          question: emptyLocalizedText("Raw multi-parent") as unknown as object,
          answer: emptyLocalizedText() as unknown as object,
          serviceId,
          locationId,
          sortOrder: 0,
        },
      })
    ).rejects.toThrow();
  });
});

describe("updateFaq / deleteFaq / listFaqs / getFaq", () => {
  it("updates a FAQ's question and answer", async () => {
    const id = await makeFaq();
    mockSessionFor(users.content_manager);
    const result = await updateFaq(id, faqFixture({ question: emptyLocalizedText("Updated question?") }));
    expect(result.success).toBe(true);

    mockSessionFor(users.viewer);
    const detail = await getFaq(id);
    expect(detail.success).toBe(true);
    if (detail.success) expect(detail.data.question.en).toBe("Updated question?");
  });

  it("lists FAQs and finds the created one", async () => {
    const id = await makeFaq({ question: emptyLocalizedText("Unique listing question?") });
    mockSessionFor(users.viewer);
    const result = await listFaqs({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items.some((f) => f.id === id)).toBe(true);
    }
  });

  it("deletes a FAQ (hard delete — no status/soft-delete field on this model)", async () => {
    const id = await makeFaq();
    mockSessionFor(users.content_manager);
    const result = await deleteFaq(id);
    expect(result.success).toBe(true);
    faqIds.splice(faqIds.indexOf(id), 1);

    const row = await prisma.faq.findUnique({ where: { id } });
    expect(row).toBeNull();
  });
});
