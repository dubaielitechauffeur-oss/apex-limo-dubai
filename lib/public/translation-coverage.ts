import { routing, type Locale } from "@/i18n/routing";

/**
 * Which locales a CMS row is genuinely publishable in.
 *
 * The CMS deliberately requires only English to be non-empty
 * (`lib/cms/localized.ts` — a stricter rule would just stop editors saving),
 * and the public read layer falls back to English for any missing locale
 * (`pickText`). That combination is right for rendering, but it used to feed
 * straight into `hreflang` and the sitemap: a service written only in English
 * still advertised six translated URLs, and Google was shown six URLs claiming
 * six languages that were substantially the same English document.
 *
 * This module draws the line. A locale counts as available only when every
 * field listed as required for that content type actually has copy in it.
 * English is always included — it is the required locale, and `x-default`
 * points at it — so the worst case is a page that publishes in English only,
 * which is the truth rather than a claim of six translations.
 *
 * Static `data/*.ts` content is fully translated in all six locales (verified
 * across every field), so those paths pass `undefined` and keep the full set.
 */

/** True when a stored localized JSON value has non-blank copy for `locale`. */
function hasCopy(value: unknown, locale: Locale): boolean {
  if (!value || typeof value !== "object") return false;
  const entry = (value as Partial<Record<Locale, unknown>>)[locale];
  if (typeof entry === "string") return entry.trim().length > 0;
  // Array-valued fields (longDescription, benefits, whyChoose) count as
  // present only when at least one entry carries text — an array of empty
  // strings is an empty translation, not a translated one.
  if (Array.isArray(entry)) return entry.some((v) => typeof v === "string" && v.trim().length > 0);
  return false;
}

/**
 * The locales in which EVERY one of `requiredFields` has copy.
 *
 * Pass the stored (still-localized) JSON values straight from the Prisma row —
 * not the already-picked strings, which have had the English fallback applied
 * and can no longer tell a translation from a fallback.
 */
export function availableLocalesFor(requiredFields: readonly unknown[]): Locale[] {
  const available = routing.locales.filter((locale) =>
    requiredFields.every((field) => hasCopy(field, locale))
  );

  // English is the required locale and the x-default target. If it somehow
  // failed the check (a row that predates validation, or was written directly
  // to the database), publishing nothing would be worse than publishing the
  // page — so guarantee it rather than emitting an empty alternates map.
  return available.includes(routing.defaultLocale)
    ? available
    : [routing.defaultLocale, ...available];
}

/**
 * Narrows an entity's available locales to those the site actually serves.
 * Returns `undefined` when every locale is present, which lets callers treat
 * "fully translated" as the no-op case and skip passing the list around.
 */
export function narrowLocales(available: Locale[] | undefined): Locale[] | undefined {
  if (!available || available.length === routing.locales.length) return undefined;
  return available;
}
