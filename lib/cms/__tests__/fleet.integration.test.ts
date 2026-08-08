import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import {
  listVehicleCategories,
  createVehicleCategory,
  updateVehicleCategory,
  deleteVehicleCategory,
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  setVehicleStatus,
  softDeleteVehicle,
  restoreVehicle,
  listVehicleRates,
  updateVehicleRates,
  type VehicleInput,
  type VehicleCategoryInput,
  type VehicleRatesInput,
} from "@/lib/cms/fleet";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";

let users: Record<SystemRole, TestUser>;
const vehicleIds: string[] = [];
const categoryIds: string[] = [];
const mediaItemIds: string[] = [];
let sharedCategoryId: string;
let sharedMediaId: string;

beforeAll(async () => {
  users = await createTestUsers();
  const category = await prisma.vehicleCategory.create({
    data: { slug: `vitest-cat-${Math.random().toString(36).slice(2, 8)}`, name: emptyLocalizedText("Vitest Category"), sortOrder: 999 },
  });
  sharedCategoryId = category.id;
  categoryIds.push(category.id);

  const media = await prisma.mediaItem.create({
    data: {
      filename: "vitest.jpg",
      originalFilename: "vitest.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 100,
      alt: emptyLocalizedText("Vitest image"),
      type: "image",
      storageProvider: "local",
      storagePath: "vitest/vitest.jpg",
      url: "/vitest/vitest.jpg",
    },
  });
  sharedMediaId = media.id;
  mediaItemIds.push(media.id);
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityId: { in: [...vehicleIds, ...categoryIds] } } });
  await prisma.vehicleImage.deleteMany({ where: { vehicleId: { in: vehicleIds } } });
  await prisma.faq.deleteMany({ where: { vehicleId: { in: vehicleIds } } });
  await prisma.vehicle.deleteMany({ where: { id: { in: vehicleIds } } });
  await prisma.vehicleCategory.deleteMany({ where: { id: { in: categoryIds } } });
  await prisma.mediaItem.deleteMany({ where: { id: { in: mediaItemIds } } });
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

function fixtureInput(overrides?: Partial<VehicleInput>): VehicleInput {
  return {
    slug: `vitest-vehicle-${Math.random().toString(36).slice(2, 10)}`,
    name: "Vitest Phantom",
    brand: "Vitest Motors",
    model: "Phantom",
    categoryId: sharedCategoryId,
    isElectric: false,
    isFeatured: false,
    isPlaceholder: false,
    tagline: emptyLocalizedText("Tagline"),
    description: emptyLocalizedText("Short description"),
    longDescription: emptyLocalizedText("Long description paragraph."),
    idealFor: emptyLocalizedText("Corporate travel"),
    features: emptyLocalizedText("Feature one\nFeature two"),
    whyChoose: emptyLocalizedText("Reason one\nReason two"),
    badge: emptyLocalizedText(),
    passengers: 4,
    luggage: 3,
    rates: { tenHours: 5000, fiveHours: 3000, oneHour: 800, airport: 1000, extraHour: 650, additionalCity: 650 },
    imageIds: [sharedMediaId],
    seo: emptySeoMeta(),
    status: "draft",
    sortOrder: 0,
    ...overrides,
  };
}

async function makeVehicle(overrides?: Partial<VehicleInput>): Promise<string> {
  mockSessionFor(users.fleet_manager);
  const result = await createVehicle(fixtureInput(overrides));
  if (!result.success) throw new Error(`Fixture creation failed: ${result.error}`);
  vehicleIds.push(result.data.id);
  return result.data.id;
}

describe("vehicle categories — permission gating and CRUD", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createVehicleCategory({ slug: "denied", name: emptyLocalizedText("Denied"), description: emptyLocalizedText(), sortOrder: 0 });
    expect(result.success).toBe(false);
  });

  it("booking_manager lacks fleet:create and is denied", async () => {
    mockSessionFor(users.booking_manager);
    const result = await createVehicleCategory({ slug: "denied2", name: emptyLocalizedText("Denied"), description: emptyLocalizedText(), sortOrder: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects a duplicate slug", async () => {
    mockSessionFor(users.fleet_manager);
    const existing = await prisma.vehicleCategory.findUniqueOrThrow({ where: { id: sharedCategoryId } });
    const result = await createVehicleCategory({ slug: existing.slug, name: emptyLocalizedText("Dup"), description: emptyLocalizedText(), sortOrder: 0 });
    expect(result.success).toBe(false);
  });

  it("creates, lists, updates, and blocks deletion of a category in use", async () => {
    mockSessionFor(users.fleet_manager);
    const input: VehicleCategoryInput = { slug: `vitest-cat2-${Math.random().toString(36).slice(2, 8)}`, name: emptyLocalizedText("Vitest Category 2"), description: emptyLocalizedText(), sortOrder: 0 };
    const createResult = await createVehicleCategory(input);
    expect(createResult.success).toBe(true);
    if (!createResult.success) return;
    categoryIds.push(createResult.data.id);

    const listResult = await listVehicleCategories();
    expect(listResult.success).toBe(true);
    if (listResult.success) expect(listResult.data.some((c) => c.id === createResult.data.id)).toBe(true);

    const updateResult = await updateVehicleCategory(createResult.data.id, { ...input, name: emptyLocalizedText("Renamed") });
    expect(updateResult.success).toBe(true);

    const vehicleId = await makeVehicle({ categoryId: createResult.data.id });
    const deleteBlockedResult = await deleteVehicleCategory(createResult.data.id);
    expect(deleteBlockedResult.success).toBe(false);

    mockSessionFor(users.fleet_manager);
    await softDeleteVehicle(vehicleId);
  });
});

describe("createVehicle — permission gating and validation", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createVehicle(fixtureInput());
    expect(result.success).toBe(false);
  });

  it("booking_manager lacks fleet:create and is denied, with an audit entry", async () => {
    mockSessionFor(users.booking_manager);
    const before = await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } });
    const result = await createVehicle(fixtureInput());
    expect(result.success).toBe(false);
    expect(await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } })).toBe(before + 1);
  });

  it("rejects a duplicate slug", async () => {
    const slug = `vitest-dup-${Math.random().toString(36).slice(2, 8)}`;
    await makeVehicle({ slug });
    mockSessionFor(users.fleet_manager);
    const result = await createVehicle(fixtureInput({ slug }));
    expect(result.success).toBe(false);
  });

  it("rejects a nonexistent category", async () => {
    mockSessionFor(users.fleet_manager);
    const result = await createVehicle(fixtureInput({ categoryId: "nonexistent-category-id" }));
    expect(result.success).toBe(false);
  });

  it("rejects a nonexistent image reference", async () => {
    mockSessionFor(users.fleet_manager);
    const result = await createVehicle(fixtureInput({ imageIds: ["nonexistent-media-id"] }));
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", async () => {
    mockSessionFor(users.fleet_manager);
    const result = await createVehicle(fixtureInput({ name: "  " }));
    expect(result.success).toBe(false);
  });

  it("content_manager can create a vehicle — real row, audit-logged", async () => {
    mockSessionFor(users.fleet_manager);
    const before = await prisma.auditLog.count({ where: { action: "create", entityType: "vehicle" } });
    const id = await makeVehicle();
    const row = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("draft");
    expect(await prisma.auditLog.count({ where: { action: "create", entityType: "vehicle" } })).toBe(before + 1);
  });
});

describe("getVehicle — round-trips localized array fields and images", () => {
  it("splits/rejoins features and whyChoose (lines), preserves image order", async () => {
    const id = await makeVehicle();
    mockSessionFor(users.viewer);
    const result = await getVehicle(id);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.features.en).toBe("Feature one\nFeature two");
      expect(result.data.whyChoose.en).toBe("Reason one\nReason two");
      expect(result.data.images).toHaveLength(1);
      expect(result.data.images[0]?.mediaId).toBe(sharedMediaId);
    }
  });
});

describe("updateVehicle", () => {
  it("viewer (read-only) is denied", async () => {
    const id = await makeVehicle();
    mockSessionFor(users.viewer);
    const result = await updateVehicle(id, fixtureInput({ name: "Hacked" }));
    expect(result.success).toBe(false);
  });

  it("content_manager can update, and slug can be reused by the same row", async () => {
    const slug = `vitest-self-${Math.random().toString(36).slice(2, 8)}`;
    const id = await makeVehicle({ slug });
    mockSessionFor(users.fleet_manager);
    const result = await updateVehicle(id, fixtureInput({ slug, name: "Updated Name" }));
    expect(result.success).toBe(true);
    const row = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
    expect(row.name).toBe("Updated Name");
  });

  it("replaces the image set on update", async () => {
    const media2 = await prisma.mediaItem.create({
      data: {
        filename: "vitest2.jpg", originalFilename: "vitest2.jpg", mimeType: "image/jpeg", sizeBytes: 100,
        alt: emptyLocalizedText("Second image"), type: "image", storageProvider: "local", storagePath: "vitest/vitest2.jpg", url: "/vitest/vitest2.jpg",
      },
    });
    mediaItemIds.push(media2.id);

    const id = await makeVehicle();
    mockSessionFor(users.fleet_manager);
    const result = await updateVehicle(id, fixtureInput({ imageIds: [media2.id] }));
    expect(result.success).toBe(true);

    const detail = await getVehicle(id);
    expect(detail.success).toBe(true);
    if (detail.success) {
      expect(detail.data.images).toHaveLength(1);
      expect(detail.data.images[0]?.mediaId).toBe(media2.id);
    }
  });
});

describe("setVehicleStatus — publish/unpublish/archive", () => {
  it("publishing stamps publishedAt; unpublishing keeps it (not cleared)", async () => {
    const id = await makeVehicle();
    mockSessionFor(users.fleet_manager);

    const publishResult = await setVehicleStatus(id, "published");
    expect(publishResult.success).toBe(true);
    const afterPublish = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
    expect(afterPublish.status).toBe("published");
    expect(afterPublish.publishedAt).not.toBeNull();

    const unpublishResult = await setVehicleStatus(id, "draft");
    expect(unpublishResult.success).toBe(true);
    const afterUnpublish = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
    expect(afterUnpublish.status).toBe("draft");
  });

  it("seo_manager lacks fleet:publish and is denied", async () => {
    const id = await makeVehicle();
    mockSessionFor(users.seo_manager);
    const result = await setVehicleStatus(id, "published");
    expect(result.success).toBe(false);
  });
});

describe("softDeleteVehicle / restoreVehicle", () => {
  it("soft-deletes and excludes from listVehicles by default", async () => {
    const id = await makeVehicle();
    mockSessionFor(users.fleet_manager);
    const deleteResult = await softDeleteVehicle(id);
    expect(deleteResult.success).toBe(true);

    const row = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
    expect(row.deletedAt).not.toBeNull();

    mockSessionFor(users.viewer);
    const listResult = await listVehicles({});
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.items.some((v) => v.id === id)).toBe(false);
    }
  });

  it("restores a soft-deleted vehicle", async () => {
    const id = await makeVehicle();
    mockSessionFor(users.fleet_manager);
    await softDeleteVehicle(id);
    const restoreResult = await restoreVehicle(id);
    expect(restoreResult.success).toBe(true);

    const row = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
    expect(row.deletedAt).toBeNull();
  });
});

describe("listVehicleRates / updateVehicleRates — Pricing module", () => {
  const RATES: VehicleRatesInput = { tenHours: 5000, fiveHours: 3000, oneHour: 800, airport: 1000, extraHour: 650, additionalCity: 650 };

  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await listVehicleRates();
    expect(result.success).toBe(false);
  });

  it("content_manager lacks pricing:read and is denied", async () => {
    mockSessionFor(users.content_manager);
    const result = await listVehicleRates();
    expect(result.success).toBe(false);
  });

  it("fleet_manager can list rates and finds a fixture vehicle with its current rates", async () => {
    const id = await makeVehicle({ rates: RATES });
    mockSessionFor(users.fleet_manager);
    const result = await listVehicleRates();
    expect(result.success).toBe(true);
    if (result.success) {
      const row = result.data.find((v) => v.id === id);
      expect(row).toBeDefined();
      expect(row?.rates).toEqual(RATES);
    }
  });

  it("viewer has pricing:read but not pricing:update", async () => {
    const id = await makeVehicle({ rates: RATES });
    mockSessionFor(users.viewer);
    const listResult = await listVehicleRates();
    expect(listResult.success).toBe(true);

    const updateResult = await updateVehicleRates(id, { ...RATES, oneHour: 900 });
    expect(updateResult.success).toBe(false);
  });

  it("content_manager lacks pricing:update and is denied", async () => {
    const id = await makeVehicle({ rates: RATES });
    mockSessionFor(users.content_manager);
    const result = await updateVehicleRates(id, { ...RATES, oneHour: 900 });
    expect(result.success).toBe(false);
  });

  it("rejects a negative rate", async () => {
    const id = await makeVehicle({ rates: RATES });
    mockSessionFor(users.fleet_manager);
    const result = await updateVehicleRates(id, { ...RATES, oneHour: -50 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-finite rate", async () => {
    const id = await makeVehicle({ rates: RATES });
    mockSessionFor(users.fleet_manager);
    const result = await updateVehicleRates(id, { ...RATES, airport: NaN });
    expect(result.success).toBe(false);
  });

  it("fleet_manager updates rates — persisted, reflected in listVehicleRates, and audit-logged", async () => {
    const id = await makeVehicle({ rates: RATES });
    mockSessionFor(users.fleet_manager);
    const before = await prisma.auditLog.count({ where: { action: "update", entityType: "vehicle", entityId: id } });

    const newRates: VehicleRatesInput = { ...RATES, oneHour: 950, tenHours: 5500 };
    const result = await updateVehicleRates(id, newRates);
    expect(result.success).toBe(true);

    const row = await prisma.vehicle.findUniqueOrThrow({ where: { id } });
    expect(row.rates).toEqual(newRates);

    const listResult = await listVehicleRates();
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.find((v) => v.id === id)?.rates).toEqual(newRates);
    }

    expect(await prisma.auditLog.count({ where: { action: "update", entityType: "vehicle", entityId: id } })).toBe(before + 1);
  });

  it("returns an error for a nonexistent vehicle id", async () => {
    mockSessionFor(users.fleet_manager);
    const result = await updateVehicleRates("nonexistent-vehicle-id", RATES);
    expect(result.success).toBe(false);
  });
});
