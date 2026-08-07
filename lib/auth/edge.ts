import NextAuth from "next-auth";
import { authConfig } from "./config";

/**
 * Edge-safe `auth()` for `middleware.ts` — built from the base config only
 * (no Credentials provider, no Prisma, no argon2), so it decodes the JWT
 * session cookie without ever needing the Node.js runtime. Never import
 * this from a Server Action or route handler; use `lib/auth/index.ts`
 * there instead, which is the one with sign-in capability.
 */
export const { auth } = NextAuth(authConfig);
