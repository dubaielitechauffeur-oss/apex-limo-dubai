import { cache } from "react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import type { Permission } from "./catalog";
import { isSystemRoleName } from "./roles";

/**
 * Everything an authorization decision needs, resolved fresh from the
 * database on every request — never trusted from the JWT.
 *
 * Why not read `roleId`/`roleName`/permissions straight off the session
 * token (which already carries `roleId`/`roleName` since Phase 3)? Two
 * staleness windows that matter for RBAC specifically:
 *
 * 1. A role's permission LIST changes (an admin edits what `content_manager`
 *    can do). The session was never going to carry the permission array at
 *    all — see RBAC.md's caching-strategy section for why — so this one is
 *    a non-issue by construction.
 * 2. A user's role ASSIGNMENT changes (moved from `viewer` to `admin`).
 *    The JWT's `roleId`/`roleName` are set once at sign-in and would
 *    otherwise persist for the session's lifetime (up to 30 days with
 *    "remember me") even after an admin reassigns them. Re-reading the
 *    User row by `session.user.id` on every check closes that window to
 *    "the very next request" instead of "the next login" — the JWT is
 *    used only to establish *identity*, never *authority*.
 *
 * `cache()` (React's per-request memoization, not a cross-request/
 * persistent cache) dedupes repeated calls within a single request or
 * Server Action invocation — several nested components each guarding a
 * different permission don't each issue their own query — while still
 * guaranteeing a fully fresh read on the very next request. This is the
 * documented Next.js App Router pattern for exactly this shape of problem.
 */
export interface AuthzContext {
  userId: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export const getAuthzContext = cache(async (): Promise<AuthzContext | null> => {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      isActive: true,
      deletedAt: true,
      roleId: true,
      role: { select: { name: true, permissions: true } },
    },
  });

  // Re-checking isActive/deletedAt here (Phase 3's authorize() already
  // checks them at login) means an account deactivated mid-session loses
  // authorization on its very next request too, not just its next login.
  if (!dbUser || !dbUser.isActive || dbUser.deletedAt) return null;

  return {
    userId: dbUser.id,
    roleId: dbUser.roleId,
    roleName: dbUser.role.name,
    permissions: dbUser.role.permissions as Permission[],
  };
});

/**
 * super_admin is unrestricted by definition, checked on the role NAME
 * alone — not by consulting `permissions`. This is what makes new
 * permissions introduced by future modules work for super_admin
 * immediately: there is nothing to add to any array, no migration, no
 * reseed. See lib/permissions/roles.ts for the fuller rationale.
 */
export function isSuperAdmin(ctx: AuthzContext | null): boolean {
  return ctx?.roleName === "super_admin";
}

/** Non-throwing check — the right primitive for "should I render this UI
 *  element" (navigation, buttons). Never a substitute for `requirePermission`
 *  at a page/action/API/data boundary — see RBAC.md's "never rely only on
 *  hiding sidebar links" rule. */
export function hasPermission(ctx: AuthzContext | null, permission: Permission): boolean {
  if (!ctx) return false;
  if (isSuperAdmin(ctx)) return true;
  return ctx.permissions.includes(permission);
}

/** True for any of the 7 approved system roles — false for a future custom
 *  (non-system) role, which by definition isn't one of the enumerated
 *  `SystemRole` names even though it's a perfectly valid `Role` row. */
export function hasSystemRole(ctx: AuthzContext | null): boolean {
  return !!ctx && isSystemRoleName(ctx.roleName);
}
