import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { StorageDriver, StoredFile } from "./types";

/**
 * Dev/single-instance storage driver. Files live in `storage/media/` at the
 * repo root — deliberately outside `public/` (see DATABASE_ARCHITECTURE.md
 * §7: "files in a non-public directory, served through an API route") so
 * the storage layer and the URL layer stay decoupled from day one, exactly
 * as they'll need to be once a real S3/R2 driver replaces this one. Files
 * are served back out through `app/uploads/[...path]/route.ts`, not
 * Next.js static file serving.
 *
 * Not suitable for a multi-instance/serverless production deployment —
 * writes aren't shared across instances and don't survive a redeploy. That
 * is an accepted, documented limitation for this phase (see
 * MEDIA_LIBRARY.md); production goes live on the S3 or R2 driver.
 */
const STORAGE_ROOT = path.resolve(process.cwd(), "storage", "media");

/** Resolves a storage key to an absolute path, refusing anything that
 *  would escape `STORAGE_ROOT`. Exported so `app/uploads/[...path]/route.ts`
 *  — the one place a storage key comes from a URL (real user input) rather
 *  than `lib/media/keys.ts` — can apply the exact same guard. */
export function resolveWithinRoot(key: string): string {
  const resolved = path.resolve(STORAGE_ROOT, key);
  if (resolved !== STORAGE_ROOT && !resolved.startsWith(STORAGE_ROOT + path.sep)) {
    throw new Error("Refusing to resolve a storage key outside the media storage root.");
  }
  return resolved;
}

export class LocalStorageDriver implements StorageDriver {
  readonly provider = "local" as const;

  async save({ key, buffer }: { key: string; buffer: Buffer; contentType: string }): Promise<StoredFile> {
    const absolutePath = resolveWithinRoot(key);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);
    return { storagePath: key, url: `/uploads/${key}` };
  }

  async delete(storagePath: string): Promise<void> {
    const absolutePath = resolveWithinRoot(storagePath);
    try {
      await unlink(absolutePath);
    } catch (error) {
      // Already gone (e.g. re-running a failed delete) is not itself an
      // error worth surfacing to the caller — the DB row is the source of
      // truth for whether the media "exists".
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}

export { STORAGE_ROOT };
