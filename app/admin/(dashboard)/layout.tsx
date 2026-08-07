import { requireUser } from "@/lib/auth/session";
import { getAuthzContext } from "@/lib/permissions/context";
import { filterAdminNav } from "@/lib/permissions/nav";
import { ADMIN_NAV } from "@/config/admin";
import { AdminShell } from "@/components/admin/layout/AdminShell";

/**
 * Shell for every authenticated admin screen (dashboard, Users & Roles,
 * audit log, settings, module placeholders). Login/forgot-password/
 * reset-password stay siblings outside this group — they render with the
 * original dark `AuthCard` chrome and must work for a signed-out visitor.
 *
 * `requireUser()` is the same "any signed-in admin" gate `app/admin/page.tsx`
 * always used; it does not grant access to anything — every page rendered
 * inside still calls its own `requirePermission` for the specific resource
 * it needs (RBAC.md's five-level protection model). The nav is filtered
 * here purely so the sidebar doesn't show links a user can't use; hiding a
 * link is not, by itself, the security boundary.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const ctx = await getAuthzContext();
  const nav = filterAdminNav(ADMIN_NAV, ctx);

  return (
    <AdminShell nav={nav} name={user.name ?? "Admin"} email={user.email ?? ""} roleName={ctx?.roleName ?? "—"}>
      {children}
    </AdminShell>
  );
}
