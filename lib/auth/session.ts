import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/** Current session, or `null` when signed out. Thin wrapper kept so call
 *  sites depend on this module rather than importing `auth` from two
 *  different places (`lib/auth` vs `lib/auth/edge`) depending on context. */
export async function getSession(): Promise<Session | null> {
  return auth();
}

/**
 * For Server Components/Actions under `/admin` that must never render for a
 * signed-out visitor. `middleware.ts` already blocks unauthenticated
 * requests before they reach these routes, but that's one layer — a route
 * handler or Server Action can in principle be invoked directly, so the
 * page/action itself re-checks rather than trusting middleware alone.
 */
export async function requireUser(): Promise<Session["user"]> {
  const session = await getSession();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session.user;
}
