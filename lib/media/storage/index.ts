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
