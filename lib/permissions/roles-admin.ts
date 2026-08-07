import { prisma } from "@/lib/db";
import { getAuthzContext, hasPermission, isSuperAdmin } from "./context";
import { logRoleChange, logUnauthorizedAccess } from "./audit";
import { ALL_PERMISSIONS, PERMISSIONS, permissionResource } from "./catalog";

/**
 * Backend foundation for the future Users & Roles module — no UI here (out
 * of scope for this phase), just the permission-checked, escalation-guarded
 * functions such a UI will call. Deliberately built on the non-throwing
 * `getAuthzContext`/`hasPermission` primitives rather than the
 * redirect-based `requirePermission` from guard.ts: these are data-access
 * functions a future Server Action composes and needs a typed error result
 * from (to show inline, à la lib/auth/actions.ts's `{ error }` state
 * pattern from Phase 3) — a hard page redirect on denial would be the
 * wrong failure mode for a mutation like this.
 */

export interface RoleSummary {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
}

export type RoleAdminResult<T> = { success: true; data: T } | { success: false; error: string };

async function requireUsersRead(): Promise<RoleAdminResult<null>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!hasPermission(ctx, PERMISSIONS.USERS_READ)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.USERS_READ, "missing_permission");
    return { success: false, error: "You do not have permission to view roles." };
  }
  return { success: true, data: null };
}

/** Backend foundation for a future "view roles" screen. */
export async function listRoles(): Promise<RoleAdminResult<RoleSummary[]>> {
  const gate = await requireUsersRead();
  if (!gate.success) return gate;

  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, isSystem: true, permissions: true },
  });

  return {
    success: true,
    data: roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      permissionCount: r.permissions.length,
    })),
  };
}

/** Backend foundation for a future "view permissions" screen — the static
 *  catalog grouped by resource, not tied to any one role's grants. */
export async function listPermissionCatalog(): Promise<
  RoleAdminResult<{ permission: string; resource: string }[]>
> {
  const gate = await requireUsersRead();
  if (!gate.success) return gate;

  return {
    success: true,
    data: ALL_PERMISSIONS.map((permission) => ({
      permission,
      resource: permissionResource(permission),
    })),
  };
}

/**
 * Backend foundation for a future "change user's role" action. Enforces,
 * in order:
 *
 *  1. Caller must hold `users:update`.
 *  2. Caller may not change their OWN role — self-escalation and
 *     accidental self-lockout are both prevented by requiring a second
 *     administrator to make this change.
 *  3. Only a *current* super_admin may grant OR revoke the super_admin
 *     role on any account — checked on the caller's actual role name, not
 *     on `users:update` alone, so this can never regress even if a future
 *     role edit accidentally grants `users:update` to a non-super_admin
 *     role.
 *
 * Every denial and every successful change is written to `AuditLog`
 * (`logUnauthorizedAccess` / `logRoleChange`).
 */
export async function assignUserRole(
  targetUserId: string,
  newRoleId: string
): Promise<RoleAdminResult<{ userId: string; roleName: string }>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };

  if (!hasPermission(ctx, PERMISSIONS.USERS_UPDATE)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.USERS_UPDATE, "missing_permission");
    return { success: false, error: "You do not have permission to change user roles." };
  }

  if (targetUserId === ctx.userId) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.USERS_UPDATE, "self_role_change_attempt");
    return { success: false, error: "You cannot change your own role — ask another administrator." };
  }

  const [targetUser, newRole] = await Promise.all([
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, roleId: true, role: { select: { name: true } } },
    }),
    prisma.role.findUnique({ where: { id: newRoleId }, select: { id: true, name: true } }),
  ]);

  if (!targetUser || !newRole) {
    return { success: false, error: "User or role not found." };
  }

  const grantingSuperAdmin = newRole.name === "super_admin";
  const revokingSuperAdmin = targetUser.role.name === "super_admin" && newRole.name !== "super_admin";

  if ((grantingSuperAdmin || revokingSuperAdmin) && !isSuperAdmin(ctx)) {
    await logUnauthorizedAccess(
      ctx,
      PERMISSIONS.USERS_UPDATE,
      "super_admin_role_change_by_non_super_admin"
    );
    return { success: false, error: "Only a super_admin may grant or revoke the super_admin role." };
  }

  if (targetUser.roleId === newRole.id) {
    return { success: true, data: { userId: targetUser.id, roleName: newRole.name } };
  }

  await prisma.user.update({ where: { id: targetUserId }, data: { roleId: newRole.id } });
  await logRoleChange(ctx, targetUser.id, targetUser.name, targetUser.role.name, newRole.name);

  return { success: true, data: { userId: targetUser.id, roleName: newRole.name } };
}
