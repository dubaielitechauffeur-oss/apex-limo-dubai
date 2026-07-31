import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { localizedPath } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { FLEET } from "@/data/fleet";
import { SERVICES } from "@/data/services";
import { LOCATIONS } from "@/data/locations";
import { getAllBlogPosts } from "@/data/blog";

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

export default function sitemap(): MetadataRoute.Sitemap {
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

  const serviceRoutes = SERVICES.flatMap((service) =>
    localizedEntries(`/services/${service.slug}`, now, "monthly", 0.7)
  );

  const locationRoutes = LOCATIONS.flatMap((location) =>
    localizedEntries(`/locations/${location.slug}`, now, "monthly", 0.7)
  );

  const blogRoutes = getAllBlogPosts().flatMap((post) =>
    localizedEntries(`/blog/${post.slug}`, new Date(post.publishDate), "monthly", 0.6)
  );

  return [...staticRoutes, ...fleetRoutes, ...serviceRoutes, ...locationRoutes, ...blogRoutes];
}
