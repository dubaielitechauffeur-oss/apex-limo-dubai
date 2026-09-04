import type { BookingFormData, QuoteFormData, ContactFormData } from "./types";
import { getWhatsAppLink } from "./constants";

/** Escapes user-submitted text before it's interpolated into HTML email markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface EmailRow {
  label: string;
  value: string;
}

function row({ label, value }: EmailRow): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #ececec;color:#57534e;font-size:11px;font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;width:150px;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #ececec;color:#0a0a0a;font-size:14px;font-family:Arial,Helvetica,sans-serif;vertical-align:top;">
        ${escapeHtml(value) || "&mdash;"}
      </td>
    </tr>`;
}

/** Shared branded shell — dark header band, white body, gold reference footer. */
function emailShell(options: { heading: string; rowsHtml: string; reference: string; timestamp: string }): string {
  const { heading, rowsHtml, reference, timestamp } = options;
  return `
<div style="background:#f6f4ef;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-collapse:collapse;">
    <tr>
      <td style="background:#0a0a0a;padding:28px 32px;">
        <span style="color:#d4af37;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">
          Apex Limo &amp; Chauffeur Dubai
        </span>
        <h1 style="color:#ffffff;font-size:20px;line-height:1.3;margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;">
          ${escapeHtml(heading)}
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 32px 24px;">
        <table role="presentation" width="100%" style="border-collapse:collapse;">
          ${rowsHtml}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#faf8f3;border-top:2px solid #e9d68a;">
        <span style="font-size:12px;color:#57534e;">
          Reference&nbsp;<strong style="color:#a8842c;">${escapeHtml(reference)}</strong>
          &nbsp;&middot;&nbsp;Submitted ${escapeHtml(timestamp)}
        </span>
      </td>
    </tr>
  </table>
</div>`;
}

export function bookingEmailHtml(data: BookingFormData, reference: string, timestamp: string): string {
  const rowsHtml = [
    row({ label: "Name", value: data.fullName }),
    row({ label: "Email", value: data.email }),
    row({ label: "Phone", value: data.phone }),
    row({ label: "Pickup", value: data.pickupLocation }),
    row({ label: "Dropoff", value: data.dropoffLocation }),
    row({ label: "Vehicle", value: data.vehicle }),
    row({ label: "Date", value: data.date }),
    row({ label: "Time", value: data.time }),
    row({ label: "Passengers", value: String(data.passengers) }),
    row({ label: "Duration", value: data.hours }),
    row({ label: "Notes", value: data.specialRequests }),
  ].join("");

  return emailShell({ heading: "New Booking Request", rowsHtml, reference, timestamp });
}

export function quoteEmailHtml(data: QuoteFormData, reference: string, timestamp: string): string {
  const rowsHtml = [
    row({ label: "Name", value: data.fullName }),
    row({ label: "Email", value: data.email }),
    row({ label: "Phone", value: data.phone }),
    row({ label: "Service", value: data.serviceType }),
    row({ label: "Pickup", value: data.pickupLocation }),
    row({ label: "Vehicle", value: data.vehicle || "No preference" }),
    row({ label: "Date", value: data.date }),
    row({ label: "Notes", value: data.message }),
  ].join("");

  return emailShell({ heading: "New Quote Request", rowsHtml, reference, timestamp });
}

export function contactEmailHtml(data: ContactFormData, reference: string, timestamp: string): string {
  const rowsHtml = [
    row({ label: "Name", value: data.fullName }),
    row({ label: "Email", value: data.email }),
    row({ label: "Phone", value: data.phone }),
    row({ label: "Subject", value: data.subject }),
    row({ label: "Message", value: data.message }),
  ].join("");

  return emailShell({ heading: "New Contact Message", rowsHtml, reference, timestamp });
}

/**
 * Password reset link for the admin panel — deliberately a simpler shell
 * than the lead-notification emails above (no reference/row table; the
 * only content that matters is the button and the expiry notice), sent to
 * the account holder rather than internal ops.
 */
export function resetPasswordEmailHtml(resetUrl: string, timestamp: string): string {
  const safeUrl = escapeHtml(resetUrl);
  return `
<div style="background:#f6f4ef;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-collapse:collapse;">
    <tr>
      <td style="background:#0a0a0a;padding:28px 32px;">
        <span style="color:#d4af37;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">
          Apex Limo &amp; Chauffeur Dubai — Admin
        </span>
        <h1 style="color:#ffffff;font-size:20px;line-height:1.3;margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;">
          Reset your password
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <p style="margin:0 0 20px;color:#0a0a0a;font-size:14px;line-height:1.6;">
          A password reset was requested for this admin account. Click the button below to choose a new password. If you didn't request this, you can safely ignore this email.
        </p>
        <a href="${safeUrl}" style="display:inline-block;background:#c9a96e;color:#1a1a1a;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:6px;">
          Reset Password
        </a>
        <p style="margin:24px 0 0;color:#57534e;font-size:12px;line-height:1.6;">
          This link expires one hour after it was requested (${escapeHtml(timestamp)}) and can only be used once.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#faf8f3;border-top:2px solid #e9d68a;">
        <span style="font-size:11px;color:#8a8680;word-break:break-all;">
          If the button doesn't work, copy this link: ${safeUrl}
        </span>
      </td>
    </tr>
  </table>
</div>`;
}

/* -------------------------------------------------------------------------
 * Customer-facing confirmation emails
 *
 * The templates above go to internal ops: they lead with the customer's own
 * contact details and read like a work ticket. These go to the customer, so
 * they acknowledge receipt, repeat back only what the customer needs to
 * recognise their own request, and end with a WhatsApp button for the
 * fastest way to reach the team. Deliberately worded as "request received",
 * never "booking confirmed" — a chauffeur is only assigned once the team
 * replies, and a customer who reads this as a confirmation turns up at the
 * kerb expecting a car.
 *
 * English only for now (the site is localized, but these are not) — see
 * `sendCustomerEmail` in `lib/notifications.ts`.
 * ---------------------------------------------------------------------- */

/** The live, admin-editable contact details a customer email signs off with.
 *  Structurally the public half of `SiteContact` (`lib/public/site-contact.ts`),
 *  redeclared here so this module stays free of the database import. */
export interface CustomerEmailContact {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
}

/** Bulletproof-ish WhatsApp CTA: a padded, rounded anchor rather than a real
 *  <button>, which is the only form that survives Gmail, Outlook and Apple
 *  Mail alike. Outlook (Word engine) drops the border-radius and renders a
 *  square gold block — still perfectly legible and clickable. */
function whatsappButton(link: string): string {
  return `
        <a href="${escapeHtml(link)}" style="display:inline-block;background:#25d366;color:#ffffff;font-size:14px;font-weight:bold;letter-spacing:0.3px;text-decoration:none;padding:14px 30px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;">
          Chat with us on WhatsApp
        </a>`;
}

/** Shared shell for the three customer emails — same black/gold branding as
 *  the ops shell, but reference first, then the summary, then the contact
 *  footer with the WhatsApp button. */
function customerEmailShell(options: {
  heading: string;
  intro: string;
  rowsHtml: string;
  reference: string;
  contact: CustomerEmailContact;
}): string {
  const { heading, intro, rowsHtml, reference, contact } = options;
  const waLink = getWhatsAppLink(
    `Hello Apex Limo, I'm following up on my request ${reference}.`,
    contact.whatsapp
  );

  return `
<div style="background:#f6f4ef;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-collapse:collapse;">
    <tr>
      <td style="background:#0a0a0a;padding:28px 32px;">
        <span style="color:#d4af37;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">
          Apex Limo &amp; Chauffeur Dubai
        </span>
        <h1 style="color:#ffffff;font-size:20px;line-height:1.3;margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;">
          ${escapeHtml(heading)}
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px 8px;">
        <p style="margin:0 0 20px;color:#0a0a0a;font-size:14px;line-height:1.6;">
          ${escapeHtml(intro)}
        </p>
        <table role="presentation" width="100%" style="border-collapse:collapse;background:#faf8f3;border:1px solid #e9d68a;">
          <tr>
            <td style="padding:14px 18px;">
              <span style="display:block;color:#57534e;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Your reference</span>
              <strong style="color:#a8842c;font-size:18px;letter-spacing:1px;">${escapeHtml(reference)}</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 32px 24px;">
        <table role="presentation" width="100%" style="border-collapse:collapse;">
          ${rowsHtml}
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:4px 32px 28px;">
        ${whatsappButton(waLink)}
        <p style="margin:18px 0 0;color:#57534e;font-size:13px;line-height:1.7;">
          Or call us on <a href="tel:${escapeHtml(contact.phone)}" style="color:#a8842c;text-decoration:none;">${escapeHtml(contact.phoneDisplay)}</a><br />
          Email <a href="mailto:${escapeHtml(contact.email)}" style="color:#a8842c;text-decoration:none;">${escapeHtml(contact.email)}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#0a0a0a;">
        <span style="font-size:11px;color:#8a8680;line-height:1.6;">
          Apex Limo &amp; Chauffeur Dubai &middot; Dubai, United Arab Emirates<br />
          You received this email because this request was submitted at apexchauffeurdubai.com.
        </span>
      </td>
    </tr>
  </table>
</div>`;
}

export function customerBookingEmailHtml(
  data: BookingFormData,
  reference: string,
  contact: CustomerEmailContact
): string {
  const rowsHtml = [
    row({ label: "Pickup", value: data.pickupLocation }),
    row({ label: "Dropoff", value: data.dropoffLocation }),
    row({ label: "Date", value: data.date }),
    row({ label: "Time", value: data.time }),
    row({ label: "Vehicle", value: data.vehicle }),
    row({ label: "Passengers", value: String(data.passengers) }),
    row({ label: "Duration", value: data.hours }),
    row({ label: "Your notes", value: data.specialRequests }),
  ].join("");

  return customerEmailShell({
    heading: "We've received your booking request",
    intro: `Thank you, ${data.fullName}. Your booking request has reached our team and we'll be in touch shortly to confirm the details and your chauffeur. Please treat this as a receipt of your request, not a confirmed booking.`,
    rowsHtml,
    reference,
    contact,
  });
}

export function customerQuoteEmailHtml(
  data: QuoteFormData,
  reference: string,
  contact: CustomerEmailContact
): string {
  const rowsHtml = [
    row({ label: "Service", value: data.serviceType }),
    row({ label: "Pickup", value: data.pickupLocation }),
    row({ label: "Date", value: data.date }),
    row({ label: "Vehicle", value: data.vehicle || "No preference" }),
    row({ label: "Your notes", value: data.message }),
  ].join("");

  return customerEmailShell({
    heading: "We've received your quote request",
    intro: `Thank you, ${data.fullName}. Your quote request has reached our team and we'll be in touch shortly with pricing for your journey.`,
    rowsHtml,
    reference,
    contact,
  });
}

export function customerContactEmailHtml(
  data: ContactFormData,
  reference: string,
  contact: CustomerEmailContact
): string {
  const rowsHtml = [
    row({ label: "Subject", value: data.subject }),
    row({ label: "Your message", value: data.message }),
  ].join("");

  return customerEmailShell({
    heading: "We've received your message",
    intro: `Thank you, ${data.fullName}. Your message has reached our team and we'll be in touch shortly.`,
    rowsHtml,
    reference,
    contact,
  });
}
