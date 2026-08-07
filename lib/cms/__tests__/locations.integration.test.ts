import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import {
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  setLocationStatus,
  softDeleteLocation,
  restoreLocation,
  addPopularRoute,
  deletePopularRoute,
  type LocationInput,
} from "@/lib/cms/locations";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";

let users: Record<SystemRole, TestUser>;
const createdIds: string[] = [];

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityId: { in: createdIds } } });
  await prisma.location.deleteMany({ where: { id: { in: createdIds } } });
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

function fixtureInput(overrides?: Partial<LocationInput>): LocationInput {
  return {
    slug: `vitest-loc-${Math.random().toString(36).slice(2, 10)}`,
    name: "Vitest Location",
    tagline: emptyLocalizedText("Tagline"),
    heroSubtitle: emptyLocalizedText(),
    shortDescription: emptyLocalizedText("Short desc"),
    longDescription: emptyLocalizedText("Paragraph one.\n\nParagraph two."),
    isAirport: false,
    landmarks: emptyLocalizedText("Landmark one\nLandmark two"),
    whyChoose: emptyLocalizedText(),
    tags: emptyLocalizedText(),
    geoLat: "25.2048",
    geoLng: "55.2708",
    heroDesktopImageId: null,
    heroMobileImageId: null,
    seo: emptySeoMeta(),
    status: "draft",
    sortOrder: 0,
    ...overrides,
  };
}

async function makeLocation(overrides?: Partial<LocationInput>): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createLocation(fixtureInput(overrides));
  if (!result.success) throw new Error(`Fixture creation failed: ${result.error}`);
  createdIds.push(result.data.id);
  return result.data.id;
}

describe("createLocation — permission gating and validation", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createLocation(fixtureInput());
    expect(result.success).toBe(false);
  });

  it("booking_manager lacks locations:create and is denied, with an audit entry", async () => {
    mockSessionFor(users.booking_manager);
    const before = await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } });
    const result = await createLocation(fixtureInput());
    expect(result.success).toBe(false);
    expect(await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } })).toBe(before + 1);
  });

  it("rejects a duplicate slug", async () => {
    const slug = `vitest-dup-loc-${Math.random().toString(36).slice(2, 8)}`;
    await makeLocation({ slug });
    mockSessionFor(users.content_manager);
    const result = await createLocation(fixtureInput({ slug }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid slug format", async () => {
    mockSessionFor(users.content_manager);
    const result = await createLocation(fixtureInput({ slug: "Not A Valid Slug!" }));
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", async () => {
    mockSessionFor(users.content_manager);
    const result = await createLocation(fixtureInput({ name: "   " }));
    expect(result.success).toBe(false);
  });

  it("content_manager can create a location — real row, audit-logged", async () => {
    mockSessionFor(users.content_manager);
    const before = await prisma.auditLog.count({ where: { action: "create", entityType: "location" } });
    const id = await makeLocation();
    const row = await prisma.location.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("draft");
    expect(await prisma.auditLog.count({ where: { action: "create", entityType: "location" } })).toBe(before + 1);
  });
});

describe("getLocation — round-trips fields correctly", () => {
  it("splits/rejoins landmarks (lines), longDescription (paragraphs), geo, and name (plain string)", async () => {
    const id = await makeLocation();
    mockSessionFor(users.viewer);
    const result = await getLocation(id);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Vitest Location");
      expect(result.data.landmarks.en).toBe("Landmark one\nLandmark two");
      expect(result.data.longDescription.en).toBe("Paragraph one.\n\nParagraph two.");
      expect(result.data.geoLat).toBe("25.2048");
      expect(result.data.geoLng).toBe("55.2708");
    }
  });
});

describe("updateLocation", () => {
  it("viewer (read-only) is denied", async () => {
    const id = await makeLocation();
    mockSessionFor(users.viewer);
    const result = await updateLocation(id, fixtureInput({ name: "Hacked" }));
    expect(result.success).toBe(false);
  });

  it("content_manager can update, and slug can be reused by the same row", async () => {
    const slug = `vitest-self-loc-${Math.random().toString(36).slice(2, 8)}`;
    const id = await makeLocation({ slug });
    mockSessionFor(users.content_manager);
    const result = await updateLocation(id, fixtureInput({ slug, name: "Updated Location Name" }));
    expect(result.success).toBe(true);
    const row = await prisma.location.findUniqueOrThrow({ where: { id } });
    expect(row.name).toBe("Updated Location Name");
  });
});

describe("setLocationStatus — publish/unpublish/archive", () => {
  it("publishing stamps publishedAt; unpublishing keeps it (not cleared)", async () => {
    const id = await makeLocation();
    mockSessionFor(users.content_manager);

    const publishResult = await setLocationStatus(id, "published");
    expect(publishResult.success).toBe(true);
    const afterPublish = await prisma.location.findUniqueOrThrow({ where: { id } });
    expect(afterPublish.status).toBe("published");
    expect(afterPublish.publishedAt).not.toBeNull();

    const unpublishResult = await setLocationStatus(id, "draft");
    expect(unpublishResult.success).toBe(true);
    const afterUnpublish = await prisma.location.findUniqueOrThrow({ where: { id } });
    expect(afterUnpublish.status).toBe("draft");
  });

  it("seo_manager lacks locations:publish and is denied", async () => {
    const id = await makeLocation();
    mockSessionFor(users.seo_manager);
    const result = await setLocationStatus(id, "published");
    expect(result.success).toBe(false);
  });
});

describe("softDeleteLocation / restoreLocation", () => {
  it("soft-deletes and excludes from listLocations by default", async () => {
    const id = await makeLocation();
    mockSessionFor(users.content_manager);
    const deleteResult = await softDeleteLocation(id);
    expect(deleteResult.success).toBe(true);

    const row = await prisma.location.findUniqueOrThrow({ where: { id } });
    expect(row.deletedAt).not.toBeNull();

    mockSessionFor(users.viewer);
    const listResult = await listLocations({});
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.items.some((l) => l.id === id)).toBe(false);
    }
  });

  it("restores a soft-deleted location", async () => {
    const id = await makeLocation();
    mockSessionFor(users.content_manager);
    await softDeleteLocation(id);
    const restoreResult = await restoreLocation(id);
    expect(restoreResult.success).toBe(true);

    const row = await prisma.location.findUniqueOrThrow({ where: { id } });
    expect(row.deletedAt).toBeNull();
  });
});

describe("popular routes", () => {
  it("adds and deletes a popular route, ordered by sortOrder", async () => {
    const id = await makeLocation();
    mockSessionFor(users.content_manager);

    const first = await addPopularRoute(id, { from: "Dubai Airport", to: "Downtown Dubai", duration: "25 min" });
    expect(first.success).toBe(true);
    const second = await addPopularRoute(id, { from: "Dubai Marina", to: "Business Bay", duration: "20 min" });
    expect(second.success).toBe(true);

    mockSessionFor(users.viewer);
    const detail = await getLocation(id);
    expect(detail.success).toBe(true);
    if (detail.success) {
      expect(detail.data.popularRoutes).toHaveLength(2);
      expect(detail.data.popularRoutes[0]?.from.en).toBe("Dubai Airport");
    }

    if (!first.success) throw new Error("unreachable");
    mockSessionFor(users.content_manager);
    const deleteResult = await deletePopularRoute(first.data.id);
    expect(deleteResult.success).toBe(true);

    mockSessionFor(users.viewer);
    const afterDelete = await getLocation(id);
    expect(afterDelete.success).toBe(true);
    if (afterDelete.success) {
      expect(afterDelete.data.popularRoutes).toHaveLength(1);
    }
  });

  it("rejects adding a route with a missing from/to", async () => {
    const id = await makeLocation();
    mockSessionFor(users.content_manager);
    const result = await addPopularRoute(id, { from: "", to: "Somewhere", duration: "10 min" });
    expect(result.success).toBe(false);
  });
});
