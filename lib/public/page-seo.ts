import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Locale } from "@/i18n/routing";
import { resolvePublicSeo, type PublicSeo } from "./seo-fields";
import { PAGE_SEO_CATALOG, getPageSeoEntry } from "@/lib/seo-pages/catalog";

/**
 * Public read path for the admin "Page SEO" screens — the `PageSeo` rows that
 * hold SEO for pages with no CMS record of their own (see
 * `lib/seo-pages/catalog.ts`).
 *
 * Same DB-first, fail-soft contract as the rest of `lib/public`: if the table
 * is unreachable, empty, or not migrated yet, every function here returns
 * "no override" and the page renders its built-in copy exactly as before.
 */

interface PageSeoRow {
  page: string;
  seo: unknown;
}

/** All rows, once per request — the i18n message loader and the page's own
 *  `generateMetadata` both need them and share this single query. */
const getPageSeoRows = cache(async function getPageSeoRows(): Promise<PageSeoRow[]> {
  try {
    return await prisma.pageSeo.findMany({ select: { page: true, seo: true } });
  } catch (err) {
    console.error("[page-seo] DB read failed, using built-in page copy:", err);
    return [];
  }
});

const getOgImageUrl = cache(async function getOgImageUrl(id: string): Promise<string | null> {
  try {
    const media = await prisma.mediaItem.findUnique({ where: { id }, select: { url: true, deletedAt: true } });
    return media && !media.deletedAt ? media.url : null;
  } catch {
    return null;
  }
});

/**
 * The saved SEO for one catalog page in one locale, or null when nothing is
 * saved. Locale-strict: a value typed only in English never leaks onto the
 * translated versions of the page.
 */
export async function getPageSeo(page: string, locale: Locale): Promise<PublicSeo | null> {
  if (!getPageSeoEntry(page)) return null;
  const row = (await getPageSeoRows()).find((r) => r.page === page);
  if (!row) return null;

  const ogImageId = (row.seo as { ogImageId?: unknown } | null)?.ogImageId;
  const ogMap = new Map<string, string>();
  if (typeof ogImageId === "string" && ogImageId) {
    const url = await getOgImageUrl(ogImageId);
    if (url) ogMap.set(ogImageId, url);
  }
  return resolvePublicSeo(row.seo, locale, ogMap, { strictLocale: true });
}

/**
 * Every saved heading that replaces a next-intl message for this locale, as
 * `[messageKey, text]` pairs — consumed by `i18n/request.ts`.
 *
 * Only keys the catalog declares as `scope: "message"` are returned, so a
 * stray or hand-edited row can never overwrite an arbitrary message (a nav
 * label, a form error, a legal paragraph).
 */
export async function getMessageOverrides(locale: Locale): Promise<Array<[string, string]>> {
  const rows = await getPageSeoRows();
  if (rows.length === 0) return [];
  const byPage = new Map(rows.map((row) => [row.page, row]));
  const overrides: Array<[string, string]> = [];

  for (const entry of PAGE_SEO_CATALOG) {
    const row = byPage.get(entry.page);
    if (!row) continue;
    const seo = resolvePublicSeo(row.seo, locale, undefined, { strictLocale: true });
    if (!seo) continue;

    if (entry.h1?.scope === "message" && seo.h1) overrides.push([entry.h1.messageKey, seo.h1]);
    for (const slot of entry.headings) {
      if (slot.scope !== "message") continue;
      const text = seo.headings[slot.key];
      if (text) overrides.push([slot.messageKey, text]);
    }
  }
  return overrides;
}

/**
 * Public paths of catalog pages an editor ticked "No-index" on — the sitemap
 * leaves these out, since listing a URL that carries `noindex` is a
 * contradiction search engines report as an error.
 */
export async function getNoIndexPagePaths(): Promise<Set<string>> {
  const rows = await getPageSeoRows();
  const paths = new Set<string>();
  for (const row of rows) {
    const entry = getPageSeoEntry(row.page);
    if (entry?.publicPath && (row.seo as { noIndex?: unknown } | null)?.noIndex === true) paths.add(entry.publicPath);
  }
  return paths;
}
