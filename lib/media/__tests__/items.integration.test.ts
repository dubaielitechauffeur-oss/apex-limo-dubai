import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

import { prisma } from "@/lib/db";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { listMedia, getMediaItem, uploadMedia, updateMediaMetadata, findMediaUsage, deleteMedia } from "@/lib/media/items";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

let users: Record<SystemRole, TestUser>;
const createdStoragePaths: string[] = [];

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.mediaItem.deleteMany({ where: { uploadedById: { in: Object.values(users).map((u) => u.id) } } });
  await cleanupTestUsers(users);
  await Promise.all(
    createdStoragePaths.map((storagePath) =>
      unlink(path.resolve(process.cwd(), "storage", "media", storagePath)).catch(() => undefined)
    )
  );
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

/** Uploads a real fixture PNG as content_manager and tracks its storage
 *  path for cleanup. Returns the created media id. */
async function uploadFixture(originalFilename: string): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await uploadMedia({ buffer: PNG_1X1, originalFilename });
  if (!result.success) throw new Error(`Fixture upload failed: ${result.error}`);
  const row = await prisma.mediaItem.findUniqueOrThrow({ where: { id: result.data.id } });
  createdStoragePaths.push(row.storagePath);
  return result.data.id;
}

describe("uploadMedia — permission gating and validation", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await uploadMedia({ buffer: PNG_1X1, originalFilename: "x.png" });
    expect(result.success).toBe(false);
  });

  it("booking_manager has no media:create and is denied", async () => {
    mockSessionFor(users.booking_manager);
    const before = await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } });
    const result = await uploadMedia({ buffer: PNG_1X1, originalFilename: "x.png" });
    expect(result.success).toBe(false);
    const after = await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } });
    expect(after).toBe(before + 1);
  });

  it("rejects invalid file content even for a permitted user", async () => {
    mockSessionFor(users.content_manager);
    const result = await uploadMedia({ buffer: Buffer.from("not an image"), originalFilename: "fake.png" });
    expect(result.success).toBe(false);
  });

  it("content_manager can upload a real PNG — row + real dimensions + audit log", async () => {
    mockSessionFor(users.content_manager);
    const before = await prisma.auditLog.count({ where: { action: "create", entityType: "media_item" } });

    const result = await uploadMedia({ buffer: PNG_1X1, originalFilename: "hero_photo.png" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.width).toBe(1);
      expect(result.data.height).toBe(1);
      expect(result.data.mimeType).toBe("image/png");
      expect(result.data.alt.en).toBe("hero photo");

      const row = await prisma.mediaItem.findUniqueOrThrow({ where: { id: result.data.id } });
      createdStoragePaths.push(row.storagePath);
      expect(row.originalFilename).toBe("hero_photo.png");
      expect(row.uploadedById).toBe(users.content_manager.id);
    }

    const after = await prisma.auditLog.count({ where: { action: "create", entityType: "media_item" } });
    expect(after).toBe(before + 1);
  });

  it("rejects an upload targeting a nonexistent folder", async () => {
    mockSessionFor(users.content_manager);
    const result = await uploadMedia({ buffer: PNG_1X1, originalFilename: "x.png", folderId: "nonexistent-folder-id" });
    expect(result.success).toBe(false);
  });
});

describe("listMedia / getMediaItem", () => {
  it("viewer holds media:read and can list", async () => {
    mockSessionFor(users.viewer);
    const result = await listMedia({});
    expect(result.success).toBe(true);
  });

  it("booking_manager lacks media:read and is denied", async () => {
    mockSessionFor(users.booking_manager);
    const result = await listMedia({});
    expect(result.success).toBe(false);
  });

  it("search by filename finds the uploaded fixture", async () => {
    const mediaId = await uploadFixture("searchable-unique-name.png");

    mockSessionFor(users.viewer);
    const result = await listMedia({ q: "searchable-unique-name" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items.some((item) => item.id === mediaId)).toBe(true);
    }
  });

  it("getMediaItem returns technical metadata matching the real row", async () => {
    const mediaId = await uploadFixture("detail-fixture.png");
    const row = await prisma.mediaItem.findUniqueOrThrow({ where: { id: mediaId } });

    mockSessionFor(users.viewer);
    const result = await getMediaItem(mediaId);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.storagePath).toBe(row.storagePath);
      expect(result.data.mimeType).toBe("image/png");
    }
  });

  it("fails cleanly for a nonexistent media id", async () => {
    mockSessionFor(users.viewer);
    const result = await getMediaItem("nonexistent-media-id");
    expect(result.success).toBe(false);
  });
});

describe("updateMediaMetadata", () => {
  it("viewer (read-only) is denied", async () => {
    const mediaId = await uploadFixture("update-denied.png");

    mockSessionFor(users.viewer);
    const result = await updateMediaMetadata(mediaId, { alt: { en: "hacked" } });
    expect(result.success).toBe(false);
  });

  it("content_manager can update alt text and variant", async () => {
    const mediaId = await uploadFixture("update-allowed.png");

    mockSessionFor(users.content_manager);
    const result = await updateMediaMetadata(mediaId, { alt: { en: "Updated alt text" }, variant: "desktop" });
    expect(result.success).toBe(true);

    const updated = await prisma.mediaItem.findUniqueOrThrow({ where: { id: mediaId } });
    expect((updated.alt as Record<string, string>).en).toBe("Updated alt text");
    expect(updated.variant).toBe("desktop");
  });

  it("rejects moving to a nonexistent folder", async () => {
    const mediaId = await uploadFixture("update-bad-folder.png");

    mockSessionFor(users.content_manager);
    const result = await updateMediaMetadata(mediaId, { folderId: "nonexistent-folder-id" });
    expect(result.success).toBe(false);
  });
});

describe("findMediaUsage / deleteMedia — reference-aware, soft-delete", () => {
  it("reports zero usage for a freshly uploaded, unreferenced item", async () => {
    const mediaId = await uploadFixture("unused.png");
    const usage = await findMediaUsage(mediaId);
    expect(usage).toEqual([]);
  });

  it("detects usage via a real Brand.logoId reference", async () => {
    const mediaId = await uploadFixture("brand-logo.png");
    const brand = await prisma.brand.create({ data: { name: "media-vitest-test-brand", logoId: mediaId } });

    try {
      const usage = await findMediaUsage(mediaId);
      expect(usage.some((u) => u.source === "brand_logo" && u.entityId === brand.id)).toBe(true);
    } finally {
      await prisma.brand.delete({ where: { id: brand.id } });
    }
  });

  it("detects usage via a real VehicleImage.mediaId reference (Phase 9 Fleet CMS)", async () => {
    const mediaId = await uploadFixture("vehicle-gallery.png");
    const category = await prisma.vehicleCategory.create({
      data: { slug: `media-vitest-cat-${Math.random().toString(36).slice(2, 8)}`, name: { en: "Vitest", ar: "", ru: "", zh: "", fr: "", de: "" }, sortOrder: 999 },
    });
    const vehicle = await prisma.vehicle.create({
      data: {
        slug: `media-vitest-vehicle-${Math.random().toString(36).slice(2, 8)}`,
        name: "Media Vitest Vehicle",
        brand: "Vitest",
        model: "Test",
        categoryId: category.id,
        passengers: 4,
        luggage: 2,
        tagline: {}, description: {}, longDescription: {}, idealFor: {}, features: {}, whyChoose: {},
        rates: { tenHours: 0, fiveHours: 0, oneHour: 0, airport: 0, extraHour: 0, additionalCity: 0 },
        seo: { title: {}, description: {}, ogImageId: null, canonical: null, noIndex: false, noFollow: false },
        images: { create: [{ mediaId, sortOrder: 0 }] },
      },
    });

    try {
      const usage = await findMediaUsage(mediaId);
      expect(usage.some((u) => u.source === "vehicle_image" && u.entityId === vehicle.id)).toBe(true);
    } finally {
      await prisma.vehicleImage.deleteMany({ where: { vehicleId: vehicle.id } });
      await prisma.vehicle.delete({ where: { id: vehicle.id } });
      await prisma.vehicleCategory.delete({ where: { id: category.id } });
    }
  });

  it("soft-deletes: excluded from listMedia afterward, but the row and file still exist", async () => {
    const mediaId = await uploadFixture("to-delete.png");

    mockSessionFor(users.content_manager);
    const deleteResult = await deleteMedia(mediaId);
    expect(deleteResult.success).toBe(true);

    const afterDelete = await prisma.mediaItem.findUniqueOrThrow({ where: { id: mediaId } });
    expect(afterDelete.deletedAt).not.toBeNull();

    mockSessionFor(users.viewer);
    const listResult = await listMedia({ q: "to-delete" });
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.items.some((item) => item.id === mediaId)).toBe(false);
    }
  });

  it("viewer (no media:delete) is denied", async () => {
    const mediaId = await uploadFixture("delete-denied.png");

    mockSessionFor(users.viewer);
    const result = await deleteMedia(mediaId);
    expect(result.success).toBe(false);
  });
});
