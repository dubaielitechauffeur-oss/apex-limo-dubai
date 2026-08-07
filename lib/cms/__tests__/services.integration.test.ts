import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import { listServices, getService, createService, updateService, setServiceStatus, softDeleteService, restoreService, type ServiceInput } from "@/lib/cms/services";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";

let users: Record<SystemRole, TestUser>;
const createdIds: string[] = [];

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityId: { in: createdIds } } });
  await prisma.service.deleteMany({ where: { id: { in: createdIds } } });
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

function fixtureInput(overrides?: Partial<ServiceInput>): ServiceInput {
  return {
    slug: `vitest-svc-${Math.random().toString(36).slice(2, 10)}`,
    name: emptyLocalizedText("Vitest Service"),
    tagline: emptyLocalizedText("Tagline"),
    heroSubtitle: emptyLocalizedText(),
    shortDescription: emptyLocalizedText("Short desc"),
    longDescription: emptyLocalizedText("Paragraph one.\n\nParagraph two."),
    benefits: emptyLocalizedText("Benefit one\nBenefit two"),
    whyChoose: emptyLocalizedText(),
    tags: emptyLocalizedText(),
    ratingMetricValue: "500+",
    ratingMetricLabel: emptyLocalizedText("Happy clients"),
    imageId: null,
    seo: emptySeoMeta(),
    status: "draft",
    sortOrder: 0,
    ...overrides,
  };
}

async function makeService(overrides?: Partial<ServiceInput>): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createService(fixtureInput(overrides));
  if (!result.success) throw new Error(`Fixture creation failed: ${result.error}`);
  createdIds.push(result.data.id);
  return result.data.id;
}

describe("createService — permission gating and validation", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createService(fixtureInput());
    expect(result.success).toBe(false);
  });

  it("booking_manager lacks services:create and is denied, with an audit entry", async () => {
    mockSessionFor(users.booking_manager);
    const before = await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } });
    const result = await createService(fixtureInput());
    expect(result.success).toBe(false);
    expect(await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } })).toBe(before + 1);
  });

  it("rejects a duplicate slug", async () => {
    const slug = `vitest-dup-${Math.random().toString(36).slice(2, 8)}`;
    await makeService({ slug });
    mockSessionFor(users.content_manager);
    const result = await createService(fixtureInput({ slug }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid slug format", async () => {
    mockSessionFor(users.content_manager);
    const result = await createService(fixtureInput({ slug: "Not A Valid Slug!" }));
    expect(result.success).toBe(false);
  });

  it("content_manager can create a service — real row, audit-logged", async () => {
    mockSessionFor(users.content_manager);
    const before = await prisma.auditLog.count({ where: { action: "create", entityType: "service" } });
    const id = await makeService();
    const row = await prisma.service.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("draft");
    expect(await prisma.auditLog.count({ where: { action: "create", entityType: "service" } })).toBe(before + 1);
  });
});

describe("getService — round-trips localized array fields correctly", () => {
  it("splits/rejoins benefits (lines) and longDescription (paragraphs)", async () => {
    const id = await makeService();
    mockSessionFor(users.viewer);
    const result = await getService(id);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.benefits.en).toBe("Benefit one\nBenefit two");
      expect(result.data.longDescription.en).toBe("Paragraph one.\n\nParagraph two.");
    }
  });
});

describe("updateService", () => {
  it("viewer (read-only) is denied", async () => {
    const id = await makeService();
    mockSessionFor(users.viewer);
    const result = await updateService(id, fixtureInput({ name: emptyLocalizedText("Hacked") }));
    expect(result.success).toBe(false);
  });

  it("content_manager can update, and slug can be reused by the same row", async () => {
    const slug = `vitest-self-${Math.random().toString(36).slice(2, 8)}`;
    const id = await makeService({ slug });
    mockSessionFor(users.content_manager);
    const result = await updateService(id, fixtureInput({ slug, name: emptyLocalizedText("Updated Name") }));
    expect(result.success).toBe(true);
    const row = await prisma.service.findUniqueOrThrow({ where: { id } });
    expect((row.name as { en: string }).en).toBe("Updated Name");
  });
});

describe("setServiceStatus — publish/unpublish/archive", () => {
  it("publishing stamps publishedAt; unpublishing keeps it (not cleared)", async () => {
    const id = await makeService();
    mockSessionFor(users.content_manager);

    const publishResult = await setServiceStatus(id, "published");
    expect(publishResult.success).toBe(true);
    const afterPublish = await prisma.service.findUniqueOrThrow({ where: { id } });
    expect(afterPublish.status).toBe("published");
    expect(afterPublish.publishedAt).not.toBeNull();

    const unpublishResult = await setServiceStatus(id, "draft");
    expect(unpublishResult.success).toBe(true);
    const afterUnpublish = await prisma.service.findUniqueOrThrow({ where: { id } });
    expect(afterUnpublish.status).toBe("draft");
  });

  it("seo_manager lacks services:publish and is denied", async () => {
    const id = await makeService();
    mockSessionFor(users.seo_manager);
    const result = await setServiceStatus(id, "published");
    expect(result.success).toBe(false);
  });
});

describe("softDeleteService / restoreService", () => {
  it("soft-deletes and excludes from listServices by default", async () => {
    const id = await makeService();
    mockSessionFor(users.content_manager);
    const deleteResult = await softDeleteService(id);
    expect(deleteResult.success).toBe(true);

    const row = await prisma.service.findUniqueOrThrow({ where: { id } });
    expect(row.deletedAt).not.toBeNull();

    mockSessionFor(users.viewer);
    const listResult = await listServices({});
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.items.some((s) => s.id === id)).toBe(false);
    }
  });

  it("restores a soft-deleted service", async () => {
    const id = await makeService();
    mockSessionFor(users.content_manager);
    await softDeleteService(id);
    const restoreResult = await restoreService(id);
    expect(restoreResult.success).toBe(true);

    const row = await prisma.service.findUniqueOrThrow({ where: { id } });
    expect(row.deletedAt).toBeNull();
  });
});
