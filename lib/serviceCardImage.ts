/**
 * Desktop-only `object-position` overrides for service card images, keyed
 * by service slug. Some source photos (e.g. a tall portrait shot forced
 * into a landscape card) crop their subject out of frame under a plain
 * center crop — this nudges the focal point back into view. Classes are
 * `sm:`-prefixed so mobile's existing (correct) center crop is untouched.
 */
const DESKTOP_IMAGE_FOCAL: Partial<Record<string, string>> = {
  "airport-transfers": "sm:object-[center_68%]",
  "corporate-chauffeur": "sm:object-top",
};

export function serviceCardImageClass(slug: string): string {
  return DESKTOP_IMAGE_FOCAL[slug] ?? "";
}
