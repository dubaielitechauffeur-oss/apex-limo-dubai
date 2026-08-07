import type { ReactNode } from "react";
import type { AuthzContext } from "@/lib/permissions/context";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import type { Permission } from "@/lib/permissions/catalog";

/**
 * UI-convenience-only helper for hiding an action a user isn't permitted to
 * take (e.g. a "Change role" button). This never replaces server-side
 * enforcement — the Server Action / route handler it triggers must call
 * `requirePermission`/`requireApiPermission` (or the `roles-admin.ts`
 * escalation guards) itself, exactly as RBAC.md requires. Removing this
 * component from a page would only make an unauthorized button visible, not
 * usable.
 */
export function PermissionGate({
  ctx,
  permission,
  fallback = null,
  children,
}: {
  ctx: AuthzContext | null;
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const allowed = isSuperAdmin(ctx) || hasPermission(ctx, permission);
  return <>{allowed ? children : fallback}</>;
}
