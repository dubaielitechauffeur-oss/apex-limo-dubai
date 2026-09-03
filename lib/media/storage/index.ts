import type { StorageProvider } from "@/lib/generated/prisma/client";
import type { StorageDriver } from "./types";
import { LocalStorageDriver } from "./local";
import { VercelBlobStorageDriver } from "./vercel-blob";

export type { StorageDriver, StoredFile } from "./types";

const localDriver = new LocalStorageDriver();
const vercelBlobDriver = new VercelBlobStorageDriver();

/**
 * Provider factory. The `s3` slot is filled by Vercel Blob (both are
 * public-URL object stores; reusing the enum value avoids a Prisma
 * migration). `r2` remains reserved for a future Cloudflare R2 driver.
 */
export function getStorageDriver(provider: StorageProvider = "local"): StorageDriver {
  switch (provider) {
    case "local":
      return localDriver;
    case "s3":
      return vercelBlobDriver;
    case "r2":
      throw new Error(
        `Storage provider "r2" is not configured yet. Implement lib/media/storage/r2.ts and wire it in here.`
      );
    default:
      provider satisfies never;
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}

/**
 * The provider new uploads use. When `BLOB_READ_WRITE_TOKEN` is set
 * (i.e. Vercel Blob is provisioned on the deployment) new uploads go
 * to Vercel Blob (`s3` slot). Otherwise falls back to the local disk
 * driver — fine for `next dev`, fails on Vercel's read-only serverless
 * filesystem, which is deliberate: it forces the ops step of adding
 * the env var rather than silently swallowing every upload.
 */
export function getDefaultStorageProvider(): StorageProvider {
  return process.env.BLOB_READ_WRITE_TOKEN ? "s3" : "local";
}

/**
 * Explains, in words an admin can act on, why an upload cannot succeed on
 * this deployment — or `null` when storage is usable.
 *
 * The local driver writes to `storage/media/` on disk, which works in
 * `next dev` but not on Vercel, where the filesystem is read-only outside
 * `/tmp`. Without this check the failure surfaced as an `EROFS` throw from
 * deep inside `fs.mkdir`, which escaped the upload action and took the
 * whole `/admin/media` page down with a generic "something went wrong" —
 * giving no clue that the real fix is an ops step (provision a Blob store)
 * rather than anything wrong with the file being uploaded.
 *
 * `VERCEL` is set on every Vercel deployment (build and runtime), so it is
 * the reliable signal for "this filesystem is not writable", rather than
 * NODE_ENV, which is also "production" for a self-hosted node server where
 * the local driver is perfectly fine.
 */
export function getStorageConfigError(): string | null {
  if (getDefaultStorageProvider() === "local" && process.env.VERCEL) {
    return (
      "File storage isn't configured for this deployment, so uploads can't be saved. " +
      "Create a Blob store for this project in Vercel (Storage → Create → Blob) and redeploy — " +
      "that sets BLOB_READ_WRITE_TOKEN, which is all this needs. See MEDIA_LIBRARY.md."
    );
  }
  return null;
}
