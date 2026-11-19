import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

const sent: { to: string; subject: string; html: string }[] = [];
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: async (message: { to: string; subject: string; html: string }) => {
        sent.push(message);
        return { error: null };
      },
    };
  },
}));

import { prisma } from "@/lib/db";
import { sendDailyAuditReport, dubaiDay } from "@/lib/audit/daily-report";

const ENTITY_ID = `vitest-report-${Math.random().toString(36).slice(2, 8)}`;

beforeAll(async () => {
  process.env.AUDIT_REPORT_EMAIL = "owner@example.com";
  process.env.RESEND_API_KEY = "re_test";
  await prisma.auditLog.create({
    data: {
      action: "update",
      entityType: "page_seo",
      entityId: ENTITY_ID,
      userName: "Agency Person · agency",
      changes: [
        { field: "__detail", value: 1 },
        { field: "__label", value: "about" },
        { field: "seo", before: { en: "Old <title>" }, after: { en: "New title" } },
      ],
    },
  });
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityId: ENTITY_ID } });
});

describe("sendDailyAuditReport", () => {
  it("emails the previous Dubai day's changes, before → after, HTML-escaped", async () => {
    // Run "at 00:05 tomorrow in Dubai", so today's entry is in the window.
    const today = dubaiDay(new Date());
    const nextMidnight = new Date(new Date(`${today}T00:05:00+04:00`).getTime() + 24 * 60 * 60 * 1000);
    const result = await sendDailyAuditReport(nextMidnight);

    expect(result.sent).toBe(true);
    const mail = sent.at(-1)!;
    expect(mail.to).toBe("owner@example.com");
    expect(mail.html).toContain("Agency Person · agency");
    expect(mail.html).toContain("Old &lt;title&gt;");
    expect(mail.html).toContain("New title");
    expect(mail.html).not.toContain("<title>");
  });

  it("sends nothing on a day with no activity", async () => {
    const result = await sendDailyAuditReport(new Date("2001-01-02T00:05:00+04:00"));
    expect(result).toEqual({ sent: false, entries: 0, reason: "no activity" });
  });

  it("sends nothing until the recipient is configured", async () => {
    const saved = process.env.AUDIT_REPORT_EMAIL;
    delete process.env.AUDIT_REPORT_EMAIL;
    const result = await sendDailyAuditReport();
    process.env.AUDIT_REPORT_EMAIL = saved;
    expect(result.sent).toBe(false);
  });
});
