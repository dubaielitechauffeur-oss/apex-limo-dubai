import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminTopBar from "@/components/admin/AdminTopBar";

export const metadata: Metadata = {
  title: "Forbidden — Admin",
  robots: { index: false, follow: false },
};

/**
 * Where `requirePermission`/`requireAnyPermission`/`requireAllPermissions`/
 * `requireRole` (lib/permissions/guard.ts) redirect an authenticated user
 * who lacks the permission a page/action required — the "403" outcome from
 * RBAC.md's error-handling section. (Route Handlers return a real HTTP 403
 * via `requireApiPermission` instead; a page render can't carry a non-200
 * status without enabling Next's experimental `authInterrupts` flag, which
 * this phase deliberately leaves untouched — see RBAC.md.)
 *
 * Reachable only by a signed-in user by construction (every guard redirects
 * to /admin/login first when there's no session at all) — the redirect
 * below is just defense in depth for a direct, sessionless visit.
 */
export default async function ForbiddenPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <>
      <AdminTopBar name={session.user.name ?? "Admin"} email={session.user.email ?? ""} />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <p className="label-eyebrow">403 — Forbidden</p>
        <h1 className="mt-4 font-display text-3xl text-heading">
          You don&rsquo;t have permission to view this page.
        </h1>
        <p className="mt-3 max-w-md text-smoke">
          Your account doesn&rsquo;t have the access required for this section. If you believe this
          is a mistake, contact an administrator.
        </p>
      </main>
    </>
  );
}
