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
  revalidatePath("/sitemap.xml");
}

export function revalidatePublicLocations(slug?: string) {
  revalidateAllLocales("/locations");
  if (slug) revalidateAllLocales(`/locations/${slug}`);
  revalidatePath("/sitemap.xml");
}

export function revalidatePublicFaqs() {
  revalidateAllLocales("/faqs");
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
