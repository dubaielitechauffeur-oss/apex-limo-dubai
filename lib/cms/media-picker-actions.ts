"use server";

import { listMedia, getMediaItem, type MediaListItem } from "@/lib/media/items";

export interface MediaPickerResult {
  id: string;
  url: string;
  originalFilename: string;
  alt: string;
}

function toPickerResult(item: MediaListItem): MediaPickerResult {
  return { id: item.id, url: item.url, originalFilename: item.originalFilename, alt: item.alt.en || item.originalFilename };
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
