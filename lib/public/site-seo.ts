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
export async function getDefaultSeoOverride(locale: Locale): Promise<SiteDefaultSeo | null> {
  try {
    const row = await prisma.globalSettings.findFirst({ select: { defaultSeo: true } });
    const seo = row?.defaultSeo as unknown as SeoMeta | null;
    const title = seo ? pickText(seo.title, locale) : "";
    if (!seo || !title) return null;

    let ogImageUrl: string | null = null;
    if (seo.ogImageId) {
      const media = await prisma.mediaItem.findUnique({ where: { id: seo.ogImageId }, select: { url: true } });
      ogImageUrl = media?.url ?? null;
    }

    return {
      title,
      description: pickText(seo.description, locale),
      ogImageUrl,
      noIndex: seo.noIndex,
      noFollow: seo.noFollow,
    };
  } catch (error) {
    console.error("[public/site-seo] default SEO query failed, falling back to static defaults:", error);
    return null;
  }
}
