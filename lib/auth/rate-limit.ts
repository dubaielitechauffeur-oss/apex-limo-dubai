import { getClientIp } from "@/lib/spam-protection";
import { consumeSharedRateLimit } from "@/lib/rate-limit/shared";

/**
 * Per-IP sliding-window rate limiting for auth endpoints, independent of the
 * per-account lockout in lockout.ts. The two guard different attack shapes:
 * lockout stops someone hammering ONE account from many IPs; this stops
 * someone hammering MANY accounts (or retrying past a lockout reset) from
 * ONE IP. Same in-memory-map approach as lib/spam-protection.ts, and the
 * same limitation applies — per-instance, not cross-instance — see that
 * file's comment for the full rationale.
 */
interface Bucket {
  windowMs: number;
  maxHits: number;
  hits: Map<string, number[]>;
}

function createBucket(windowMs: number, maxHits: number): Bucket {
  return { windowMs, maxHits, hits: new Map() };
}

const loginBucket = createBucket(10 * 60 * 1000, 10); // 10 attempts / 10 min / IP
const forgotPasswordBucket = createBucket(60 * 60 * 1000, 5); // 5 requests / hour / IP

function hit(bucket: Bucket, key: string): boolean {
  const now = Date.now();
  if (bucket.hits.size > 5000) {
    for (const [k, timestamps] of bucket.hits) {
      const kept = timestamps.filter((t) => now - t < bucket.windowMs);
      if (kept.length === 0) bucket.hits.delete(k);
      else bucket.hits.set(k, kept);
    }
  }

  const timestamps = (bucket.hits.get(key) ?? []).filter((t) => now - t < bucket.windowMs);
  timestamps.push(now);
  bucket.hits.set(key, timestamps);

  return timestamps.length > bucket.maxHits;
}

/**
 * Both checks combine the per-process window above with a shared,
 * database-backed counter so the limit holds across serverless instances —
 * the in-memory map alone gave an attacker a fresh budget per warm instance.
 * The local check runs first and short-circuits, so a flood costs no database
 * writes. See lib/rate-limit/shared.ts for the failure-mode reasoning.
 */
export async function isLoginRateLimited(headers: Headers): Promise<boolean> {
  const ip = getClientIp(headers);
  if (hit(loginBucket, ip)) return true;
  return consumeSharedRateLimit({
    scope: "login",
    key: ip,
    limit: loginBucket.maxHits,
    windowMs: loginBucket.windowMs,
  });
}

export async function isForgotPasswordRateLimited(headers: Headers): Promise<boolean> {
  const ip = getClientIp(headers);
  if (hit(forgotPasswordBucket, ip)) return true;
  return consumeSharedRateLimit({
    scope: "forgot-password",
    key: ip,
    limit: forgotPasswordBucket.maxHits,
    windowMs: forgotPasswordBucket.windowMs,
  });
}
