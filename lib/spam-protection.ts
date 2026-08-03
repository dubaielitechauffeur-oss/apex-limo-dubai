import { NextRequest } from "next/server";

/**
 * Lightweight, dependency-free abuse mitigation for the lead-generation API
 * routes (booking/quote/contact). Two layers:
 *  - a honeypot field (`company`) that real users never see or fill in
 *  - a per-IP sliding-window rate limit held in module memory
 *
 * The in-memory store resets on cold start and is per-instance, so on a
 * multi-instance/serverless deployment it caps abuse per-instance rather
 * than globally. That's a real limitation — for guaranteed cross-instance
 * limits, back this with a shared store (Upstash Redis, etc.) — but it's a
 * meaningful, zero-infrastructure improvement over the current "no limit
 * at all", and every instance still independently throttles a single bad
 * actor hammering one endpoint.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

/** Periodically drop stale IP entries so the map doesn't grow unbounded for the life of the instance. */
function pruneOld(now: number) {
  for (const [ip, timestamps] of hits) {
    const kept = timestamps.filter((t) => now - t < WINDOW_MS);
    if (kept.length === 0) {
      hits.delete(ip);
    } else {
      hits.set(ip, kept);
    }
  }
}

/**
 * Resolves the client IP from a value a reverse proxy actually controls,
 * not one an attacker can freely set.
 *
 * `x-forwarded-for`'s LEFTMOST entry is whatever the connecting client
 * claims (trivially spoofable — a prior version of this function trusted
 * exactly that value, which let a single header rotate straight through
 * the rate limit). Every hop instead APPENDS the address it saw to the
 * right of the chain, so the RIGHTMOST entry is the one our own trusted
 * front door (Vercel, a load balancer, nginx, etc.) wrote — a client can
 * prepend as many fake IPs as it wants but cannot control what gets
 * appended after its own connection. `x-vercel-forwarded-for`, when
 * present, is set directly by Vercel's edge and can't be spoofed by the
 * client at all, so it's preferred outright.
 *
 * This assumes at least one trusted reverse proxy terminates the
 * connection before this handler runs — true for every mainstream Next.js
 * hosting target. An origin exposed with literally no proxy in front of
 * it (rare) would need a different mechanism entirely, since nothing in
 * the HTTP request itself can be trusted in that shape of deployment.
 */
function getClientIp(request: NextRequest): string {
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor.split(",").map((hop) => hop.trim()).filter(Boolean);
    if (hops.length > 0) {
      return hops[hops.length - 1];
    }
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Returns true if this request should be rejected as rate-limit abuse. */
export function isRateLimited(request: NextRequest): boolean {
  const ip = getClientIp(request);
  const now = Date.now();

  if (hits.size > 5000) {
    pruneOld(now);
  }

  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);

  return timestamps.length > MAX_REQUESTS_PER_WINDOW;
}

/**
 * Honeypot check — the client form renders a field named `company` that's
 * hidden from sighted and screen-reader users alike (see FormField usage
 * in the lead forms) and left blank by real visitors. Bots that
 * autofill every field will populate it, so any non-empty value here
 * means the submission is treated as spam without telling the bot why
 * (the API still returns a generic success response — see route handlers).
 */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const value = body.company;
  return typeof value === "string" && value.trim().length > 0;
}
