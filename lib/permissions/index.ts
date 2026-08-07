export { PERMISSIONS, ALL_PERMISSIONS, RESOURCES, isValidPermission, permissionResource } from "./catalog";
export type { Permission, Resource } from "./catalog";

export { SYSTEM_ROLES, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS, isSystemRoleName } from "./roles";
export type { SystemRole } from "./roles";

export { getAuthzContext, isSuperAdmin, hasPermission, hasSystemRole } from "./context";
export type { AuthzContext } from "./context";

export { requirePermission, requireAnyPermission, requireAllPermissions, requireRole, assertSystemRole } from "./guard";
export { requireApiPermission, requireAnyApiPermission } from "./api-guard";
export type { ApiAuthzResult } from "./api-guard";

export { canAccessModule, filterAdminNav } from "./nav";

export { logUnauthorizedAccess, logRoleChange } from "./audit";

export { listRoles, listPermissionCatalog, assignUserRole } from "./roles-admin";
export type { RoleSummary, RoleAdminResult } from "./roles-admin";
