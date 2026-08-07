import argon2 from "argon2";

export { passwordPolicySchema, PASSWORD_REQUIREMENTS_HINT } from "./password-policy";

/**
 * Argon2id — the OWASP-recommended variant (resistant to both GPU cracking
 * and side-channel attacks, unlike argon2i/argon2d alone). Parameters follow
 * OWASP's current minimum recommendation for argon2id: 19 MiB memory, 2
 * iterations, 1 degree of parallelism. Deliberately conservative on memory
 * cost (rather than the higher 46-64 MiB profiles sometimes quoted) since
 * this runs per-login on shared serverless compute, not a dedicated auth
 * service — still far stronger than bcrypt against GPU attacks.
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * argon2.verify is constant-time with respect to the candidate password by
 * design (it re-derives the hash and compares digests internally), so this
 * is safe against timing attacks without any extra care here. A malformed
 * or foreign hash throws rather than returning false — caught and treated
 * as a failed match so a corrupted `passwordHash` column can never crash
 * the login path.
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
