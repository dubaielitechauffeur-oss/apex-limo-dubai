import { z } from "zod";

/**
 * Split out from password.ts so client components can import the policy
 * (for inline hint text / a future live-validation UI) without pulling
 * argon2 — a Node-only native module — into the browser bundle. Anything
 * that needs to hash or verify a password stays in password.ts, which is
 * server-only by virtue of never being imported from a "use client" file.
 */
export const passwordPolicySchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password must be 128 characters or fewer.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.")
  .regex(/[^a-zA-Z0-9]/, "Password must include a symbol.");

export const PASSWORD_REQUIREMENTS_HINT =
  "At least 12 characters, with uppercase, lowercase, a number, and a symbol.";
