import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { authConfig } from "./config";
import { verifyPassword } from "./password";
import { isAccountLocked, registerFailedAttempt, resetFailedAttempts } from "./lockout";
import { isLoginRateLimited } from "./rate-limit";

/**
 * Distinct `CredentialsSignin` subclasses so the login form can show a
 * specific, safe message (rate limited / locked / inactive / bad
 * credentials) instead of one generic failure — see the `code` property
 * doc on `CredentialsSignin` upstream: it's designed to be read back after
 * `authorize` throws. "Invalid credentials" intentionally does not
 * distinguish "no such user" from "wrong password" (see DUMMY_HASH below).
 */
class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}
class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}
class AccountLockedError extends CredentialsSignin {
  code = "account_locked";
}
class AccountInactiveError extends CredentialsSignin {
  code = "account_inactive";
}
/**
 * The database could not be reached, so this sign-in was never actually
 * decided. Kept distinct from `InvalidCredentialsError` on purpose: an
 * infrastructure outage previously surfaced here as Auth.js's generic
 * `CallbackRouteError`, which the login form renders as "Something went
 * wrong. Please try again." — indistinguishable from a typo'd password, and
 * the reason a database outage was first reported as "the admin panel won't
 * log in" with nothing to point at. It leaks no account information: the
 * lookup never ran, so this answer is identical for an address that exists
 * and one that does not.
 */
class ServiceUnavailableError extends CredentialsSignin {
  code = "service_unavailable";
}

/**
 * A fixed, valid argon2id hash of an arbitrary constant string — used as the
 * comparison target when no user matches the submitted email, so
 * `verifyPassword` still does a full KDF pass. Without this, a
 * "no such user" response returns almost instantly while a "wrong password"
 * response takes ~argon2's full cost, and that timing gap is enough to
 * enumerate registered admin emails from the login endpoint alone.
 */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,p=1,t=2$lSo24c2jmV9iiRXP6HFjjA$PaoQ1I3I5TJ/f76eNHrHLkBKU77LDJSdBLocoyva38c";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me" },
      },
      async authorize(credentials, request) {
        if (await isLoginRateLimited(request.headers)) {
          throw new RateLimitedError();
        }

        const email =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const rememberMe = credentials?.rememberMe === "true";

        if (!email || !password) {
          throw new InvalidCredentialsError();
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
          });
        } catch (err) {
          // Connection refused, pool timeout, missing table — anything that
          // means "no answer" rather than "wrong answer".
          console.error("[auth] sign-in could not reach the database:", err);
          throw new ServiceUnavailableError();
        }

        const passwordOk = await verifyPassword(user?.passwordHash ?? DUMMY_HASH, password);

        if (!user || !user.passwordHash) {
          throw new InvalidCredentialsError();
        }
        if (!user.isActive || user.deletedAt) {
          throw new AccountInactiveError();
        }
        if (isAccountLocked(user)) {
          throw new AccountLockedError();
        }
        if (!passwordOk) {
          await registerFailedAttempt(user.id);
          throw new InvalidCredentialsError();
        }

        await resetFailedAttempts(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          roleId: user.roleId,
          roleName: user.role.name,
          rememberMe,
        };
      },
    }),
  ],
});
