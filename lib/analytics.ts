import { sendGAEvent } from "@next/third-parties/google";

/**
 * Fires GA4's standard `generate_lead` event when a booking or quote request
 * is successfully submitted — the site's two actual conversion actions (see
 * CONVERSION_PATHS in lib/layout.ts). Without this, GA4 only ever recorded
 * pageviews, so the Conversions report stayed at zero regardless of how many
 * bookings/quotes actually came in. `sendGAEvent` is a no-op if the
 * `<GoogleAnalytics>` script (app/[locale]/layout.tsx) hasn't loaded yet, so
 * this is safe to call from any client component without a readiness check.
 */
export function trackConversion(source: "booking" | "quote", vehicle?: string) {
  sendGAEvent("event", "generate_lead", {
    lead_source: source,
    ...(vehicle ? { vehicle } : {}),
  });
}
