import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/EmptyState";

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
 * The parent (dashboard) layout's `requireUser()` already guarantees this
 * only renders for a signed-in user — every guard redirects to
 * /admin/login first when there's no session at all.
 */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={ShieldAlert}
        title="You don't have permission to view this page"
        description="Your account doesn't have the access required for this section. If you believe this is a mistake, contact an administrator."
      />
    </div>
  );
}
