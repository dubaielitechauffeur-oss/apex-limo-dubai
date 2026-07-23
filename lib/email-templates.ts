import type { BookingFormData, QuoteFormData } from "./types";

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
