import type { StorageProvider } from "@/lib/generated/prisma/client";

/**
 * Provider-agnostic storage contract. `MediaItem.storageProvider` names
 * which driver wrote a given row; `MediaItem.storagePath` is only ever
 * meaningful to that driver, while `MediaItem.url` is what every caller
 * (admin UI, future public CMS fields) actually renders — see
 * DATABASE_ARCHITECTURE.md §7 for why those two columns are kept separate.
 *
 * `local` (this phase) is the only implemented driver. `s3`/`r2` are
 * reserved by the `StorageProvider` enum and routed to a clear
 * "not configured" error rather than silently falling back to local — see
 * `index.ts`. Swapping in a real S3/R2 implementation later means adding
 * one file that satisfies this interface; nothing above the storage layer
 * (upload handler, lib/media/items.ts, the admin UI) needs to change.
 */
export interface StoredFile {
  /** Provider-internal path/key — never exposed to the browser directly. */
  storagePath: string;
  /** Public-facing URL the app renders in <img>/<Image> tags. */
  url: string;
}

export interface StorageDriver {
  readonly provider: StorageProvider;
  save(input: { key: string; buffer: Buffer; contentType: string }): Promise<StoredFile>;
  delete(storagePath: string): Promise<void>;
}
