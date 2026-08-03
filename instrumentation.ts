/**
 * Runs once when the server process boots (Next.js instrumentation hook —
 * stable since Next 15, no config flag needed). Used here purely to
 * surface a missing RESEND_API_KEY loudly in deployment logs at startup,
 * instead of only on the first booking/quote/contact submission — a
 * misconfigured key previously meant every lead silently failed to email
 * with only a per-request console.error as evidence.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "[startup] RESEND_API_KEY is not set. Booking, quote, and contact " +
          "form submissions will be accepted but their email notification " +
          "will fail silently until this is configured — see .env.example."
      );
    } else {
      console.log("[startup] RESEND_API_KEY is configured.");
    }
  }
}
