import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import { createFaq, updateFaq, deleteFaq, type FaqInput } from "@/lib/cms/faq";
import { setServiceStatus } from "@/lib/cms/services";
import { updatePageSeo } from "@/lib/cms/page-seo";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";
import { undoAuditEntry, findUndoneIds, isUndoable } from "@/lib/audit/undo";

let users: Record<SystemRole, TestUser>;
let serviceId: string;
const SEO_PAGE = "terms";

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

function faqInput(question: string): FaqInput {
  return {
    question: emptyLocalizedText(question),
    answer: emptyLocalizedText("An answer"),
    categoryId: null,
    parentType: "general",
    vehicleId: null,
    serviceId: null,
    locationId: null,
    sortOrder: 0,
  };
}

async function latestEntry(entityType: string, entityId: string) {
  const entry = await prisma.auditLog.findFirst({ where: { entityType, entityId }, orderBy: { createdAt: "desc" } });
  if (!entry) throw new Error("no audit entry");
  return entry;
}

async function question(id: string): Promise<string | null> {
  const row = await prisma.faq.findUnique({ where: { id } });
  return row ? (row.question as { en: string }).en : null;
}

beforeAll(async () => {
  users = await createTestUsers();
  const service = await prisma.service.create({
    data: {
      slug: `vitest-undo-svc-${Math.random().toString(36).slice(2, 8)}`,
      name: emptyLocalizedText("Vitest Undo Service"),
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
  await prisma.pageSeo.deleteMany({ where: { page: SEO_PAGE } });
});

afterAll(async () => {
  await prisma.faq.deleteMany({ where: { question: { path: ["en"], string_starts_with: "Vitest undo" } } });
  await prisma.service.deleteMany({ where: { id: serviceId } });
  await prisma.pageSeo.deleteMany({ where: { page: SEO_PAGE } });
  await cleanupTestUsers(users);
});

describe("audit entries record full before/after", () => {
  it("names the person, not just the role, and stores each changed field", async () => {
    mockSessionFor(users.agency);
    const created = await createFaq(faqInput("Vitest undo Q1"));
    expect(created.success).toBe(true);
    if (!created.success) return;
    await updateFaq(created.data.id, faqInput("Vitest undo Q1 edited"));

    const entry = await latestEntry("faq", created.data.id);
    expect(entry.userName).toContain("agency");
    const changes = entry.changes as { field: string; before?: unknown; after?: unknown }[];
    const q = changes.find((c) => c.field === "question");
    expect((q?.before as { en: string }).en).toBe("Vitest undo Q1");
    expect((q?.after as { en: string }).en).toBe("Vitest undo Q1 edited");
    expect(isUndoable(entry)).toBe(true);
  });
});

describe("undoAuditEntry", () => {
  it("is owner-only", async () => {
    mockSessionFor(users.agency);
    const created = await createFaq(faqInput("Vitest undo Q2"));
    if (!created.success) throw new Error(created.error);
    await updateFaq(created.data.id, faqInput("Vitest undo Q2 edited"));
    const entry = await latestEntry("faq", created.data.id);

    mockSessionFor(users.admin);
    const denied = await undoAuditEntry(entry.id);
    expect(denied.success).toBe(false);
    expect(await question(created.data.id)).toBe("Vitest undo Q2 edited");
  });

  it("restores the previous value, records the undo, and refuses a second undo", async () => {
    mockSessionFor(users.agency);
    const created = await createFaq(faqInput("Vitest undo Q3"));
    if (!created.success) throw new Error(created.error);
    await updateFaq(created.data.id, faqInput("Vitest undo Q3 edited"));
    const entry = await latestEntry("faq", created.data.id);

    mockSessionFor(users.super_admin);
    const result = await undoAuditEntry(entry.id);
    expect(result.success).toBe(true);
    expect(await question(created.data.id)).toBe("Vitest undo Q3");
    expect((await findUndoneIds([entry.id])).has(entry.id)).toBe(true);

    const again = await undoAuditEntry(entry.id);
    expect(again.success).toBe(false);
  });

  it("refuses when the field was changed again later, so newer work is not lost", async () => {
    mockSessionFor(users.agency);
    const created = await createFaq(faqInput("Vitest undo Q4"));
    if (!created.success) throw new Error(created.error);
    await updateFaq(created.data.id, faqInput("Vitest undo Q4 B"));
    const older = await latestEntry("faq", created.data.id);
    await new Promise((r) => setTimeout(r, 5));
    await updateFaq(created.data.id, faqInput("Vitest undo Q4 C"));

    mockSessionFor(users.super_admin);
    const result = await undoAuditEntry(older.id);
    expect(result.success).toBe(false);
    expect(await question(created.data.id)).toBe("Vitest undo Q4 C");
  });

  it("brings back a hard-deleted record with the same id, and undoes a create", async () => {
    mockSessionFor(users.agency);
    const created = await createFaq(faqInput("Vitest undo Q5"));
    if (!created.success) throw new Error(created.error);
    const createEntry = await latestEntry("faq", created.data.id);
    await deleteFaq(created.data.id);
    const deleteEntry = await latestEntry("faq", created.data.id);

    mockSessionFor(users.super_admin);
    expect((await undoAuditEntry(deleteEntry.id)).success).toBe(true);
    expect(await question(created.data.id)).toBe("Vitest undo Q5");

    expect((await undoAuditEntry(createEntry.id)).success).toBe(true);
    expect(await question(created.data.id)).toBeNull();
  });

  it("undoes a publish", async () => {
    mockSessionFor(users.super_admin);
    await setServiceStatus(serviceId, "published");
    const entry = await latestEntry("service", serviceId);
    expect((await undoAuditEntry(entry.id)).success).toBe(true);
    const row = await prisma.service.findUnique({ where: { id: serviceId } });
    expect(row?.status).toBe("draft");
    expect(row?.publishedAt).toBeNull();
  });

  it("undoing a first Page SEO save puts the page back on its defaults", async () => {
    mockSessionFor(users.agency);
    const seo = emptySeoMeta();
    seo.title = emptyLocalizedText("Agency title");
    const saved = await updatePageSeo(SEO_PAGE, seo);
    expect(saved.success).toBe(true);
    const entry = await latestEntry("page_seo", SEO_PAGE);

    mockSessionFor(users.super_admin);
    expect((await undoAuditEntry(entry.id)).success).toBe(true);
    expect(await prisma.pageSeo.findUnique({ where: { page: SEO_PAGE } })).toBeNull();
  });
});
