import { writeAuditLog } from "@/lib/audit/log";
import type { Permission } from "./catalog";
import type { AuthzContext } from "./context";

/**
 * Authorization-specific audit events, built on the generic writer in
 * lib/audit/log.ts. Every call here is wrapped in try/catch and never
 * throws — a logging failure must not itself become the reason a security
 * check fails closed or, worse, fails open.
 */

/**
 * Called by `requirePermission`/`requireApiPermission` on every denial for
 * an *authenticated* user (an anonymous visitor hitting a protected route
 * is just the normal "please sign in" redirect, not a security event worth
 * an audit row). Covers both plain "lacks this permission" denials and
 * privilege-escalation attempts (e.g. a non-super-admin trying to grant
 * the super_admin role) — the `reason` field distinguishes them.
 */
export async function logUnauthorizedAccess(
  ctx: AuthzContext | null,
  /** Usually a cataloged `Permission`; `requireRole` in guard.ts also
   *  passes a descriptive `"role:<name>"` label for true role-level
   *  checks that never had a permission to name — hence `string` here
   *  rather than the stricter `Permission`. */
  permission: Permission | string,
  reason: string,
  path?: string
): Promise<void> {
  try {
    await writeAuditLog({
      action: "unauthorized_access",
      entityType: "authorization",
      entityId: permission,
      userId: ctx?.userId ?? null,
      userName: ctx ? ctx.roleName : "anonymous",
      changes: {
        requiredPermission: permission,
        userRole: ctx?.roleName ?? null,
        reason,
        path: path ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] Failed to log unauthorized access attempt:", error);
  }
}

/** Called by the role-management foundation (lib/permissions/roles-admin.ts)
 *  whenever a user's role assignment changes — covers both "role assigned"
 *  (a brand-new user) and "role changed" (reassignment) with the same
 *  before/after shape, reusing the existing `update` AuditAction rather
 *  than adding another enum value for what is, at the data level, just an
 *  update to `User.roleId`. */
export async function logRoleChange(
  actor: AuthzContext,
  targetUserId: string,
  targetUserName: string,
  beforeRoleName: string | null,
  afterRoleName: string
): Promise<void> {
  try {
    await writeAuditLog({
      action: "update",
      entityType: "user",
      entityId: targetUserId,
      userId: actor.userId,
      userName: actor.roleName,
      changes: [
        {
          field: "role",
          before: beforeRoleName,
          after: afterRoleName,
          targetUser: targetUserName,
        },
      ],
    });
  } catch (error) {
    console.error("[audit] Failed to log role change:", error);
  }
}
