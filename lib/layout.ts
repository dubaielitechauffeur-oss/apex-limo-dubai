/**
 * Routes where the site deliberately strips back its chrome.
 *
 * `/booking` and `/quote` are the pages paid (Google Ads) traffic lands on
 * with a single job to do. Google's landing-page quality signals penalise
 * generic site navigation competing with the ad's specific offer, so these
 * routes drop the promotional bar and the floating WhatsApp/Call buttons —
 * both of which duplicate CTAs the page already presents inline.
 *
 * Shared by Header, SiteMain, and ConditionalFloatButtons so the three can
 * never disagree about which routes are "conversion" routes.
 *
 * Paths are locale-stripped: `usePathname` from `@/i18n/navigation` already
 * removes the locale segment, so `/ar/booking` matches `/booking` here.
 */
export const CONVERSION_PATHS: ReadonlySet<string> = new Set(["/booking", "/quote"]);

export function isConversionPath(pathname: string): boolean {
  return CONVERSION_PATHS.has(pathname);
}
