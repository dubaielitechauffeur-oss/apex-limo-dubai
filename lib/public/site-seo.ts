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
    if (!row?.defaultSeo) return null;
    const seo = row.defaultSeo as unknown as SeoMeta;
    const title = pickText(seo.title, locale);
    const description = pickText(seo.description, locale);
    if (!title && !description) return null;
    let ogImageUrl: string | null = null;
    if (seo.ogImageId) {
      const media = await prisma.mediaItem.findUnique({
        where: { id: seo.ogImageId },
        select: { url: true, deletedAt: true },
      });
      if (media && !media.deletedAt) ogImageUrl = media.url;
    }
    return {
      title,
      description,
      ogImageUrl,
      noIndex: seo.noIndex ?? false,
      noFollow: seo.noFollow ?? false,
    };
  } catch (err) {
    console.error("[site-seo] DB read failed, using static defaults:", err);
    return null;
  }
}
