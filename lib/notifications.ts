import { Resend } from "resend";
import type { BookingFormData, QuoteFormData, LeadType } from "./types";
import { bookingEmailHtml, quoteEmailHtml } from "./email-templates";
import { SITE } from "./constants";

/**
 * These functions give the booking and quote API routes a single, stable
 * place to call into for each downstream integration. `sendLeadEmail` is
 * wired to Resend; `notifyWhatsApp` and `pushToCRM` remain intentional
 * no-ops until those channels are implemented — swap a body without
 * touching the routes or forms that call them.
 */

type LeadPayload =
  | { type: "booking"; data: BookingFormData; reference: string }
  | { type: "quote"; data: QuoteFormData; reference: string };

/** Verified sending domain (apexchauffeurdubai.com) — internal ops notifications only. */
const FROM_ADDRESS = "Apex Limo & Chauffeur Dubai <bookings@apexchauffeurdubai.com>";

/** Dubai has no DST, so a fixed-offset "en-AE" format is reliable regardless of server timezone. */
function formatSubmittedAt(): string {
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  }).format(new Date());
}

/**
 * TODO: Wire up WhatsApp Business Cloud API (or Twilio's WhatsApp API).
 * Send a template message to the ops number with the lead summary, and/or
 * an auto-reply confirmation to the customer's WhatsApp number.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export async function notifyWhatsApp(payload: LeadPayload): Promise<void> {
  console.log(`[notifications] WhatsApp notification queued (${payload.type})`, {
    reference: payload.reference,
  });
}

/** Sends an internal ops notification email via Resend for a new booking or quote lead. */
export async function sendLeadEmail(payload: LeadPayload): Promise<void> {
  // Constructed per-call rather than at module scope: the Resend SDK throws
  // immediately if the API key is missing, which would otherwise crash
  // `next build`'s route analysis and any request through this module
  // before the key is configured. Deferring it here means a missing key
  // only fails this one channel, caught and logged by dispatchLead below.
  const resend = new Resend(process.env.RESEND_API_KEY);
  const timestamp = formatSubmittedAt();
  const subject =
    payload.type === "booking"
      ? `New Booking Request — ${payload.data.vehicle} — ${payload.reference}`
      : `New Quote Request — ${payload.reference}`;
  const html =
    payload.type === "booking"
      ? bookingEmailHtml(payload.data, payload.reference, timestamp)
      : quoteEmailHtml(payload.data, payload.reference, timestamp);

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: SITE.email,
    replyTo: payload.data.email,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

/**
 * TODO: Wire up CRM sync (HubSpot, Salesforce, Zoho, or a custom webhook).
 * Push the lead as a new contact/deal so sales/dispatch can follow up.
 */
export async function pushToCRM(payload: LeadPayload): Promise<void> {
  console.log(`[notifications] CRM sync queued (${payload.type})`, {
    reference: payload.reference,
  });
}

/** Fires all downstream integrations for a new lead. Errors are isolated per-channel so one failure doesn't block the others. */
export async function dispatchLead(
  type: LeadType,
  data: BookingFormData | QuoteFormData,
  reference: string
): Promise<void> {
  const payload = { type, data, reference } as LeadPayload;

  const results = await Promise.allSettled([
    notifyWhatsApp(payload),
    sendLeadEmail(payload),
    pushToCRM(payload),
  ]);

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const channel = ["whatsapp", "email", "crm"][i];
      console.error(`[notifications] ${channel} dispatch failed:`, result.reason);
    }
  });
}
