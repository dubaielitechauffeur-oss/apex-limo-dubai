import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

/** Shared helpers for the booking/quote/contact API routes — previously
 *  duplicated near-verbatim across each `route.ts`. */

export function resolveLocale(value: unknown): Locale {
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

/** Generous enough for the longest legitimate lead payload (every field
 *  filled at lib/validation.ts's own MAX_MESSAGE_LENGTH) with headroom,
 *  while still rejecting the multi-megabyte bodies a naive `request.json()`
 *  would otherwise fully buffer and parse before validation ever runs. */
export const MAX_BODY_BYTES = 20_000;

export type ParsedBodyResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; reason: "too_large" | "invalid_json" };

/**
 * Reads and JSON-parses a request body without ever buffering more than
 * `maxBytes`. A `Content-Length` header is checked first as a fast path,
 * but — since that header is client-supplied and not authoritative — the
 * stream itself is also read incrementally and aborted the moment the
 * cap is crossed, so a spoofed/missing Content-Length or a chunked
 * transfer can't bypass the limit. Plain `await request.json()` has no
 * such guard and will fully buffer/parse an arbitrarily large body before
 * any validation logic gets a chance to reject it.
 */
export async function readJsonBodyWithLimit(
  request: NextRequest,
  maxBytes: number = MAX_BODY_BYTES
): Promise<ParsedBodyResult> {
  const declaredLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, reason: "too_large" };
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return { ok: false, reason: "invalid_json" };
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  }

  try {
    const text = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array())
    );
    const data = JSON.parse(text || "{}");
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return { ok: false, reason: "invalid_json" };
    }
    return { ok: true, data: data as Record<string, unknown> };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}

/** e.g. generateReference("APX-") -> "APX-L8K3J2A1-F9Q2", generateReference("APX-Q-") -> "APX-Q-L8K3J2A1-F9Q2" */
export function generateReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${stamp}-${rand}`;
}
