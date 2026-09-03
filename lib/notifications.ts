import { Resend } from "resend";
import type { BookingFormData, QuoteFormData, ContactFormData, LeadType } from "./types";
import { bookingEmailHtml, quoteEmailHtml, contactEmailHtml } from "./email-templates";
import { getSiteContact } from "./public/site-contact";

/**
 * These functions give the booking/quote/contact API routes a single,
 * stable place to call into for each downstream integration: `sendLeadEmail`
 * (Resend), `notifyWhatsApp` (WhatsApp Business Cloud API) and `pushToCRM`
 * (JSON webhook).
 *
 * Every channel is configured entirely through environment variables and
 * skips itself when its variables are absent, so the site runs correctly
 * with only email configured and each further channel switches on by adding
 * its variables — no code change, no redeploy of this file. See
 * `.env.example` for the full list.
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

/** Cap on how long any one outbound integration may hold up the customer's
 *  response. `dispatchLead` is awaited before the API route replies, so an
 *  unreachable third party must fail fast rather than stall the form. */
const OUTBOUND_TIMEOUT_MS = 8000;

/** Graph API version pinned deliberately — Meta retires versions on a
 *  schedule, and an unpinned URL would change behaviour without a deploy. */
const WHATSAPP_GRAPH_VERSION = "v21.0";

const unconfiguredWarned = new Set<string>();

/** Logs a channel's missing configuration once per server instance rather
 *  than once per submission, so it shows up in deploy logs without burying
 *  real errors under repeats. */
function warnUnconfiguredOnce(channel: string, message: string): void {
  if (unconfiguredWarned.has(channel)) return;
  unconfiguredWarned.add(channel);
  console.warn(`[notifications] ${channel}: ${message}`);
}

/** The handful of fields every channel wants, in the order a dispatcher
 *  reads them. Kept separate from the email templates, which are formatted
 *  for a human inbox rather than a 1024-character message body. */
function leadSummary(payload: LeadPayload): {
  reference: string;
  type: LeadType;
  name: string;
  phone: string;
  email: string;
  detail: string;
} {
  const { data } = payload;
  const detail =
    payload.type === "booking"
      ? `${payload.data.vehicle} · ${payload.data.pickupLocation} → ${payload.data.dropoffLocation}`
      : payload.type === "quote"
        ? `${payload.data.serviceType} · ${payload.data.pickupLocation}`
        : payload.data.subject;

  return {
    reference: payload.reference,
    type: payload.type,
    name: data.fullName,
    phone: data.phone,
    email: data.email,
    detail,
  };
}

/**
 * Sends the ops team a WhatsApp notification for a new lead via the WhatsApp
 * Business Cloud API.
 *
 * Business-initiated messages (which this is — nobody messaged us first) may
 * only be sent as an approved template, so a template name is required
 * alongside the credentials. The template needs four body parameters, in
 * order: reference, customer name, customer phone, and a one-line detail.
 *
 * Stays a silent no-op until `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
 * and `WHATSAPP_TEMPLATE_NAME` are all set, so leads keep flowing by email
 * while this channel is unconfigured.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export async function notifyWhatsApp(payload: LeadPayload): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

  if (!accessToken || !phoneNumberId || !templateName) {
    warnUnconfiguredOnce(
      "whatsapp",
      "not configured (needs WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TEMPLATE_NAME) — skipping; leads are still delivered by email."
    );
    return;
  }

  const contact = await getSiteContact();
  // Cloud API wants a bare international number: digits only, no "+".
  const recipient = (process.env.WHATSAPP_RECIPIENT ?? contact.whatsapp).replace(/[^\d]/g, "");
  if (!recipient) {
    throw new Error("No WhatsApp recipient number configured.");
  }

  const summary = leadSummary(payload);
  const response = await fetch(
    `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_TEMPLATE_LOCALE ?? "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: summary.reference },
                { type: "text", text: summary.name },
                { type: "text", text: summary.phone },
                { type: "text", text: summary.detail },
              ],
            },
          ],
        },
      }),
      signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`WhatsApp Cloud API responded ${response.status}: ${body.slice(0, 500)}`);
  }
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
 * Pushes the lead to the CRM as a JSON webhook POST, so sales/dispatch can
 * follow up from wherever they already work.
 *
 * Deliberately a plain webhook rather than a vendor SDK: HubSpot, Zoho,
 * Salesforce and every automation tool (Zapier, Make, n8n) all accept an
 * inbound webhook, so this works with whichever the business picks without
 * another dependency or a rewrite here. Set `CRM_WEBHOOK_URL`, and
 * `CRM_WEBHOOK_TOKEN` if the endpoint expects a bearer token.
 *
 * Stays a silent no-op while unconfigured.
 */
export async function pushToCRM(payload: LeadPayload): Promise<void> {
  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  if (!webhookUrl) {
    warnUnconfiguredOnce(
      "crm",
      "not configured (needs CRM_WEBHOOK_URL) — skipping; leads are still delivered by email."
    );
    return;
  }

  const token = process.env.CRM_WEBHOOK_TOKEN;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      ...leadSummary(payload),
      submittedAt: formatSubmittedAt(),
      source: "apexchauffeurdubai.com",
      // Full form payload alongside the summary, so a CRM mapping can pick
      // up fields this summary doesn't flatten without a change here.
      raw: payload.data,
    }),
    signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`CRM webhook responded ${response.status}: ${body.slice(0, 500)}`);
  }
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
