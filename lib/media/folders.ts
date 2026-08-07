import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import { requireMediaPermission } from "./guard";

export interface MediaFolderNode {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  itemCount: number;
  childCount: number;
}

/** Flat list (not a nested tree) — the admin UI builds hierarchy display
 *  from `parentId` client-side, which is simpler than shipping two shapes
 *  of the same data. Folders are purely organizational (DATABASE_ARCHITECTURE.md
 *  §7: "no effect on storage paths or URLs"). */
export async function listFolders(): Promise<RoleAdminResult<MediaFolderNode[]>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_READ);
  if (!gate.success) return gate;

  const folders = await prisma.mediaFolder.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { items: { where: { deletedAt: null } }, children: true } },
    },
  });

  return {
    success: true,
    data: folders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      sortOrder: f.sortOrder,
      itemCount: f._count.items,
      childCount: f._count.children,
    })),
  };
}

export async function createFolder(name: string, parentId: string | null): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_CREATE);
  if (!gate.success) return gate;

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Folder name is required." };

  if (parentId) {
    const parent = await prisma.mediaFolder.findUnique({ where: { id: parentId } });
    if (!parent) return { success: false, error: "Parent folder not found." };
  }

  const folder = await prisma.mediaFolder.create({ data: { name: trimmed, parentId } });
  await writeAuditLog({
    action: "create",
    entityType: "media_folder",
    entityId: folder.id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "name", after: trimmed }],
  });

  return { success: true, data: { id: folder.id } };
}

export async function renameFolder(id: string, name: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_UPDATE);
  if (!gate.success) return gate;

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Folder name is required." };

  const folder = await prisma.mediaFolder.findUnique({ where: { id } });
  if (!folder) return { success: false, error: "Folder not found." };

  await prisma.mediaFolder.update({ where: { id }, data: { name: trimmed } });
  await writeAuditLog({
    action: "update",
    entityType: "media_folder",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "name", before: folder.name, after: trimmed }],
  });

  return { success: true, data: { id } };
}

/** Walks the parent chain from `candidateParentId` up to the root, refusing
 *  a move if `folderId` appears anywhere in that chain (a cycle) or is the
 *  target itself — the two ways a self-referencing tree can corrupt. */
async function wouldCreateCycle(folderId: string, candidateParentId: string): Promise<boolean> {
  if (folderId === candidateParentId) return true;

  let current: { id: string; parentId: string | null } | null = await prisma.mediaFolder.findUnique({
    where: { id: candidateParentId },
    select: { id: true, parentId: true },
  });

  const visited = new Set<string>();
  while (current?.parentId) {
    if (current.parentId === folderId) return true;
    if (visited.has(current.parentId)) break; // already-corrupt data — stop rather than loop forever
    visited.add(current.parentId);
    current = await prisma.mediaFolder.findUnique({
      where: { id: current.parentId },
      select: { id: true, parentId: true },
    });
  }
  return false;
}

export async function moveFolder(id: string, newParentId: string | null): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_UPDATE);
  if (!gate.success) return gate;

  const folder = await prisma.mediaFolder.findUnique({ where: { id } });
  if (!folder) return { success: false, error: "Folder not found." };

  if (newParentId) {
    const parent = await prisma.mediaFolder.findUnique({ where: { id: newParentId } });
    if (!parent) return { success: false, error: "Target parent folder not found." };
    if (await wouldCreateCycle(id, newParentId)) {
      return { success: false, error: "Cannot move a folder into itself or one of its own subfolders." };
    }
  }

  await prisma.mediaFolder.update({ where: { id }, data: { parentId: newParentId } });
  return { success: true, data: { id } };
}

export async function deleteFolder(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireMediaPermission(PERMISSIONS.MEDIA_DELETE);
  if (!gate.success) return gate;

  const folder = await prisma.mediaFolder.findUnique({
    where: { id },
    include: { _count: { select: { items: { where: { deletedAt: null } }, children: true } } },
  });
  if (!folder) return { success: false, error: "Folder not found." };

  if (folder._count.items > 0 || folder._count.children > 0) {
    return {
      success: false,
      error: `This folder isn't empty (${folder._count.items} file(s), ${folder._count.children} subfolder(s)). Move or delete its contents first.`,
    };
  }

  await prisma.mediaFolder.delete({ where: { id } });
  await writeAuditLog({
    action: "delete",
    entityType: "media_folder",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "name", before: folder.name }],
  });

  return { success: true, data: { id } };
}
