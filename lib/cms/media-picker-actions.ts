"use server";

import { listMedia, type MediaListItem } from "@/lib/media/items";

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
  const result = await listMedia({ q: query || undefined, type: "image", pageSize: 24 });
  if (!result.success) return [];
  return result.data.items.map(toPickerResult);
}

/** The picker's default (pre-search) grid — called from CMS create/edit
 *  Server Components so the modal isn't empty on first open. */
export async function getInitialMediaPickerItems(): Promise<MediaPickerResult[]> {
  return searchMediaForPicker("");
}
