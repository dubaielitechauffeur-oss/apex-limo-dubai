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
}

/** Shape of the stored JSON, as far as the public read path cares. */
interface StoredSeo {
  title?: unknown;
  description?: unknown;
  canonical?: unknown;
  ogImageId?: unknown;
  noIndex?: unknown;
  noFollow?: unknown;
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
  ogImageUrlById?: ReadonlyMap<string, string>
): PublicSeo | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as StoredSeo;

  const title = pickLocalized(stored.title, locale);
  const description = pickLocalized(stored.description, locale);
  const canonical = typeof stored.canonical === "string" && stored.canonical.trim() ? stored.canonical.trim() : null;
  const ogImageId = typeof stored.ogImageId === "string" && stored.ogImageId ? stored.ogImageId : null;
  const ogImageUrl = ogImageId ? (ogImageUrlById?.get(ogImageId) ?? null) : null;
  const noIndex = stored.noIndex === true;
  const noFollow = stored.noFollow === true;

  if (!title && !description && !canonical && !ogImageUrl && !noIndex && !noFollow) {
    return null;
  }

  return { title, description, canonical, ogImageUrl, noIndex, noFollow };
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
