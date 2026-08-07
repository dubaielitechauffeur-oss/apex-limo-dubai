import { getAuthzContext, hasPermission, isSuperAdmin, type AuthzContext } from "@/lib/permissions/context";
import { logUnauthorizedAccess } from "@/lib/permissions/audit";
import type { Permission } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";

/** Same non-throwing, DB-fresh gate pattern as `lib/media/guard.ts`/
 *  `lib/admin/users.ts` — every CMS module (services, locations, faq,
 *  blog, homepage content) reuses this one function rather than each
 *  re-implementing its own permission check. */
export async function requireCmsPermission(permission: Permission): Promise<RoleAdminResult<AuthzContext>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!isSuperAdmin(ctx) && !hasPermission(ctx, permission)) {
    await logUnauthorizedAccess(ctx, permission, "missing_permission");
    return { success: false, error: "You do not have permission to perform this action." };
  }
  return { success: true, data: ctx };
}
