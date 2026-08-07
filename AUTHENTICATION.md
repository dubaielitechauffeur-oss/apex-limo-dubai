# Apex Limo & Chauffeur Dubai — Admin Authentication

Phase 3 of the enterprise build-out: a complete, production-ready
authentication system for `/admin`, built on the Prisma database foundation
from Phase 2B. This phase is **authentication only** — no roles/permissions
enforcement, no dashboard, no CMS. Those are later phases.

---

## 1. Architecture Summary

**Stack:** Auth.js (NextAuth v5, `next-auth@beta`) with a Credentials
provider, JWT sessions, and Prisma for user/token storage.

**Why Auth.js v5 over a hand-rolled solution:** it owns the hard,
easy-to-get-wrong parts — encrypted session cookies (JWE via `jose`),
CSRF-safe sign-in/sign-out actions, secure cookie defaults, and a documented
error-propagation contract for custom failure reasons
(`CredentialsSignin` subclasses). Password hashing, account lockout, rate
limiting, and the reset-password flow are not Auth.js features in any
version — those are hand-built regardless of library choice, so the
library's value is entirely in the session/cookie/CSRF plumbing it replaces.

**Why Credentials + JWT, not the Account/Session/VerificationToken tables:**
Auth.js's Credentials provider does not support database sessions (a
documented upstream limitation — there's no OAuth account to key a DB
session off of). Those three tables already exist in the schema
(`prisma/schema.prisma`) for a *future* OAuth provider and are untouched by
this phase.

**Split config, edge/Node boundary** (`lib/auth/config.ts` /
`lib/auth/edge.ts` / `lib/auth/index.ts`): `middleware.ts` runs on the Edge
runtime, which cannot load Prisma or argon2 (both Node-only). The shared
`authConfig` in `config.ts` holds everything Edge-safe — cookies, JWT
callbacks, pages — and is used two ways:

- `lib/auth/edge.ts` builds an `auth()` from `authConfig` alone (no
  provider) — used only in `middleware.ts` to decode the session cookie.
- `lib/auth/index.ts` extends `authConfig` with the Credentials provider
  (Prisma + argon2 + lockout + rate-limit) — used in the API route handler
  and every Server Action.

---

## 2. Packages Installed

| Package | Purpose |
|---|---|
| `next-auth@5.0.0-beta.32` | Auth.js v5 — session/cookie/CSRF handling, Credentials provider |
| `argon2@0.45.1` | Password hashing (argon2id) |

Both installed as production `dependencies` (not devDependencies) since
they run at request time, not just at build time.

**Why argon2 over bcrypt:** OWASP's current top recommendation, and the
native binary installs and runs cleanly in this environment (verified with
a real hash/verify round-trip before adopting it) — no fallback to bcrypt
was needed. If a future deployment target can't build the native module
(rare on modern Node/Vercel, but possible on some constrained platforms),
swapping to `bcryptjs` is a two-file change (`lib/auth/password.ts` +
`lib/auth/index.ts`'s `DUMMY_HASH` constant) since nothing outside those
files touches a hash directly.

---

## 3. Files Created

```
lib/auth/
  config.ts            Shared Edge-safe NextAuth config (cookies, JWT, pages)
  edge.ts               Edge-safe auth() — middleware only
  index.ts               Full auth() + Credentials provider — Node only
  password.ts             argon2 hash/verify (Node-only, imports argon2)
  password-policy.ts       Zod policy + hint text (client-safe, no argon2)
  tokens.ts                 Secure reset-token generation/hashing
  rate-limit.ts               Per-IP sliding-window limiter (login, forgot-password)
  lockout.ts                   Per-account failed-attempt counter + lock
  session.ts                    getSession() / requireUser() helpers
  email.ts                       Password-reset email sender (Resend)
  actions.ts                      All auth Server Actions (login/logout/forgot/reset/change)

app/api/auth/[...nextauth]/route.ts   NextAuth route handler (GET/POST)

app/admin/
  layout.tsx              Root layout for the whole /admin tree (own <html>/<body>)
  page.tsx                  Protected placeholder home ("Welcome, {name}")
  login/page.tsx              Login screen
  forgot-password/page.tsx      Forgot-password screen
  reset-password/page.tsx         Reset-password screen (?token=...)
  change-password/page.tsx          Change-password screen (authenticated)

components/admin/
  LogoutButton.tsx             Sign-out form (reused by the Phase 5 admin dashboard shell's UserMenu)
  layout/                      Phase 5 dashboard shell — AdminShell, AdminHeader, UserMenu, SidebarNav (see ADMIN_PANEL.md)
  auth/
    AuthCard.tsx               Shared card shell for login/forgot/reset screens
    PasswordInput.tsx            Show/hide password toggle
    LoginForm.tsx
    ForgotPasswordForm.tsx
    ResetPasswordForm.tsx
    ChangePasswordForm.tsx

types/next-auth.d.ts       Module augmentation (Session.user.id/roleId/roleName)
```

## 4. Files Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | `User`: added `passwordHash`, `emailVerified`, `failedLoginAttempts`, `lockedUntil`, `lastLoginAt`. New `PasswordResetToken` model. |
| `prisma/seed.ts` | Optional admin-user bootstrap (see §9) |
| `prisma.config.ts` | Added `migrations.seed` (Prisma v7 moved this out of `package.json`) |
| `middleware.ts` | Wrapped in `auth()`; added the `/admin` gate (redirect signed-out → login, redirect signed-in away from login/forgot/reset). Public-site next-intl logic is untouched — the admin branch returns before it ever runs. |
| `lib/spam-protection.ts` | `getClientIp`/`isRateLimited` now take `Headers` instead of `NextRequest`, so `lib/auth/rate-limit.ts` can reuse the same spoof-resistant IP resolution from a Server Action (`headers()`) and from `authorize()`'s raw `Request`, not just from a `NextRequest`. Behavior for the existing lead-API callers is unchanged. |
| `lib/notifications.ts` | Exported `formatSubmittedAt` and `FROM_ADDRESS` (were private) so `lib/auth/email.ts` reuses the same Dubai-timezone formatting and verified sending address instead of duplicating them. |
| `lib/email-templates.ts` | Added `resetPasswordEmailHtml()`, same `emailShell` pattern as the existing lead-notification templates. |
| `package.json` / `package-lock.json` | New dependencies; removed the now-unused `prisma.seed` field (moved to `prisma.config.ts`). |
| `.env.example` | Documented `AUTH_SECRET`, `ADMIN_SEED_*`. |

No file under `app/[locale]/`, `components/` (non-`admin`), `i18n/`,
`messages/`, or `data/` was touched.

---

## 5. Environment Variables

```bash
# Required in production — Auth.js throws on boot without it.
AUTH_SECRET=            # openssl rand -base64 32

# Optional — bootstraps one super_admin user via `npm run db:seed`.
# Leave unset to skip. Re-running seed never overwrites an existing
# account's password.
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
ADMIN_SEED_NAME=
```

`RESEND_API_KEY` (already existed for lead notifications) is reused for
password-reset emails — no new email provider was introduced.

---

## 6. Security Features Implemented

| Feature | Implementation |
|---|---|
| Password hashing | argon2id, OWASP-minimum params (19 MiB, t=2, p=1) |
| Timing-safe "user not found" | A fixed dummy hash is verified even when no user matches, so a nonexistent email takes the same wall-clock time as a wrong password — no email-enumeration timing oracle |
| Session cookie | `httpOnly`, `sameSite: "lax"`, `secure` in production, `__Secure-` prefix in production |
| CSRF | Server Actions get Next.js's built-in same-origin check for free; Auth.js's own `/api/auth/*` endpoints have their own CSRF token flow |
| Login rate limiting | Per-IP sliding window, 10 attempts / 10 min (`lib/auth/rate-limit.ts`) |
| Forgot-password rate limiting | Per-IP sliding window, 5 requests / hour — stops mass token generation / email bombing |
| Account lockout | 5 consecutive failed attempts locks the account for 15 minutes (`lib/auth/lockout.ts`). The lock is checked *before* password verification, so a locked account never even reaches the argon2 step on subsequent attempts. |
| Secure token generation | `crypto.randomBytes(32)`, base64url-encoded |
| Reset token storage | Only the SHA-256 hash is stored — a leaked DB row can't be used to reset a password, same principle as a password hash |
| Reset token expiry | 1 hour |
| Reset token single-use | Marked `usedAt` on redemption; all other outstanding tokens for that user are deleted at the same time |
| No user enumeration | Forgot-password always returns the same generic message; login errors never distinguish "no such user" from "wrong password" |
| Open-redirect guard | The post-login `callbackUrl` is validated to start with `/admin` (and not `//`) before being used |
| Input validation | Zod schema for the password policy (12+ chars, upper/lower/number/symbol) |
| `noindex` | `/admin` metadata sets `robots: { index: false, follow: false }` |

---

## 7. Authentication Flow

**Login:** `LoginForm` → `loginAction` (Server Action) → `signIn("credentials", …)`
→ `authorize()` in `lib/auth/index.ts` runs: rate limit → user lookup →
timing-safe password check → active/locked checks → on success, resets the
failure counter and returns the user. `loginAction` catches any
`CredentialsSignin` subclass and maps its `.code` to a specific,
non-enumerating message.

**"Remember me":** the login form's checkbox is threaded through to the
`jwt` callback as `token.rememberMe`. A custom `jwt.encode` in
`lib/auth/config.ts` reads that flag and sizes the JWT's `exp` claim
accordingly — 8 hours unchecked, 30 days checked — since Auth.js's default
`encode` only knows a single static `session.maxAge`.

**Logout:** `LogoutButton` → `logoutAction` → `signOut({ redirect: false })`
clears the cookie, then a manual `redirect("/admin/login")`.

**Forgot password:** `forgotPasswordAction` rate-limits by IP, looks up the
user (silently, no enumeration), generates and stores a hashed token, emails
the raw token as a link, and always returns the same generic
"if an account exists…" message regardless of whether one did.

**Reset password:** `resetPasswordAction` re-hashes the submitted token,
looks it up, checks `usedAt`/`expiresAt`/account status, and — only if all
of those pass — updates the password hash, marks the token used, clears any
active lockout, and invalidates every other outstanding token for that
user.

**Change password (authenticated):** `changePasswordAction` calls
`requireUser()` (a second check even though middleware already gates the
page — see §8), verifies the current password, and rejects a "new" password
identical to the current one.

**Route protection:** `middleware.ts` wraps its whole body in `auth()`
(the Edge-safe instance). For any `/admin/*` path: unauthenticated → redirect
to `/admin/login?callbackUrl=<path>`; authenticated visiting `login`,
`forgot-password`, or `reset-password` → redirect to `/admin`. Every other
path (the entire public site) falls through to the existing next-intl
middleware, completely unchanged.

---

## 8. Defense in Depth

Middleware is the primary gate, but every protected Server Action
(`changePasswordAction`) and protected page (`/admin`,
`/admin/change-password`) also calls `requireUser()` directly. This isn't
redundant — a Server Action or Route Handler can in principle be invoked
directly without going through the page that normally wraps it, so the
handler itself re-checks rather than trusting that middleware always ran
first.

---

## 9. Bootstrapping the First Admin User

There is no self-service admin sign-up (by design — this is a Phase 4/RBAC
concern). To create the first account:

```bash
# .env
ADMIN_SEED_EMAIL="you@example.com"
ADMIN_SEED_PASSWORD="a strong password meeting the policy above"
ADMIN_SEED_NAME="Your Name"
```

```bash
npm run db:seed
```

This upserts one `super_admin`-role user. Re-running the seed is safe — it
will not overwrite the password of an account that already exists.

---

## 10. Verification Results

All gates run against a local PostgreSQL instance with the full migration
history applied and the seed script executed.

| Gate | Result |
|---|---|
| `prisma validate` | Schema valid |
| `prisma generate` | Client generated (7.9.1) |
| `tsc --noEmit` | 0 errors |
| `eslint .` | 0 errors, 0 warnings |
| `next build` | 300/300 pages generated, admin routes correctly code-split outside `[locale]` |

**End-to-end browser verification** (Playwright, real Chromium, against a
running dev server + local Postgres) — every flow below was driven through
the actual UI, not just unit-level:

- Unauthenticated `/admin` redirects to `/admin/login`
- Wrong password → "Incorrect email or password."
- Show/hide password toggle
- Correct login → redirect to `/admin`, session persists (welcome message)
- Authenticated visit to `/admin/login` redirects back to `/admin`
- Change password (success), logout, old password rejected, new password accepted
- Forgot password → generic success message, reset link generated and (in
  the absence of a configured `RESEND_API_KEY`) logged server-side
- Reset password via the emailed token → success → redirected to login with
  a success banner → new password logs in
- Reusing a spent reset token is rejected ("invalid or has expired")
- 5 consecutive failed logins lock the account for 15 minutes; the 6th
  attempt (even with the correct password) is rejected with the lockout
  message
- `/admin/forgot-password` remains reachable while locked out (a locked
  admin isn't also stranded from account recovery)
- Login rate limiting (10 attempts/10 min per IP) verified to engage under
  sustained testing load

One real bug was found and fixed during this verification: `ChangePasswordForm`
and `ResetPasswordForm` imported `PASSWORD_REQUIREMENTS_HINT` from the same
module as `hashPassword`/`verifyPassword`, which pulled `argon2` — a
Node-only native module — into the client bundle and crashed those pages.
Fixed by splitting the client-safe password *policy* (`password-policy.ts`)
from the server-only password *hashing* (`password.ts`).

---

## 11. Recommendations Before Phase 4 (RBAC)

1. **`AUTH_SECRET` in production** — must be set (the app throws on boot
   without it); rotate it if ever exposed, which invalidates all sessions.
2. **Rate limiter is per-instance** — like the existing lead-API limiter it
   replaces its pattern from, the in-memory map resets on cold start and
   doesn't share state across serverless instances. Fine for a single-admin
   internal tool today; back it with Redis if the admin panel gets enough
   concurrent traffic (or attack traffic) for that to matter.
3. **Email verification** — `emailVerified` exists on `User` as a
   foundation column (set at seed time) but there's no verification email
   flow yet; add one if self-service account creation is introduced.
4. **RBAC enforcement** — `roleId`/`roleName` are already on the session
   object (read, not yet enforced anywhere) specifically so Phase 4 can
   wire up permission checks without touching the session shape again.
5. **Audit logging** — the `AuditLog` model exists in the schema but
   nothing in this phase writes to it; consider logging login
   success/failure and password changes once the admin panel has more than
   one user.
