"use server";

import { revalidatePath } from "next/cache";
import { listMedia, getMediaItem, uploadMedia, type MediaListItem } from "@/lib/media/items";

export interface MediaPickerResult {
  id: string;
  url: string;
  originalFilename: string;
  alt: string;
}

function toPickerResult(item: MediaListItem): MediaPickerResult {
  return { id: item.id, url: item.url, originalFilename: item.originalFilename, alt: item.alt.en || item.originalFilename };
}

/** Directly upload a file from a CMS picker modal (e.g. VehicleForm's
 *  MediaPickerField) and return the picker result so the caller can select
 *  it immediately, without navigating away to /admin/media. Same permission
 *  check as the standalone upload — `media:create` — enforced inside
 *  `uploadMedia()` itself. */
export async function uploadMediaForPicker(
  formData: FormData
): Promise<{ success: true; data: MediaPickerResult } | { success: false; error: string }> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Choose a file to upload." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadMedia({
      buffer,
      originalFilename: file.name,
      folderId: null,
      variant: null,
    });
    if (!result.success) return { success: false, error: result.error };
    revalidatePath("/admin/media");
    return { success: true, data: toPickerResult(result.data) };
  } catch (err) {
    console.error("[uploadMediaForPicker] failed:", err);
    return { success: false, error: `Upload failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/** Backs the CMS `MediaPickerField` modal's search box. Reuses
 *  `lib/media/items.ts`'s `listMedia()` as-is (permission-gated on
 *  `media:read`) — no parallel media-listing query was written for this. */
export async function searchMediaForPicker(query: string): Promise<MediaPickerResult[]> {
  // Show up to 100 items so galleries with more than the previous 24 don't
  // silently omit assets. `ensureMediaPickerItems()` handles the tail beyond
  // this on the record's own referenced ids.
  const result = await listMedia({ q: query || undefined, type: "image", pageSize: 100 });
  if (!result.success) return [];
  return result.data.items.map(toPickerResult);
}

/** The picker's default (pre-search) grid — called from CMS create/edit
 *  Server Components so the modal isn't empty on first open. */
export async function getInitialMediaPickerItems(): Promise<MediaPickerResult[]> {
  return searchMediaForPicker("");
}

/**
 * Guarantees `alreadyReferencedIds` are present in the returned list, even
 * when they fall outside `getInitialMediaPickerItems()`'s most-recent page.
 * Without this, editing a record whose image(s) were uploaded earlier than
 * the library's newest ~24 items resolves the current selection to nothing
 * — `MediaPickerField`/`VehicleImagesManager` then render as unselected and
 * a plain "Save" silently drops the real reference. Call with the record's
 * own image/OG-image id(s) alongside the default grid.
 */
export async function ensureMediaPickerItems(
  baseItems: MediaPickerResult[],
  alreadyReferencedIds: (string | null | undefined)[]
): Promise<MediaPickerResult[]> {
  const present = new Set(baseItems.map((item) => item.id));
  const missingIds = [...new Set(alreadyReferencedIds.filter((id): id is string => id != null && id !== "" && !present.has(id)))];
  if (missingIds.length === 0) return baseItems;

  const fetched = await Promise.all(missingIds.map((id) => getMediaItem(id)));
  const extra: MediaPickerResult[] = [];
  for (const result of fetched) {
    if (result.success) extra.push(toPickerResult(result.data));
  }

  return [...baseItems, ...extra];
}
