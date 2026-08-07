import { getAuthzContext, hasPermission, isSuperAdmin, type AuthzContext } from "@/lib/permissions/context";
import { logUnauthorizedAccess } from "@/lib/permissions/audit";
import type { Permission } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";

/**
 * Same non-throwing, DB-fresh gate pattern as `lib/admin/users.ts`/
 * `lib/permissions/roles-admin.ts` — reused rather than reinvented. Media
 * actions are gated on the existing `media:read|create|update|delete`
 * permissions (Phase 4's catalog already has exactly these four; no new
 * permission was needed for folders — see MEDIA_LIBRARY.md).
 */
export async function requireMediaPermission(permission: Permission): Promise<RoleAdminResult<AuthzContext>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!isSuperAdmin(ctx) && !hasPermission(ctx, permission)) {
    await logUnauthorizedAccess(ctx, permission, "missing_permission");
    return { success: false, error: "You do not have permission to perform this action." };
  }
  return { success: true, data: ctx };
}
