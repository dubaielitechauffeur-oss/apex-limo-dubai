import { prisma } from "@/lib/db";

/**
 * Cross-instance rate limiting, backed by Postgres.
 *
 * The existing limiters (`lib/spam-protection.ts`, `lib/auth/rate-limit.ts`)
 * hold their counters in a module-level `Map`. That is per-process, so on a
 * serverless host the real limit is `configured limit × number of warm
 * instances` — an attacker spreading requests across instances gets a fresh
 * budget from each one, which is precisely the case a limiter exists to stop.
 *
 * This module makes the limit shared, using the database the app already
 * depends on rather than adding Redis and another piece of infrastructure to
 * operate. The in-memory limiters are kept in front of it: they reject the
 * obvious floods with no database round trip, and this layer catches what
 * slips between instances.
 *
 * FAILURE MODE, deliberately chosen: if the database is unreachable this
 * returns "not limited" and lets the in-memory limiter decide alone. A
 * database hiccup must not start rejecting genuine booking enquiries — the
 * business cost of a blocked customer is far higher than that of a briefly
 * weaker limiter, and the per-instance limit still applies throughout.
 */

/** Prune roughly 1 in N calls, so expired rows do not accumulate forever
 *  without paying for a delete on every request. */
const PRUNE_PROBABILITY = 0.01;

export interface RateLimitOptions {
  /** Namespaced identity, e.g. "lead" or "login", combined with the client IP. */
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}

/**
 * Records one hit and reports whether the caller is now over its limit.
 *
 * Fixed windows: the counter is keyed by the window's start boundary, which
 * makes the increment a single atomic `INSERT ... ON CONFLICT DO UPDATE`. A
 * sliding window would need one row per hit and a range scan per request; for
 * abuse control the difference is not worth that cost. The practical effect is
 * that a burst straddling a boundary can briefly see up to 2× the limit, which
 * is acceptable for every endpoint this guards.
 */
export async function consumeSharedRateLimit({
  scope,
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<boolean> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const compositeKey = `${scope}:${key}`;

  try {
    // Atomic under concurrency: two instances racing on the same key both
    // observe a correct, monotonically increasing count. `upsert` would not
    // give this — its read-then-write can interleave and lose an increment.
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "rate_limit_counters" ("key", "windowStart", "count", "updatedAt")
      VALUES (${compositeKey}, ${BigInt(windowStart)}, 1, NOW())
      ON CONFLICT ("key", "windowStart")
      DO UPDATE SET "count" = "rate_limit_counters"."count" + 1, "updatedAt" = NOW()
      RETURNING "count"
    `;

    if (Math.random() < PRUNE_PROBABILITY) {
      // Best-effort cleanup of windows that can no longer be consulted.
      // Awaited so a failure is caught here rather than surfacing as an
      // unhandled rejection, but its result is irrelevant to the decision.
      await prisma.rateLimitCounter
        .deleteMany({ where: { windowStart: { lt: BigInt(windowStart - windowMs * 2) } } })
        .catch(() => undefined);
    }

    const count = Number(rows[0]?.count ?? 0);
    return count > limit;
  } catch (err) {
    console.error("[rate-limit] shared counter unavailable, relying on in-memory limiter:", err);
    return false;
  }
}
