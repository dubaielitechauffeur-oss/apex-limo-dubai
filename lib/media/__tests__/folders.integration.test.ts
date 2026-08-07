import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

import { prisma } from "@/lib/db";
import { listFolders, createFolder, renameFolder, moveFolder, deleteFolder } from "@/lib/media/folders";
import { uploadMedia } from "@/lib/media/items";
import { unlink } from "node:fs/promises";
import path from "node:path";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

let users: Record<SystemRole, TestUser>;
const createdFolderIds: string[] = [];
const createdStoragePaths: string[] = [];

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.mediaItem.deleteMany({ where: { uploadedById: { in: Object.values(users).map((u) => u.id) } } });
  await prisma.mediaFolder.deleteMany({ where: { id: { in: createdFolderIds } } });
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

async function makeFolder(name: string, parentId: string | null = null): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createFolder(name, parentId);
  if (!result.success) throw new Error(`Fixture folder creation failed: ${result.error}`);
  createdFolderIds.push(result.data.id);
  return result.data.id;
}

describe("createFolder / listFolders — permission gating", () => {
  it("is denied without media:create", async () => {
    mockSessionFor(users.booking_manager);
    const result = await createFolder("vitest-denied-folder", null);
    expect(result.success).toBe(false);
  });

  it("rejects an empty/whitespace-only name", async () => {
    mockSessionFor(users.content_manager);
    const result = await createFolder("   ", null);
    expect(result.success).toBe(false);
  });

  it("content_manager can create a root folder and it appears in listFolders", async () => {
    const id = await makeFolder("vitest-root-folder");
    mockSessionFor(users.viewer);
    const result = await listFolders();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.some((f) => f.id === id)).toBe(true);
    }
  });

  it("rejects a folder targeting a nonexistent parent", async () => {
    mockSessionFor(users.content_manager);
    const result = await createFolder("vitest-orphan", "nonexistent-parent-id");
    expect(result.success).toBe(false);
  });
});

describe("renameFolder", () => {
  it("is denied without media:update", async () => {
    const id = await makeFolder("vitest-rename-target");
    mockSessionFor(users.booking_manager);
    const result = await renameFolder(id, "hacked name");
    expect(result.success).toBe(false);
  });

  it("renames successfully for an authorized user", async () => {
    const id = await makeFolder("vitest-rename-before");
    mockSessionFor(users.content_manager);
    const result = await renameFolder(id, "vitest-rename-after");
    expect(result.success).toBe(true);
    const row = await prisma.mediaFolder.findUniqueOrThrow({ where: { id } });
    expect(row.name).toBe("vitest-rename-after");
  });
});

describe("moveFolder — cycle prevention", () => {
  it("moves a folder to a new valid parent", async () => {
    const parentId = await makeFolder("vitest-move-parent");
    const childId = await makeFolder("vitest-move-child");

    mockSessionFor(users.content_manager);
    const result = await moveFolder(childId, parentId);
    expect(result.success).toBe(true);

    const row = await prisma.mediaFolder.findUniqueOrThrow({ where: { id: childId } });
    expect(row.parentId).toBe(parentId);
  });

  it("refuses to move a folder into itself", async () => {
    const id = await makeFolder("vitest-self-parent");
    mockSessionFor(users.content_manager);
    const result = await moveFolder(id, id);
    expect(result.success).toBe(false);
  });

  it("refuses to move a folder into its own descendant (A -> B -> C, then move A under C)", async () => {
    const a = await makeFolder("vitest-cycle-a");
    const b = await makeFolder("vitest-cycle-b", a);
    const c = await makeFolder("vitest-cycle-c", b);

    mockSessionFor(users.content_manager);
    const result = await moveFolder(a, c);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/subfolder/i);

    // Confirm nothing actually changed.
    const row = await prisma.mediaFolder.findUniqueOrThrow({ where: { id: a } });
    expect(row.parentId).toBeNull();
  });
});

describe("deleteFolder — empty-only safety", () => {
  it("is denied without media:delete", async () => {
    const id = await makeFolder("vitest-delete-denied");
    mockSessionFor(users.viewer);
    const result = await deleteFolder(id);
    expect(result.success).toBe(false);
  });

  it("refuses to delete a folder that still has media in it", async () => {
    const id = await makeFolder("vitest-nonempty-folder");

    mockSessionFor(users.content_manager);
    const uploadResult = await uploadMedia({ buffer: PNG_1X1, originalFilename: "in-folder.png", folderId: id });
    expect(uploadResult.success).toBe(true);
    if (uploadResult.success) {
      const row = await prisma.mediaItem.findUniqueOrThrow({ where: { id: uploadResult.data.id } });
      createdStoragePaths.push(row.storagePath);
    }

    const result = await deleteFolder(id);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/isn't empty/i);
  });

  it("refuses to delete a folder that still has subfolders", async () => {
    const parentId = await makeFolder("vitest-parent-with-child");
    await makeFolder("vitest-child-blocking-delete", parentId);

    mockSessionFor(users.content_manager);
    const result = await deleteFolder(parentId);
    expect(result.success).toBe(false);
  });

  it("deletes successfully once truly empty", async () => {
    const id = await makeFolder("vitest-truly-empty");
    mockSessionFor(users.content_manager);
    const result = await deleteFolder(id);
    expect(result.success).toBe(true);

    const row = await prisma.mediaFolder.findUnique({ where: { id } });
    expect(row).toBeNull();
    createdFolderIds.splice(createdFolderIds.indexOf(id), 1);
  });
});
