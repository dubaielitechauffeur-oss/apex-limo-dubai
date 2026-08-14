import { put, del } from "@vercel/blob";
import type { StorageDriver, StoredFile } from "./types";

/**
 * Vercel Blob storage driver. Serverless-safe replacement for
 * LocalStorageDriver (which writes to a read-only filesystem on
 * Vercel and therefore fails silently in production). Enabled by
 * setting the `BLOB_READ_WRITE_TOKEN` environment variable on the
 * Vercel project — see MEDIA_LIBRARY.md for the exact provisioning
 * steps.
 *
 * We store under the `StorageProvider` enum value `s3` — the enum
 * doesn't have a dedicated `vercel_blob` value yet, and reusing `s3`
 * (generic "cloud object storage") avoids a Prisma migration.
 * Existing MediaItem rows with `storageProvider: "local"` and
 * `storagePath` pointing at `/images/...` continue to be served
 * straight from Vercel's static asset CDN — this driver only owns
 * NEW uploads.
 */
export class VercelBlobStorageDriver implements StorageDriver {
  readonly provider = "s3" as const;

  async save({ key, buffer, contentType }: { key: string; buffer: Buffer; contentType: string }): Promise<StoredFile> {
    // `access: 'public'` gives us a stable, CDN-served URL we can
    // drop directly into <img>/<Image> tags — no signed URLs, no
    // per-request proxy. `addRandomSuffix: false` keeps the key we
    // computed as the object path so `storagePath === key` stays
    // meaningful (the local driver holds the same contract).
    const { url } = await put(key, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return { storagePath: key, url };
  }

  async delete(storagePath: string): Promise<void> {
    // `del` accepts either the full URL or a pathname; storing the key
    // gives us the pathname form. Failures are surfaced — a missing
    // object still succeeds under Vercel Blob's semantics.
    await del(storagePath);
  }
}
