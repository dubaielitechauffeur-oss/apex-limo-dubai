import { prisma } from "@/lib/db";
import { routing, type Locale } from "@/i18n/routing";
import type { SeoMeta } from "@/lib/cms/seo";

export interface SiteDefaultSeo {
  title: string;
  description: string;
  ogImageUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
}

function pickText(value: unknown, locale: Locale): string {
  const record = (value ?? {}) as Partial<Record<Locale, string>>;
  return record[locale] || record[routing.defaultLocale] || "";
}

/**
 * Site-wide default SEO metadata configured via the admin SEO Manager
 * (`GlobalSettings.defaultSeo`) — consumed by the root layout's
 * `generateMetadata` to override the static defaults in
 * `lib/seo.ts`'s `getDefaultMetadata`. Returns null when nothing has been
 * configured yet (no row, or an empty title for this locale) so the caller
 * falls back to the static site copy — same DB-first + static-fallback
 * pattern as `getSiteContact()`.
 */
export async function getDefaultSeoOverride(_locale: Locale): Promise<SiteDefaultSeo | null> {
  // Returns null so the caller uses the static defaults in `lib/seo.ts` —
  // the database is not in the public read path (see
  // `lib/public/cms-content.ts`). Restoring the admin-managed override means
  // querying `GlobalSettings.defaultSeo` here again.
  return null;
}
