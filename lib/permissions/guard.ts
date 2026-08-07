import { redirect } from "next/navigation";
import { getAuthzContext, hasPermission, isSuperAdmin, type AuthzContext } from "./context";
import { logUnauthorizedAccess } from "./audit";
import type { Permission } from "./catalog";
import { isSystemRoleName, type SystemRole } from "./roles";

/**
 * The primary authorization gate for Server Components (pages), Server
 * Actions, and data-access functions — the "page / server action / data
 * access" levels from RBAC.md's five-level model. Route Handlers (the "API"
 * level) use `requireApiPermission` in api-guard.ts instead, since a JSON
 * endpoint should return a 401/403 status, not redirect a browser.
 *
 * Every call site gets the same three outcomes:
 *  - no session at all            → redirect to the sign-in page
 *  - signed in, missing permission → audit-logged, redirect to /admin/forbidden
 *  - signed in, has permission     → returns the resolved AuthzContext
 *
 * `redirect()` throws (it returns `never`), so control never reaches the
 * `hasPermission` check without a real `AuthzContext` in hand.
 */
export async function requirePermission(permission: Permission): Promise<AuthzContext> {
  const ctx = await getAuthzContext();
  if (!ctx) {
    redirect("/admin/login");
  }

  if (!hasPermission(ctx, permission)) {
    await logUnauthorizedAccess(ctx, permission, "missing_permission");
    redirect("/admin/forbidden");
  }

  return ctx;
}

/** Passes if the user holds at least one of the listed permissions — e.g. a
 *  page that several different roles may view for different reasons. Logs
 *  and denies against the first-listed permission when none match, so the
 *  audit trail still names a concrete requirement. */
export async function requireAnyPermission(permissions: Permission[]): Promise<AuthzContext> {
  const ctx = await getAuthzContext();
  if (!ctx) {
    redirect("/admin/login");
  }

  if (isSuperAdmin(ctx) || permissions.some((p) => hasPermission(ctx, p))) {
    return ctx;
  }

  await logUnauthorizedAccess(ctx, permissions[0], "missing_any_of_permissions");
  redirect("/admin/forbidden");
}

/** Passes only if the user holds every listed permission — e.g. a bulk
 *  action that both reads and mutates. */
export async function requireAllPermissions(permissions: Permission[]): Promise<AuthzContext> {
  const ctx = await getAuthzContext();
  if (!ctx) {
    redirect("/admin/login");
  }

  if (isSuperAdmin(ctx) || permissions.every((p) => hasPermission(ctx, p))) {
    return ctx;
  }

  const missing = permissions.find((p) => !hasPermission(ctx, p)) ?? permissions[0];
  await logUnauthorizedAccess(ctx, missing, "missing_all_of_permissions");
  redirect("/admin/forbidden");
}

/**
 * A true role-level gate — bypasses the permission catalog entirely. This
 * exists for the narrow set of operations that are role-level by nature
 * (e.g. "only super_admin may grant the super_admin role" in
 * roles-admin.ts) rather than resource-action-level. Prefer
 * `requirePermission` for anything that maps to a resource + action;
 * reach for this only when the check truly isn't about a permission at
 * all.
 */
export async function requireRole(role: SystemRole): Promise<AuthzContext> {
  const ctx = await getAuthzContext();
  if (!ctx) {
    redirect("/admin/login");
  }
  if (ctx.roleName !== role) {
    await logUnauthorizedAccess(ctx, `role:${role}`, "missing_required_role");
    redirect("/admin/forbidden");
  }
  return ctx;
}

/** Any of the 7 approved system roles — rejects a hypothetical future
 *  custom role from an operation that's explicitly scoped to the built-in
 *  set (none currently need this, but it closes the type at the boundary
 *  rather than leaving `roleName` as a bare `string`). */
export function assertSystemRole(ctx: AuthzContext): SystemRole {
  if (!isSystemRoleName(ctx.roleName)) {
    throw new Error(`Expected a system role, got "${ctx.roleName}".`);
  }
  return ctx.roleName;
}
