import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import { ensureMediaPickerItems, type MediaPickerResult } from "@/lib/cms/media-picker-actions";

let users: Record<SystemRole, TestUser>;
const mediaItemIds: string[] = [];

async function createMediaItem(originalFilename: string) {
  const item = await prisma.mediaItem.create({
    data: {
      filename: `${Math.random().toString(36).slice(2, 8)}-${originalFilename}`,
      originalFilename,
      mimeType: "image/png",
      sizeBytes: 100,
      width: 10,
      height: 10,
      alt: { en: originalFilename },
      type: "image",
      storagePath: `vitest/${originalFilename}`,
      url: `/uploads/vitest/${originalFilename}`,
    },
  });
  mediaItemIds.push(item.id);
  return item.id;
}

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.mediaItem.deleteMany({ where: { id: { in: mediaItemIds } } });
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

/**
 * Regression coverage for a real data-loss bug found while browser-testing
 * Phase 9's Fleet CMS: `getInitialMediaPickerItems()` only returns the
 * library's most-recently-uploaded page (24 items). A vehicle whose gallery
 * images or OG image were uploaded earlier than that window resolved to
 * "no selection" in the edit form, so an ordinary "Save changes" click
 * silently wiped the real image references. `ensureMediaPickerItems` closes
 * that gap by fetching any referenced id missing from the base page.
 */
describe("ensureMediaPickerItems — guarantees referenced ids resolve regardless of pagination", () => {
  it("leaves the list untouched when every referenced id is already present", async () => {
    const id = await createMediaItem("already-present.png");
    const base: MediaPickerResult[] = [{ id, url: "/x", originalFilename: "already-present.png", alt: "x" }];

    mockSessionFor(users.content_manager);
    const result = await ensureMediaPickerItems(base, [id]);
    expect(result).toEqual(base);
  });

  it("fetches and appends a referenced id that falls outside the base page", async () => {
    const outsidePageId = await createMediaItem("older-upload.png");

    mockSessionFor(users.content_manager);
    const result = await ensureMediaPickerItems([], [outsidePageId]);
    expect(result.some((item) => item.id === outsidePageId)).toBe(true);
    expect(result.find((item) => item.id === outsidePageId)?.originalFilename).toBe("older-upload.png");
  });

  it("handles multiple missing ids (a vehicle's whole gallery) in one call", async () => {
    const id1 = await createMediaItem("gallery-1.png");
    const id2 = await createMediaItem("gallery-2.png");
    const id3 = await createMediaItem("gallery-3.png");

    mockSessionFor(users.content_manager);
    const result = await ensureMediaPickerItems([], [id1, id2, id3]);
    expect(result.map((item) => item.id).sort()).toEqual([id1, id2, id3].sort());
  });

  it("ignores null/undefined/empty-string ids without erroring (e.g. an unset OG image)", async () => {
    mockSessionFor(users.content_manager);
    const result = await ensureMediaPickerItems([], [null, undefined, ""]);
    expect(result).toEqual([]);
  });

  it("silently skips an id that no longer resolves (soft-deleted) rather than throwing", async () => {
    const id = await createMediaItem("will-be-deleted.png");
    await prisma.mediaItem.update({ where: { id }, data: { deletedAt: new Date() } });

    mockSessionFor(users.content_manager);
    const result = await ensureMediaPickerItems([], [id]);
    expect(result).toEqual([]);
  });

  it("de-duplicates when the same missing id is referenced twice (gallery image reused as OG image)", async () => {
    const id = await createMediaItem("reused.png");

    mockSessionFor(users.content_manager);
    const result = await ensureMediaPickerItems([], [id, id]);
    expect(result.filter((item) => item.id === id).length).toBe(1);
  });
});
