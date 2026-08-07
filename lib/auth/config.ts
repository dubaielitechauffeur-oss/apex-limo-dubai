import type { NextAuthConfig } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";

/**
 * Split-config pattern: this file holds everything Auth.js needs to decode
 * a session cookie and run the JWT/session callbacks — no Prisma, no argon2,
 * nothing that requires the Node.js runtime. `lib/auth/edge.ts` builds an
 * `auth()` from just this config for use in `middleware.ts`, which runs on
 * the Edge runtime and would fail to bundle a Node-only dependency.
 * `lib/auth/index.ts` extends this with the Credentials provider (Node-only)
 * for use in Server Actions and the API route handler.
 */

/** Standard session lifetime. */
export const SESSION_MAX_AGE_DEFAULT = 8 * 60 * 60; // 8 hours
/** "Remember me" session lifetime — the ceiling passed to Auth.js's own
 *  `session.maxAge`, and the value substituted for the shorter default in
 *  the custom `jwt.encode` below when the login form's checkbox was ticked. */
export const SESSION_MAX_AGE_REMEMBER = 30 * 24 * 60 * 60; // 30 days

const isProduction = process.env.NODE_ENV === "production";

export const authConfig: NextAuthConfig = {
  // No adapter: Credentials + JWT sessions don't touch the Account/Session/
  // VerificationToken tables — those stay reserved for a future OAuth
  // provider, per DATABASE_ARCHITECTURE.md.
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_REMEMBER,
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  // Required outside of well-known platforms (e.g. Vercel) that set the
  // trusted-host signal automatically — a self-hosted deploy behind its own
  // reverse proxy needs this to avoid Auth.js's "UntrustedHost" rejection.
  trustHost: true,
  cookies: {
    sessionToken: {
      // `__Secure-` is a browser-enforced prefix (HTTPS-only, no bare-domain
      // cookie) — only valid when the `secure` flag is also set, hence gated
      // on the same `isProduction` check as that flag.
      name: isProduction ? "__Secure-apex-admin-session" : "apex-admin-session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  jwt: {
    /**
     * Auth.js's default `encode` always sizes the token's `exp` claim from
     * the static `session.maxAge` — there's no per-sign-in hook for that.
     * Overriding `encode` to read the `rememberMe` flag stashed on the token
     * by the `jwt` callback below is the documented way to vary session
     * length per login (unchecked = 8h, checked = 30d) under a single JWT
     * strategy, without a second session table to track expiry ourselves.
     */
    async encode(params) {
      const rememberMe = params.token?.rememberMe === true;
      return defaultEncode({
        ...params,
        maxAge: rememberMe ? SESSION_MAX_AGE_REMEMBER : SESSION_MAX_AGE_DEFAULT,
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in call, not on every
      // subsequent request — this is where provider output becomes the
      // long-lived token payload.
      if (user) {
        token.id = user.id;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
        token.rememberMe = user.rememberMe === true;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.roleId = token.roleId;
      session.user.roleName = token.roleName;
      return session;
    },
  },
  providers: [],
};
