import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { writeAuditLog } from "@/lib/audit/log";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/auth/email";
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

export interface RoleWithPermissions extends RoleSummary {
  permissions: string[];
}

/** Same gate/shape as `listRoles`, plus each role's actual granted
 *  permission strings — used by the Users & Roles UI's role selector to
 *  show what a role would grant before/after assigning it. Queries the
 *  database rather than the static `ROLE_PERMISSIONS` constant so the
 *  display stays correct if a future non-system role is ever added. */
export async function listRolesWithPermissions(): Promise<RoleAdminResult<RoleWithPermissions[]>> {
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
      permissions: r.permissions,
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

/**
 * Enable/disable a user's account. Mirrors `assignUserRole`'s guard
 * ordering — permission check, then a self-action check (an admin can't
 * lock themselves out), then a super_admin-only check when the *target*
 * currently holds super_admin, so a lower-privileged `users:update` holder
 * can't neutralize a super_admin account by deactivating it instead of
 * trying to reassign its role.
 */
export async function setUserActive(
  targetUserId: string,
  isActive: boolean
): Promise<RoleAdminResult<{ userId: string; isActive: boolean }>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };

  if (!hasPermission(ctx, PERMISSIONS.USERS_UPDATE)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.USERS_UPDATE, "missing_permission");
    return { success: false, error: "You do not have permission to change user status." };
  }

  if (targetUserId === ctx.userId) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.USERS_UPDATE, "self_status_change_attempt");
    return { success: false, error: "You cannot change your own account status — ask another administrator." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, isActive: true, role: { select: { name: true } } },
  });
  if (!targetUser) return { success: false, error: "User not found." };

  if (targetUser.role.name === "super_admin" && !isSuperAdmin(ctx)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.USERS_UPDATE, "super_admin_status_change_by_non_super_admin");
    return { success: false, error: "Only a super_admin may change another super_admin's account status." };
  }

  if (targetUser.isActive === isActive) {
    return { success: true, data: { userId: targetUser.id, isActive } };
  }

  await prisma.user.update({ where: { id: targetUserId }, data: { isActive } });
  await writeAuditLog({
    action: "update",
    entityType: "user",
    entityId: targetUser.id,
    userId: ctx.userId,
    userName: ctx.roleName,
    changes: [{ field: "isActive", before: targetUser.isActive, after: isActive, targetUser: targetUser.name }],
  });

  return { success: true, data: { userId: targetUser.id, isActive } };
}

/**
 * Admin-triggered password reset. Deliberately reuses the exact same
 * token-generation + email-delivery path as the self-service "forgot
 * password" flow (`lib/auth/actions.ts`'s `forgotPasswordAction`) rather
 * than letting an administrator type a new password for someone else — an
 * admin never needs to know or transmit another user's plaintext password,
 * and the target must still prove control of their own mailbox before the
 * reset takes effect, exactly as with self-service reset.
 */
export async function adminSendPasswordReset(targetUserId: string): Promise<RoleAdminResult<{ email: string }>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };

  if (!hasPermission(ctx, PERMISSIONS.USERS_UPDATE)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.USERS_UPDATE, "missing_permission");
    return { success: false, error: "You do not have permission to reset another user's password." };
  }

  if (targetUserId === ctx.userId) {
    return { success: false, error: "Use “Change Password” to update your own password." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, email: true, isActive: true, deletedAt: true },
  });
  if (!targetUser || targetUser.deletedAt) return { success: false, error: "User not found." };
  if (!targetUser.isActive) return { success: false, error: "Cannot send a reset link to an inactive account." };

  const { token, tokenHash } = generateResetToken();
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: targetUser.id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: { userId: targetUser.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    }),
  ]);

  const requestHeaders = await headers();
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const host = requestHeaders.get("host") ?? requestHeaders.get("x-forwarded-host");
  const origin = host ? `${proto}://${host}` : "";
  const resetUrl = `${origin}/admin/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(targetUser.email, resetUrl);
  } catch (error) {
    console.error("[admin] Failed to send admin-triggered password reset email:", error);
    return { success: false, error: "Could not send the reset email. Please try again shortly." };
  }

  await writeAuditLog({
    action: "update",
    entityType: "user",
    entityId: targetUser.id,
    userId: ctx.userId,
    userName: ctx.roleName,
    changes: [{ field: "passwordReset", targetUser: targetUser.name, triggeredBy: "admin" }],
  });

  return { success: true, data: { email: targetUser.email } };
}
