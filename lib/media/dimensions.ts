import { imageSize } from "image-size";

/**
 * Reads real pixel dimensions from the uploaded bytes (pure-JS, no native
 * binary/`sharp` dependency — see MEDIA_LIBRARY.md for why). Never trusts
 * anything the client claims; returns `null` on any parse failure rather
 * than throwing, since `MediaItem.width`/`height` are nullable and a
 * dimension-read failure must not block an otherwise-valid upload.
 */
export function readImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  try {
    const result = imageSize(buffer);
    if (!result.width || !result.height) return null;
    return { width: result.width, height: result.height };
  } catch {
    return null;
  }
}
