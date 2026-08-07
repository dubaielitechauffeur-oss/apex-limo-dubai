import type { StorageProvider } from "@/lib/generated/prisma/client";
import type { StorageDriver } from "./types";
import { LocalStorageDriver } from "./local";

export type { StorageDriver, StoredFile } from "./types";

const localDriver = new LocalStorageDriver();

/**
 * Provider factory. `local` is the only implemented driver this phase —
 * `s3`/`r2` are real, already-reserved values on the `StorageProvider`
 * enum (so `MediaItem` rows can name them once a driver exists) but throw a
 * clear configuration error rather than silently writing to local disk,
 * which would be a confusing surprise in a future deployment that thinks
 * it configured cloud storage. See MEDIA_LIBRARY.md's migration path for
 * what implementing one of these involves.
 */
export function getStorageDriver(provider: StorageProvider = "local"): StorageDriver {
  switch (provider) {
    case "local":
      return localDriver;
    case "s3":
    case "r2":
      throw new Error(
        `Storage provider "${provider}" is not configured yet. Implement lib/media/storage/${provider}.ts ` +
          `(satisfying the StorageDriver interface) and wire it in here — see MEDIA_LIBRARY.md.`
      );
    default:
      provider satisfies never;
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}

/** The provider new uploads use — a single switch point for a future
 *  cutover to S3/R2 (e.g. reading `process.env.MEDIA_STORAGE_PROVIDER`
 *  once a cloud driver exists). Hardcoded to "local" for this phase. */
export function getDefaultStorageProvider(): StorageProvider {
  return "local";
}
