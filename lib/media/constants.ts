/**
 * Pure data, no Node built-ins (no `Buffer`, `fs`, Prisma) — safe to import
 * from a "use client" component (e.g. the upload form reads
 * `MAX_UPLOAD_BYTES` for its hint text). `validation.ts` re-exports these
 * for server-side callers so most code only needs one import path; this
 * file exists purely to keep a value-level import out of client bundles
 * from pulling in `lib/media/validation.ts`'s Buffer-based sniffing logic.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const EXTENSION_BY_MIME: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
