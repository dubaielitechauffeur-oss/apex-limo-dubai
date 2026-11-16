import { randomBytes, createHash } from "node:crypto";

/** Reset links are single-purpose and short-lived — 1 hour is long enough for
 *  a real user to check email, short enough to shrink the window a leaked
 *  link (referrer, shared inbox, email scanner) stays exploitable. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** An invitation is opened by someone who was not expecting the email at a
 *  particular moment (unlike a reset the user just asked for), so it gets
 *  days rather than an hour. It is still single-use, and an administrator
 *  can disable the account or send a fresh link at any time. */
export const INVITE_TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

/**
 * The token that goes in the emailed URL is never persisted — only its
 * SHA-256 digest is stored in `PasswordResetToken.tokenHash`. This mirrors
 * how the app should treat any bearer credential: a leaked database row
 * (backup, replica, admin query) must not itself be enough to reset an
 * account's password. Losing the raw token means losing the only usable
 * copy, exactly like a hashed password.
 */
export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
