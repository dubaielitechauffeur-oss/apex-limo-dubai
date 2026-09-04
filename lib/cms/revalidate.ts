import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";
import { localizedPath } from "@/lib/seo";

/**
 * Phase 8 revalidation: called from CMS server actions after a successful
 * create/update/publish/unpublish/delete/restore, on top of (not instead
 * of) the existing `revalidatePath("/admin/...")` calls those actions
 * already make. Public pages read straight from Prisma (lib/public/
 * cms-content.ts, no `unstable_cache`), so revalidating the route is
 * enough to force a fresh render on next request — no cache tag plumbing
 * needed. Time-based ISR (`export const revalidate = 300` on each public
 * page) is the fallback if an admin action's revalidation is ever missed.
 * See PUBLIC_CMS_INTEGRATION.md "Caching & Revalidation".
 */

function revalidateAllLocales(path: string) {
  for (const locale of routing.locales) {
    revalidatePath(localizedPath(locale, path));
  }
}

export function revalidatePublicServices(slug?: string) {
  revalidateAllLocales("/services");
  if (slug) revalidateAllLocales(`/services/${slug}`);
  // The homepage "What We Offer" grid and every location page's services
  // carousel read the same rows, and the site-wide footer lists every service
  // — so a rename or an unpublish has to reach them too, or the footer keeps
  // linking to a slug that no longer resolves.
  revalidateAllLocales("/");
  revalidatePath("/[locale]/locations/[location]", "page");
  revalidatePath("/sitemap.xml");
}

export function revalidatePublicLocations(slug?: string) {
  revalidateAllLocales("/locations");
  if (slug) revalidateAllLocales(`/locations/${slug}`);
  // Homepage LocationsShowcase + the site-wide footer's locations column.
  revalidateAllLocales("/");
  revalidatePath("/sitemap.xml");
}

export function revalidatePublicFaqs() {
  revalidateAllLocales("/faqs");
  // The homepage FAQ section and its FAQPage structured data now read the
  // same CMS rows as /faqs (see getHomepageFaqs), so it has to be refreshed
  // alongside the hub or the two can drift apart again.
  revalidateAllLocales("/");
}

export function revalidatePublicBlog(slug?: string) {
  revalidateAllLocales("/blog");
  if (slug) revalidateAllLocales(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}

export function revalidatePublicHomepage() {
  revalidateAllLocales("/");
}

export function revalidatePublicFleet(slug?: string) {
  revalidateAllLocales("/fleet");
  if (slug) revalidateAllLocales(`/fleet/${slug}`);
  // Category listing pages share the /fleet/[vehicle] route — any vehicle
  // change can shift which vehicles a category page lists.
  for (const categorySlug of ["sedan", "suv", "van", "ultra-luxury", "electric"]) {
    revalidateAllLocales(`/fleet/${categorySlug}`);
  }
  revalidatePath("/sitemap.xml");
  // The homepage fleet carousel also reads vehicle data.
  revalidateAllLocales("/");
}

/** Detail routes whose slugs can't be enumerated here without a query. Next
 *  accepts the route pattern itself, which clears every page rendered from
 *  that route in one call — the right tool when a change can touch any of
 *  them rather than one known slug. */
const PUBLIC_DETAIL_ROUTES = [
  "/[locale]/fleet/[vehicle]",
  "/[locale]/services/[service]",
  "/[locale]/locations/[location]",
  "/[locale]/blog/[slug]",
];

/** Static public routes, in the same shape the per-type helpers above use. */
const PUBLIC_STATIC_ROUTES = [
  "/",
  "/fleet",
  "/services",
  "/locations",
  "/blog",
  "/faqs",
  "/about",
  "/contact",
  "/booking",
  "/quote",
];

/**
 * Every public page at once — for changes that aren't scoped to one content
 * type and so can affect any of them:
 *
 *  - **Default SEO settings**, which feed the title/description/OG image of
 *    every page through `buildMetadata()`.
 *  - **Media edits**, since a single image (or its alt text) may be used by
 *    a vehicle, a location, a service, the homepage hero, or a blog post,
 *    and nothing here knows which.
 *
 * Deliberately not called from the per-type helpers above — those already
 * target exactly what changed, and this is the blunter instrument for the
 * cases where narrowing isn't possible. Both triggers are rare admin
 * actions, so the extra re-renders cost little; pages re-render lazily on
 * the next request either way.
 */
export function revalidateAllPublicContent() {
  for (const path of PUBLIC_STATIC_ROUTES) revalidateAllLocales(path);
  for (const route of PUBLIC_DETAIL_ROUTES) revalidatePath(route, "page");
  revalidatePath("/sitemap.xml");
}
