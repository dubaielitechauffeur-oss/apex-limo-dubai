import { prisma } from "@/lib/db";
import { getAuthzContext, hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { logUnauthorizedAccess } from "@/lib/permissions/audit";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { GlobalSettings } from "@/lib/generated/prisma/client";

/** `GlobalSettings` is a single-row table (Phase 2B) and — per
 *  prisma/seed.ts — is never seeded, so `null` here is the normal state
 *  until a future phase adds a Settings editor. The page must treat that
 *  as an empty state, not an error. */
export async function getGlobalSettings(): Promise<RoleAdminResult<GlobalSettings | null>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!isSuperAdmin(ctx) && !hasPermission(ctx, PERMISSIONS.SETTINGS_READ)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.SETTINGS_READ, "missing_permission");
    return { success: false, error: "You do not have permission to view settings." };
  }

  const settings = await prisma.globalSettings.findFirst();
  return { success: true, data: settings };
}
