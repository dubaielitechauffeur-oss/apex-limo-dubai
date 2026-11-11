/**
 * Vehicle slugs that no longer exist, each mapped to its closest live page:
 * the renamed vehicle where there is one, otherwise the category page.
 *
 * One list, two jobs:
 *  - `next.config.ts` 301-redirects every pair in all six locales, so old
 *    URLs (Google's index, other sites, bookmarks) still land somewhere.
 *  - `rewriteRetiredLinks()` repoints links to these slugs inside CMS copy
 *    as it is read (lib/public/cms-content.ts), so the site's own pages never
 *    link through a redirect — the daily site health check flags those.
 *
 * When a vehicle is renamed or removed in the admin panel, add one line
 * here. Never list a slug that is live in the CMS: the redirect runs before
 * the page and would hide it.
 *
 * Search Console's crawl stats showed Googlebot repeatedly requesting the
 * slugs below as 404s, so they still carry inbound links worth keeping.
 */
export const RETIRED_VEHICLE_REDIRECTS: ReadonlyArray<readonly [from: string, to: string]> = [
  ["mercedes-v-class", "mercedes-v-class-v300-v250"],
  // Intermediate slug between the two V-Class renames; GSC still lists
  // /ar/fleet/mercedes-v-class-v300 as crawled.
  ["mercedes-v-class-v300", "mercedes-v-class-v300-v250"],
  ["bentley-flying-spur", "ultra-luxury"],
  ["rolls-royce-ghost", "rolls-royce-phantom"],
  ["mercedes-e-class", "sedan"],
  ["toyota-land-cruiser", "suv"],
];

const RETIRED = new Map(RETIRED_VEHICLE_REDIRECTS);

// `/fleet/<slug>` where the slug ends at a non-slug character, so
// "mercedes-v-class" never matches inside "mercedes-v-class-v300-v250". Works
// for relative, locale-prefixed and absolute links alike, because only the
// slug segment is replaced.
const FLEET_LINK = /\/fleet\/([a-z0-9-]+)(?![a-z0-9-])/gi;

/** Repoints links to retired vehicle slugs in a piece of CMS copy. */
export function rewriteRetiredLinks(text: string): string {
  if (!text || !text.includes("/fleet/")) return text;
  return text.replace(FLEET_LINK, (match, slug: string) => {
    const target = RETIRED.get(slug.toLowerCase());
    return target ? `/fleet/${target}` : match;
  });
}
