import { sendDailyAuditReport } from "@/lib/audit/daily-report";

export const dynamic = "force-dynamic";

/**
 * Daily admin-activity email. Called by the Vercel cron in vercel.json at
 * 20:00 UTC (00:00 Dubai). Vercel sends `Authorization: Bearer <CRON_SECRET>`
 * when the CRON_SECRET environment variable is set; anything else is refused,
 * so the URL cannot be used to trigger emails.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await sendDailyAuditReport();
    return Response.json(result);
  } catch (error) {
    console.error("[cron] audit report failed", error);
    return Response.json({ error: "Report failed" }, { status: 500 });
  }
}
