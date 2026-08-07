import type { DefaultSession } from "next-auth";

/**
 * Augments Auth.js's built-in types with the admin-specific fields this
 * app's Credentials provider and JWT/session callbacks attach — `id` (Auth.js
 * core doesn't put this on `Session["user"]` by default), plus `roleId` /
 * `roleName` for display purposes only (RBAC enforcement is a later phase;
 * nothing in this codebase branches on these yet).
 */
declare module "next-auth" {
  interface User {
    id: string;
    roleId: string;
    roleName: string;
    /** Set by the Credentials provider from the login form's checkbox; read
     *  once in the `jwt` callback to size that session's token lifetime. */
    rememberMe?: boolean;
  }

  interface Session {
    user: {
      id: string;
      roleId: string;
      roleName: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId: string;
    roleName: string;
    rememberMe?: boolean;
  }
}
