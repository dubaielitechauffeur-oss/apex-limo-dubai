import { randomUUID } from "node:crypto";

/**
 * Generates the storage key every uploaded file is saved under —
 * `<year>/<month>/<uuid>.<ext>`. Never derived from the client's filename,
 * which eliminates path traversal by construction rather than by
 * sanitizing an attacker-controlled string: there is no user input in this
 * path at all. `MediaItem.originalFilename` keeps the human-readable name
 * separately, for display only.
 */
export function generateStorageKey(extension: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}/${month}/${randomUUID()}.${extension}`;
}
