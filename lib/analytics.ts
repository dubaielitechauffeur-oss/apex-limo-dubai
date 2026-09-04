import { sendGAEvent } from "@next/third-parties/google";

/**
 * GA4 event layer.
 *
 * Scope note: this site's funnel is not only its two forms. A visitor can
 * convert by submitting booking, quote or contact, OR by tapping the floating
 * WhatsApp button, the floating call button, or any of the inline WhatsApp /
 * phone CTAs on the service, fleet and listing pages — and for a Dubai
 * chauffeur business those messaging paths carry most of the real demand.
 * Only booking and quote were ever instrumented, so the measured conversion
 * rate excluded the majority of leads and every channel-attribution or
 * page-level CRO conclusion drawn from it was unreliable.
 *
 * PRIVACY: never pass a name, phone number, email address, pickup/dropoff
 * address or free-text message into any of these. GA4 forbids personally
 * identifiable information, and the parameters below are deliberately limited
 * to non-identifying categorical values (which form, which vehicle model,
 * which page placement) so there is nothing to leak.
 *
 * `sendGAEvent` no-ops safely when the `<GoogleAnalytics>` script has not
 * loaded — including when the visitor has declined analytics consent, since
 * the tag is not injected at all in that case (see components/analytics/
 * ConsentManager.tsx). Call sites therefore need no readiness or consent
 * check of their own.
 */

/** The lead-generating actions worth counting as conversions. */
export type LeadChannel = "booking" | "quote" | "contact" | "whatsapp" | "phone";

/** Where the interaction happened, so placements can be compared. */
export type CtaPlacement =
  | "float_button"
  | "header"
  | "footer"
  | "hero"
  | "service_card"
  | "vehicle_card"
  | "vehicle_detail"
  | "contact_page"
  | "form_success";

interface LeadEventParams {
  /** Vehicle or service slug/name — categorical, never customer data. */
  item?: string;
  placement?: CtaPlacement;
}

/**
 * Fires GA4's standard `generate_lead` event. One event name across every
 * channel keeps the Conversions report a single comparable funnel; the
 * `lead_source` parameter is what splits it by channel in reporting.
 */
export function trackConversion(source: LeadChannel, params: LeadEventParams = {}) {
  sendGAEvent("event", "generate_lead", {
    lead_source: source,
    ...(params.item ? { item_name: params.item } : {}),
    ...(params.placement ? { cta_placement: params.placement } : {}),
  });
}

/**
 * A WhatsApp or phone CTA click.
 *
 * These leave the site for an external handler (`wa.me` / `tel:`), so the
 * click is the only moment they are observable — there is no later success
 * page to measure. Treated as a lead rather than a soft engagement event
 * because for this business it is one: the visitor is opening a conversation
 * with the dispatch team.
 *
 * Deliberately NOT attached to the anchors via `onClick` on a server
 * component — the float buttons stay server-rendered, and only the small
 * click handler is a client component (see components/shared/TrackedCta.tsx).
 */
export function trackContactClick(channel: "whatsapp" | "phone", placement: CtaPlacement, item?: string) {
  trackConversion(channel, { placement, item });
}
