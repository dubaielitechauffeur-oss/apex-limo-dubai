import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { localizedPath } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { FLEET, FLEET_CATEGORY_SLUGS } from "@/data/fleet";
import {
  getServiceSitemapEntries,
  getLocationSitemapEntries,
  getBlogPostSitemapEntries,
} from "@/lib/public/cms-content";

// See app/[locale]/services/page.tsx for the revalidation strategy note.
export const revalidate = 300;

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

/** One sitemap entry per locale for `path`, each cross-linked to every
 *  other locale's URL (plus x-default) via `alternates.languages` — the
 *  sitemap-level equivalent of the hreflang tags emitted in <head>. */
function localizedEntries(
  path: string,
  lastModified: Date,
  changeFrequency: ChangeFrequency,
  priority: number
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE.url}${localizedPath(locale, path)}`])
  );
  languages["x-default"] = `${SITE.url}${path}`;

  return routing.locales.map((locale) => ({
    url: `${SITE.url}${localizedPath(locale, path)}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths: Array<[string, ChangeFrequency, number]> = [
    ["/", "weekly", 1],
    ["/booking", "monthly", 0.9],
    ["/quote", "monthly", 0.9],
    ["/fleet", "weekly", 0.8],
    ["/services", "weekly", 0.8],
    ["/locations", "weekly", 0.7],
    ["/faqs", "weekly", 0.7],
    ["/blog", "weekly", 0.7],
    ["/about", "monthly", 0.6],
    ["/contact", "monthly", 0.5],
    ["/privacy-policy", "yearly", 0.2],
    ["/terms", "yearly", 0.2],
  ];

  const staticRoutes = staticPaths.flatMap(([path, changeFrequency, priority]) =>
    localizedEntries(path, now, changeFrequency, priority)
  );

  const fleetRoutes = FLEET.flatMap((vehicle) =>
    localizedEntries(`/fleet/${vehicle.slug}`, now, "monthly", 0.7)
  );

  const fleetCategoryRoutes = FLEET_CATEGORY_SLUGS.flatMap((category) =>
    localizedEntries(`/fleet/${category}`, now, "weekly", 0.75)
  );

  // Published, non-deleted CMS entries when available, falling back to the
  // static data files (same rule as the public pages themselves — see
  // lib/public/cms-content.ts) so the sitemap never drops a legitimate URL.
  const [serviceEntries, locationEntries, blogEntries] = await Promise.all([
    getServiceSitemapEntries(),
    getLocationSitemapEntries(),
    getBlogPostSitemapEntries(),
  ]);

  const serviceRoutes = serviceEntries.flatMap((service) =>
    localizedEntries(`/services/${service.slug}`, service.lastModified ?? now, "monthly", 0.7)
  );

  const locationRoutes = locationEntries.flatMap((location) =>
    localizedEntries(`/locations/${location.slug}`, location.lastModified ?? now, "monthly", 0.7)
  );

  const blogRoutes = blogEntries.flatMap((post) =>
    localizedEntries(`/blog/${post.slug}`, post.lastModified ?? now, "monthly", 0.6)
  );

  return [
    ...staticRoutes,
    ...fleetRoutes,
    ...fleetCategoryRoutes,
    ...serviceRoutes,
    ...locationRoutes,
    ...blogRoutes,
  ];
}
