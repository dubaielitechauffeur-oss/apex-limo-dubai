"use server";

import { revalidatePath } from "next/cache";
import { uploadMedia, updateMediaMetadata, deleteMedia, type LocalizedText } from "@/lib/media/items";
import { createFolder, renameFolder, moveFolder, deleteFolder } from "@/lib/media/folders";
import { routing } from "@/i18n/routing";
import type { ImageVariant } from "@/lib/generated/prisma/client";

/**
 * Thin Server Action wrappers around lib/media/*. No authorization logic
 * lives here — every permission/escalation check happens exactly once,
 * inside the functions these call (same pattern as
 * app/admin/(dashboard)/users/[id]/actions.ts).
 */

export interface MediaActionState {
  error?: string;
  success?: string;
}

function readVariant(formData: FormData): ImageVariant | null {
  const raw = String(formData.get("variant") ?? "");
  return raw ? (raw as ImageVariant) : null;
}

export async function uploadMediaAction(_prevState: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folderId = String(formData.get("folderId") ?? "") || null;

  const result = await uploadMedia({
    buffer,
    originalFilename: file.name,
    folderId,
    variant: readVariant(formData),
  });

  if (!result.success) return { error: result.error };

  revalidatePath("/admin/media");
  return { success: `Uploaded "${result.data.originalFilename}".` };
}

function readLocalizedField(formData: FormData, prefix: string): LocalizedText {
  const value: LocalizedText = {};
  for (const locale of routing.locales) {
    value[locale] = String(formData.get(`${prefix}_${locale}`) ?? "");
  }
  return value;
}

export async function updateMediaMetadataAction(_prevState: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing media id." };

  const folderId = String(formData.get("folderId") ?? "") || null;

  const result = await updateMediaMetadata(id, {
    alt: readLocalizedField(formData, "alt"),
    caption: readLocalizedField(formData, "caption"),
    folderId,
    variant: readVariant(formData),
  });

  if (!result.success) return { error: result.error };

  revalidatePath("/admin/media");
  revalidatePath(`/admin/media/${id}`);
  return { success: "Media details updated." };
}

export async function deleteMediaAction(id: string): Promise<MediaActionState> {
  const result = await deleteMedia(id);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/media");
  return { success: "Media item deleted." };
}

export async function createFolderAction(_prevState: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const name = String(formData.get("name") ?? "");
  const parentId = String(formData.get("parentId") ?? "") || null;

  const result = await createFolder(name, parentId);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/media");
  return { success: `Folder "${name.trim()}" created.` };
}

export async function renameFolderAction(id: string, name: string): Promise<MediaActionState> {
  const result = await renameFolder(id, name);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/media");
  return { success: "Folder renamed." };
}

export async function moveFolderAction(id: string, newParentId: string | null): Promise<MediaActionState> {
  const result = await moveFolder(id, newParentId);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/media");
  return { success: "Folder moved." };
}

export async function deleteFolderAction(id: string): Promise<MediaActionState> {
  const result = await deleteFolder(id);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/media");
  return { success: "Folder deleted." };
}
