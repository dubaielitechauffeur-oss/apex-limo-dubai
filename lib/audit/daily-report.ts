import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";
import { FROM_ADDRESS } from "@/lib/notifications";
import { ADMIN_TIME_ZONE, DUBAI_UTC_OFFSET } from "@/lib/admin/format";
import { describeAuditValue, readableChanges } from "./present";

/**
 * The owner's daily email of everything done in the admin panel the previous
 * day (Dubai time): who did what, and each changed field before → after.
 *
 * Sent once a day by a Vercel cron at 00:00 Dubai (see vercel.json and
 * app/api/cron/audit-report). One small query and one email a day; nothing
 * is sent on a day with no admin activity.
 *
 * The recipient is the `AUDIT_REPORT_EMAIL` environment variable, never a
 * hardcoded address: this repository is public.
 */

const MAX_FIELDS_PER_ENTRY = 8;
const MAX_ENTRIES = 300;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "YYYY-MM-DD" of the Dubai calendar day containing `date`. */
export function dubaiDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ADMIN_TIME_ZONE }).format(date);
}

/** The Dubai day that ended most recently before `now`, as UTC bounds. */
export function previousDubaiDay(now: Date): { day: string; start: Date; end: Date } {
  const end = new Date(`${dubaiDay(now)}T00:00:00.000${DUBAI_UTC_OFFSET}`);
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  return { day: dubaiDay(start), start, end };
}

const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: ADMIN_TIME_ZONE });

export async function sendDailyAuditReport(now = new Date()): Promise<{ sent: boolean; entries: number; reason?: string }> {
  const to = process.env.AUDIT_REPORT_EMAIL?.trim();
  if (!to) return { sent: false, entries: 0, reason: "AUDIT_REPORT_EMAIL is not set" };
  if (!process.env.RESEND_API_KEY) return { sent: false, entries: 0, reason: "RESEND_API_KEY is not set" };

  const { day, start, end } = previousDubaiDay(now);
  const entries = await prisma.auditLog.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "asc" },
    take: MAX_ENTRIES,
  });
  if (entries.length === 0) return { sent: false, entries: 0, reason: "no activity" };

  const byPerson = new Map<string, number>();
  for (const entry of entries) byPerson.set(entry.userName, (byPerson.get(entry.userName) ?? 0) + 1);

  const auditUrl = `${SITE.url}/admin/audit?from=${day}&to=${day}`;
  const prettyDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T12:00:00Z`)
  );

  const rows = entries
    .map((entry) => {
      const { label, undoOf, rows: fields } = readableChanges(entry.changes);
      const item = `${entry.entityType.replace(/_/g, " ")}${label ? `: ${label}` : ""}`;
      const fieldHtml = fields
        .slice(0, MAX_FIELDS_PER_ENTRY)
        .map((f) => {
          if (f.hasBefore || f.hasAfter) {
            return `<div style="margin-top:4px;"><span style="color:#6b7280;">${escapeHtml(f.field)}:</span> <span style="color:#b91c1c;">${escapeHtml(describeAuditValue(f.before, 160))}</span> &rarr; <span style="color:#047857;">${escapeHtml(describeAuditValue(f.after, 160))}</span></div>`;
          }
          return `<div style="margin-top:4px;"><span style="color:#6b7280;">${escapeHtml(f.field)}:</span> ${escapeHtml(describeAuditValue(f.value, 160))}</div>`;
        })
        .join("");
      const more = fields.length > MAX_FIELDS_PER_ENTRY ? `<div style="margin-top:4px;color:#6b7280;">+${fields.length - MAX_FIELDS_PER_ENTRY} more field(s) in the admin audit log</div>` : "";
      return `<tr>
        <td style="padding:10px 8px;border-top:1px solid #e5e7eb;vertical-align:top;white-space:nowrap;">${escapeHtml(timeFormatter.format(entry.createdAt))}</td>
        <td style="padding:10px 8px;border-top:1px solid #e5e7eb;vertical-align:top;">${escapeHtml(entry.userName)}</td>
        <td style="padding:10px 8px;border-top:1px solid #e5e7eb;vertical-align:top;"><strong>${escapeHtml(entry.action.replace(/_/g, " "))}</strong>${undoOf ? " (undo)" : ""}</td>
        <td style="padding:10px 8px;border-top:1px solid #e5e7eb;vertical-align:top;">${escapeHtml(item)}${fieldHtml}${more}</td>
      </tr>`;
    })
    .join("");

  const summary = [...byPerson.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([who, count]) => `<li>${escapeHtml(who)}: <strong>${count}</strong> action${count === 1 ? "" : "s"}</li>`)
    .join("");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;max-width:900px;">
    <h2 style="margin:0 0 4px;">Admin activity: ${escapeHtml(prettyDay)}</h2>
    <p style="margin:0 0 16px;color:#6b7280;">Times are Dubai time. ${entries.length} action${entries.length === 1 ? "" : "s"} recorded${entries.length === MAX_ENTRIES ? " (showing the first " + MAX_ENTRIES + ")" : ""}.</p>
    <ul style="margin:0 0 16px;padding-left:20px;">${summary}</ul>
    <p style="margin:0 0 16px;"><a href="${auditUrl}" style="color:#a8842c;">Open this day in the audit log</a> to see every field and to undo any change.</p>
    <table style="border-collapse:collapse;width:100%;font-size:13px;">
      <thead><tr style="text-align:left;color:#6b7280;">
        <th style="padding:8px;">Time</th><th style="padding:8px;">Who</th><th style="padding:8px;">Action</th><th style="padding:8px;">What changed</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Admin activity ${prettyDay}: ${entries.length} action${entries.length === 1 ? "" : "s"}`,
    html,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return { sent: true, entries: entries.length };
}
