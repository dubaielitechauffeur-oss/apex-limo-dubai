/**
 * Seasonal Mercedes V-Class offer popup — single place to switch it on/off
 * or change the numbers. Copy lives in messages/<locale>/common.json under
 * `offerPopup` (all six locales).
 */
export const VCLASS_OFFER = {
  enabled: true,
  /** ISO date-time after which the popup stops rendering (server-checked in
   *  the layout). `null` = no end date. Example: "2027-01-31T23:59:59+04:00" */
  endsAt: null as string | null,
  /** Promo code shown in the popup and pre-filled into the WhatsApp message. */
  code: "VCLASS30",
  discountPercent: 30,
  /** Live CMS slug of the V-Class vehicle page (see data/fleet.ts). */
  vehicleSlug: "mercedes-v-class-v300-v250",
  image: "/images/fleet/mercedes-v-class/mercedes-v-class-1.webp",
  /** Delay before the popup opens when a visitor lands on any other page
   *  (shown once per browser session). */
  siteOpenDelayMs: 1500,
  /** On the V-Class page: first popup after 5 s, then again every 20 s
   *  after each dismissal for as long as the visitor stays on the page. */
  vehiclePageFirstDelayMs: 5000,
  vehiclePageRepeatMs: 20000,
} as const;

export function isOfferActive(now: number = Date.now()): boolean {
  if (!VCLASS_OFFER.enabled) return false;
  if (!VCLASS_OFFER.endsAt) return true;
  const end = Date.parse(VCLASS_OFFER.endsAt);
  return Number.isNaN(end) ? true : now < end;
}
