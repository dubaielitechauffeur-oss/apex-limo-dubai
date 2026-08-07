/**
 * Upload validation. Every check here operates on the actual uploaded
 * bytes — never on the browser-supplied `File.type` or the client
 * filename's extension, both of which are trivially spoofable ("Do not
 * trust client-provided MIME type alone" — Phase 6 brief). Uses `Buffer`
 * throughout, so this module is server-only — client components that just
 * need the size limit or the allowed-types list import them from
 * `lib/media/constants.ts` instead (re-exported below for server callers).
 */
import { MAX_UPLOAD_BYTES, ALLOWED_MIME_TYPES, EXTENSION_BY_MIME, type AllowedMimeType } from "./constants";

export { MAX_UPLOAD_BYTES, ALLOWED_MIME_TYPES, EXTENSION_BY_MIME, type AllowedMimeType };

/**
 * SVG is deliberately NOT supported. A raw SVG can embed `<script>`,
 * event-handler attributes, and external references — real stored-XSS risk
 * if the file is ever opened directly or reused inside an `<object>`/
 * `<iframe>`/inline-markup context by a future CMS field. Serving it only
 * ever through `<img src>` mitigates most of that, but not all of it, and
 * this project has no SVG sanitizer (e.g. DOMPurify's SVG profile)
 * installed or vetted. Rejecting it now — and documenting why here and in
 * MEDIA_LIBRARY.md — is the explicit "otherwise reject it" fallback the
 * Phase 6 brief allows, rather than shipping a half-safe SVG path.
 */
export const REJECTED_SVG_REASON =
  "SVG uploads are not supported: without a vetted server-side sanitizer, a raw SVG can carry embedded scripts or event handlers (stored XSS). Re-export logos/icons as PNG or WebP.";

/**
 * Sniffs the real image format from magic bytes. Returns `null` for
 * anything unrecognized or unsupported (including SVG, which is text/XML
 * and has no binary signature to match here — it's rejected by exclusion).
 */
export function sniffImageMimeType(buffer: Buffer): AllowedMimeType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  // AVIF/HEIF are ISOBMFF containers: a 4-byte box size, then "ftyp", then a
  // 4-byte major brand and a run of 4-byte compatible brands. Encoders vary
  // on whether "avif" appears as the major brand or only as a compatible
  // brand (commonly under a "mif1" major brand) — scanning the whole ftyp
  // box for the brand string is the same pragmatic approach most lightweight
  // sniffers use, without pulling in a full ISOBMFF box parser.
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const boxSize = buffer.readUInt32BE(0);
    const scanEnd = Math.min(buffer.length, boxSize > 0 ? boxSize : buffer.length, 64);
    const brands = buffer.subarray(8, scanEnd).toString("ascii");
    if (brands.includes("avif") || brands.includes("avis")) {
      return "image/avif";
    }
  }

  return null;
}

export type UploadValidationResult =
  | { ok: true; mimeType: AllowedMimeType; extension: string }
  | { ok: false; error: string };

export function validateUpload(buffer: Buffer): UploadValidationResult {
  if (buffer.length === 0) {
    return { ok: false, error: "The uploaded file is empty." };
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return { ok: false, error: `File is too large — the limit is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.` };
  }

  const mimeType = sniffImageMimeType(buffer);
  if (!mimeType) {
    const looksLikeSvg = buffer.subarray(0, 256).toString("utf8").trimStart().match(/^(<\?xml|<svg)/i);
    if (looksLikeSvg) {
      return { ok: false, error: REJECTED_SVG_REASON };
    }
    return { ok: false, error: "Unsupported file type. Upload a JPEG, PNG, WebP, or AVIF image." };
  }

  return { ok: true, mimeType, extension: EXTENSION_BY_MIME[mimeType] };
}

const CONTROL_CHAR_PATTERN = new RegExp("[\\u0000-\\u001f\\u007f]", "g");

/** Display-only sanitization of the browser-supplied filename — this value
 *  is stored in `MediaItem.originalFilename` for the admin UI and is never
 *  used to build a filesystem path (see lib/media/keys.ts). Strips path
 *  separators/control characters and caps length. */
export function sanitizeOriginalFilename(name: string): string {
  const stripped = name
    .replace(/[/\\]/g, "_")
    .replace(CONTROL_CHAR_PATTERN, "")
    .trim();
  const safe = stripped.length > 0 ? stripped : "upload";
  return safe.length > 200 ? safe.slice(0, 200) : safe;
}
