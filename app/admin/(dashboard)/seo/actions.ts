"use server";

import { revalidatePath } from "next/cache";
import { updateDefaultSeo, getGlobalSettings } from "@/lib/admin/settings";
import { revalidateAllLocales, revalidateEntireSite } from "@/lib/cms/revalidate";
import { readSeoField, type SeoMeta } from "@/lib/cms/seo";
import { updatePageSeo } from "@/lib/cms/page-seo";
import { getPageSeoEntry } from "@/lib/seo-pages/catalog";

/** Record templates: one heading set shared by every page of one detail
 *  route, so the route pattern is the narrowest call that reaches them all. */
const TEMPLATE_ROUTES: Record<string, string> = {
  "template-service": "/[locale]/services/[service]",
  "template-location": "/[locale]/locations/[location]",
  "template-vehicle": "/[locale]/fleet/[vehicle]",
  "template-fleet-category": "/[locale]/fleet/[vehicle]",
  "template-blog-post": "/[locale]/blog/[slug]",
};

/**
 * Refreshes only the pages one Page SEO entry can change, in all six locales.
 *
 * Every save used to revalidate the whole public tree (~300 URLs). An agency
 * editing twenty pages in a session therefore had every page re-render and
 * re-query Neon twenty times over as crawlers came back. The catalog already
 * says where each entry shows:
 *  - an entry with a `publicPath` is that one page (its meta tags and
 *    headings are page-specific message keys; headings used on several pages
 *    live in "shared-sections" instead);
 *  - a record template is every page of one detail route;
 *  - "shared-sections", or anything not in the catalog, falls back to the
 *    whole site so a save is never invisible.
 */
function revalidatePageSeo(page: string) {
  const entry = getPageSeoEntry(page);
  if (entry?.publicPath) {
    revalidateAllLocales(entry.publicPath);
    return;
  }
  const route = TEMPLATE_ROUTES[page];
  if (route) {
    revalidatePath(route, "page");
    return;
  }
  revalidateEntireSite();
}
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

export async function updateDefaultSeoAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const settingsResult = await getGlobalSettings();
  const existing = settingsResult.success ? (settingsResult.data?.defaultSeo as unknown as SeoMeta | null) : null;
  const input = readSeoField(formData, existing);

  const result = await updateDefaultSeo(input);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/seo");
  // These defaults are the fallback title/description/OG image for every
  // public page, so a change here has to reach all of them — not just the
  // admin screen it was edited on. Rarely edited, so the whole site is fine.
  revalidateEntireSite();
  return { success: "Default SEO settings updated." };
}

/**
 * Saves one Page SEO entry (meta tags, H1 and section headings of a page
 * that is not a CMS record) and refreshes only the pages it can change —
 * see `revalidatePageSeo`.
 */
export async function updatePageSeoAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const page = String(formData.get("page") ?? "");
  const input = readSeoField(formData);

  const result = await updatePageSeo(page, input);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/seo");
  revalidatePath(`/admin/seo/pages/${page}`);
  revalidatePageSeo(page);
  return { success: "Page SEO saved. The live page updates within a few seconds." };
}
