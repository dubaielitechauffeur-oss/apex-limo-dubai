import { prisma } from "@/lib/db";

/**
 * Account lockout is a second, per-account axis of brute-force defense on
 * top of the per-IP rate limit in rate-limit.ts — it stops a distributed
 * attack (many IPs, one target account) that the IP limiter alone can't see.
 */
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export function isAccountLocked(user: { lockedUntil: Date | null }): boolean {
  return !!user.lockedUntil && user.lockedUntil.getTime() > Date.now();
}

/**
 * Increments the failure counter and locks the account once it reaches the
 * threshold. Locking sets `lockedUntil` but deliberately does NOT reset
 * `failedLoginAttempts` — resetFailedAttempts (called only on a *successful*
 * login) is the sole place that clears it, so the counter keeps its history
 * across an expired lock instead of quietly giving an attacker a fresh
 * five-attempt budget every 15 minutes forever.
 */
export async function registerFailedAttempt(userId: string): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 } },
    select: { failedLoginAttempts: true },
  });

  if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) },
    });
  }
}

export async function resetFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}
