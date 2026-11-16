import { routing, type Locale } from "@/i18n/routing";

/**
 * The subset of a CMS row's embedded `seo` JSON column that the PUBLIC site
 * actually consumes, already resolved to one locale and with the OG image id
 * already turned into a URL.
 *
 * Why this type exists at all: every content model (`Service`, `Location`,
 * `Vehicle`, `BlogPost`) stores a full `SeoMeta` blob that the admin SEO
 * Manager writes to, but before this change only `BlogPost`'s title and
 * description were ever read back — so an editor could set a canonical, pick
 * an OG image, or tick "no index" on a service, see it save, and have none of
 * it reach a single byte of served HTML. `noIndex` in particular was a safety
 * control that silently did nothing.
 *
 * Deliberately declared here, free of any `lib/cms` import, because the
 * `data/*.ts` content files carry this as an optional field on their `Plain*`
 * shapes. Those modules are reachable from client components, and pulling
 * `lib/cms/seo.ts` (zod, server-only helpers) into that graph would be a
 * server/client boundary regression. Nothing in this file imports anything but
 * the locale list.
 */
export interface PublicSeo {
  /** Empty string when the editor left it blank — callers fall back to the page template. */
  title: string;
  description: string;
  /** Absolute URL. Null means "use the page's own self-referencing canonical". */
  canonical: string | null;
  /** Resolved `MediaItem.url` for `seo.ogImageId`, or null. */
  ogImageUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
  /** Editor-set H1 for this locale, or empty to keep the page's own heading. */
  h1: string;
  /** Editor-set section headings for this locale, keyed by slot. Only
   *  non-empty entries are present. */
  headings: Record<string, string>;
}

/** Shape of the stored JSON, as far as the public read path cares. */
interface StoredSeo {
  title?: unknown;
  description?: unknown;
  canonical?: unknown;
  ogImageId?: unknown;
  noIndex?: unknown;
  noFollow?: unknown;
  h1?: unknown;
  headings?: unknown;
}

/**
 * Like `pickLocalized` but with NO fallback to English.
 *
 * Headings (and the meta of pages that have real translations in
 * `messages/<locale>`) must not fall back: an English H1 typed for
 * /about would otherwise replace the Arabic heading on /ar/about, swapping a
 * translated page's main heading for a foreign-language one.
 */
function pickStrict(value: unknown, locale: Locale): string {
  const record = (value ?? {}) as Partial<Record<Locale, string>>;
  const text = record[locale];
  return typeof text === "string" ? text.trim() : "";
}

function pickHeadings(value: unknown, locale: Locale): Record<string, string> {
  const out: Record<string, string> = {};
  if (!value || typeof value !== "object") return out;
  for (const [key, localized] of Object.entries(value as Record<string, unknown>)) {
    const text = pickStrict(localized, locale);
    if (text) out[key] = text;
  }
  return out;
}

function pickLocalized(value: unknown, locale: Locale): string {
  const record = (value ?? {}) as Partial<Record<Locale, string>>;
  return (record[locale] || record[routing.defaultLocale] || "").trim();
}

/**
 * Projects a stored `seo` JSON column into `PublicSeo` for one locale.
 *
 * `ogImageUrlById` is the batch-resolved id → url map built once per query in
 * `lib/public/cms-content.ts`, rather than a per-row `mediaItem.findUnique` —
 * resolving these one at a time would add an N+1 to every listing page.
 *
 * Returns `null` when the column is absent or carries nothing the public site
 * would act on, so callers can treat "no CMS override" as a single falsy case
 * instead of inspecting six empty fields.
 */
export function resolvePublicSeo(
  value: unknown,
  locale: Locale,
  ogImageUrlById?: ReadonlyMap<string, string>,
  { strictLocale = false }: { strictLocale?: boolean } = {}
): PublicSeo | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as StoredSeo;

  // CMS records keep the long-standing English fallback for title and
  // description (a record with no translation is served in English anyway).
  // `strictLocale` is for pages whose other-locale copy comes from real
  // translations in `messages/<locale>` — see `pickStrict`.
  const pick = strictLocale ? pickStrict : pickLocalized;
  const title = pick(stored.title, locale);
  const description = pick(stored.description, locale);
  const h1 = pickStrict(stored.h1, locale);
  const headings = pickHeadings(stored.headings, locale);
  const canonical = typeof stored.canonical === "string" && stored.canonical.trim() ? stored.canonical.trim() : null;
  const ogImageId = typeof stored.ogImageId === "string" && stored.ogImageId ? stored.ogImageId : null;
  const ogImageUrl = ogImageId ? (ogImageUrlById?.get(ogImageId) ?? null) : null;
  const noIndex = stored.noIndex === true;
  const noFollow = stored.noFollow === true;

  if (
    !title &&
    !description &&
    !canonical &&
    !ogImageUrl &&
    !noIndex &&
    !noFollow &&
    !h1 &&
    Object.keys(headings).length === 0
  ) {
    return null;
  }

  return { title, description, canonical, ogImageUrl, noIndex, noFollow, h1, headings };
}

/**
 * The heading to render for one slot of a page: the editor's override when
 * one is saved for this locale, otherwise the page's built-in text.
 *
 * `{placeholder}` tokens in an override are filled from `params`, so an
 * editor can write "Why Choose Apex for {name}" on a record as well.
 */
export function headingOverride(
  seo: Pick<PublicSeo, "headings"> | null | undefined,
  slot: string,
  fallback: string,
  params?: Record<string, string | number>
): string {
  const override = seo?.headings?.[slot];
  if (!override) return fallback;
  return override.replace(/\{\s*([A-Za-z0-9_]+)\s*\}/g, (match, name: string) =>
    params && name in params ? String(params[name]) : match
  );
}

/** Collects every `seo.ogImageId` across a set of rows, for one batched media lookup. */
export function collectOgImageIds(rows: ReadonlyArray<{ seo?: unknown }>): string[] {
  const ids = new Set<string>();
  for (const row of rows) {
    const stored = (row.seo ?? {}) as StoredSeo;
    if (typeof stored.ogImageId === "string" && stored.ogImageId) ids.add(stored.ogImageId);
  }
  return [...ids];
}
