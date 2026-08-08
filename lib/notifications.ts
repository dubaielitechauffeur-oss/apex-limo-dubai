import { Resend } from "resend";
import type { BookingFormData, QuoteFormData, ContactFormData, LeadType } from "./types";
import { bookingEmailHtml, quoteEmailHtml, contactEmailHtml } from "./email-templates";
import { getSiteContact } from "./public/site-contact";

/**
 * These functions give the booking/quote/contact API routes a single,
 * stable place to call into for each downstream integration. `sendLeadEmail`
 * is wired to Resend; `notifyWhatsApp` and `pushToCRM` remain intentional
 * no-ops until those channels are implemented — swap a body without
 * touching the routes or forms that call them.
 */

type LeadPayload =
  | { type: "booking"; data: BookingFormData; reference: string }
  | { type: "quote"; data: QuoteFormData; reference: string }
  | { type: "contact"; data: ContactFormData; reference: string };

let missingKeyWarned = false;

/**
 * A misconfigured/missing RESEND_API_KEY previously failed silently: the
 * customer still saw a success response (by design — see dispatchLead
 * below) while the lead's only trace was a console.error buried in
 * server logs. This surfaces the misconfiguration loudly and immediately
 * (once per server instance, not once per request) so it gets caught in
 * deployment logs/monitoring before a real customer lead is lost.
 */
export function assertResendConfigured(): void {
  if (!process.env.RESEND_API_KEY && !missingKeyWarned) {
    missingKeyWarned = true;
    console.error(
      "[notifications] RESEND_API_KEY is not set — lead notification emails will fail silently for every booking, quote, and contact submission until this is configured."
    );
  }
}

/** Verified sending domain (apexchauffeurdubai.com) — internal ops notifications only. */
export const FROM_ADDRESS = "Apex Limo & Chauffeur Dubai <bookings@apexchauffeurdubai.com>";

/** Dubai has no DST, so a fixed-offset "en-AE" format is reliable regardless of server timezone. */
export function formatSubmittedAt(): string {
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
  assertResendConfigured();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const timestamp = formatSubmittedAt();
  const contact = await getSiteContact();

  let subject: string;
  let html: string;
  if (payload.type === "booking") {
    subject = `New Booking Request — ${payload.data.vehicle} — ${payload.reference}`;
    html = bookingEmailHtml(payload.data, payload.reference, timestamp);
  } else if (payload.type === "quote") {
    subject = `New Quote Request — ${payload.reference}`;
    html = quoteEmailHtml(payload.data, payload.reference, timestamp);
  } else {
    subject = `New Contact Message — ${payload.reference}`;
    html = contactEmailHtml(payload.data, payload.reference, timestamp);
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: contact.notificationEmail,
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
  data: BookingFormData | QuoteFormData | ContactFormData,
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
