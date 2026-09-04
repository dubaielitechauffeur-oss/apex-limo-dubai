import { SITE } from "@/lib/constants";

/**
 * The application's own origin, resolved WITHOUT reading any request header.
 *
 * Three places used to build this from the `Host` header, and all three were
 * exploitable if a request could reach the origin with a `Host` an attacker
 * controls (header injection past a permissive proxy, or any deployment that
 * does not pin its host):
 *
 *  - `lib/auth/actions.ts` — the self-service password-reset link. A spoofed
 *    Host sends the one-time token to the attacker's domain.
 *  - `lib/permissions/roles-admin.ts` — the admin-triggered reset email. Same
 *    token, same exposure.
 *  - `app/admin/(dashboard)/migrate/actions.ts` — worse: it POSTs to
 *    `${origin}/api/admin/migrate` with `MIGRATE_SECRET` in a header, so a
 *    spoofed Host both makes the server issue a request to an arbitrary
 *    destination (SSRF) and hands that destination the shared secret.
 *
 * A URL that is emailed to a user, or that a secret is sent to, must never be
 * derived from the request. `AUTH_URL`/`NEXTAUTH_URL` is the deployment's own
 * configured origin where present (Auth.js sets it on most platforms), and the
 * canonical site URL is the fallback — neither is request-influenced.
 */
export function getAppOrigin(): string {
  const configured = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  return (configured || SITE.url).replace(/\/+$/, "");
}
