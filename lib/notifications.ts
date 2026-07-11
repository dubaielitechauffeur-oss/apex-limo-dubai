import type { BookingFormData, QuoteFormData, LeadType } from "./types";

/**
 * These functions are intentionally simple no-ops today. They give the
 * booking and quote API routes a single, stable place to call into once
 * real providers are connected — swap the body of each function without
 * touching the routes or forms that call them.
 */

type LeadPayload =
  | { type: "booking"; data: BookingFormData; reference: string }
  | { type: "quote"; data: QuoteFormData; reference: string };

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

/**
 * TODO: Wire up a transactional email provider (Resend, SendGrid, Postmark).
 * Send an internal notification to the ops inbox and a confirmation email
 * to the customer using a branded template.
 */
export async function sendLeadEmail(payload: LeadPayload): Promise<void> {
  console.log(`[notifications] Email notification queued (${payload.type})`, {
    reference: payload.reference,
  });
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
