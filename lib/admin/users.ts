import { prisma } from "@/lib/db";
import { getAuthzContext, hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { logUnauthorizedAccess } from "@/lib/permissions/audit";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";

/**
 * Read-only Users & Roles listing/detail queries for the admin panel.
 * Lives outside `lib/permissions/` deliberately: this is admin-panel
 * business logic that *depends on* the RBAC toolkit (permission checks,
 * the shared `RoleAdminResult` result shape) rather than being RBAC
 * infrastructure itself — mutations that need the same escalation-guard
 * class as `assignUserRole` stay in `lib/permissions/roles-admin.ts`.
 */

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface AdminUserListResult {
  users: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListUsersParams {
  q?: string;
  roleId?: string;
  status?: "active" | "inactive";
  page?: number;
  pageSize?: number;
  sort?: "name" | "email" | "createdAt" | "lastLoginAt";
  order?: "asc" | "desc";
}

const DEFAULT_PAGE_SIZE = 20;

async function requireUsersRead(): Promise<RoleAdminResult<null>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!isSuperAdmin(ctx) && !hasPermission(ctx, PERMISSIONS.USERS_READ)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.USERS_READ, "missing_permission");
    return { success: false, error: "You do not have permission to view users." };
  }
  return { success: true, data: null };
}

export async function listUsers(params: ListUsersParams): Promise<RoleAdminResult<AdminUserListResult>> {
  const gate = await requireUsersRead();
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const sort = params.sort ?? "createdAt";
  const order = params.order ?? "desc";

  const where = {
    deletedAt: null,
    ...(params.roleId ? { roleId: params.roleId } : {}),
    ...(params.status ? { isActive: params.status === "active" } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        role: { select: { name: true } },
      },
    }),
  ]);

  return {
    success: true,
    data: {
      users: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        roleId: row.roleId,
        roleName: row.role.name,
        isActive: row.isActive,
        createdAt: row.createdAt,
        lastLoginAt: row.lastLoginAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  emailVerified: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

/** Deliberately omits `passwordHash`, reset tokens, and session rows —
 *  RBAC.md and Phase 5's brief both require the detail view to never
 *  expose secrets, even to a super_admin. */
export async function getUserDetail(userId: string): Promise<RoleAdminResult<AdminUserDetail>> {
  const gate = await requireUsersRead();
  if (!gate.success) return gate;

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      roleId: true,
      isActive: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      role: { select: { name: true } },
    },
  });

  if (!user) return { success: false, error: "User not found." };

  return {
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
    },
  };
}

export interface AdminUserAuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName: string;
  changes: unknown;
  createdAt: Date;
}

/** Recent audit rows relevant to one user — both changes made *to* their
 *  account (role changes, status toggles) and actions *they* performed. */
export async function getUserAuditActivity(userId: string, limit = 20): Promise<RoleAdminResult<AdminUserAuditEntry[]>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!isSuperAdmin(ctx) && !hasPermission(ctx, PERMISSIONS.AUDIT_READ)) {
    return { success: true, data: [] };
  }

  const rows = await prisma.auditLog.findMany({
    where: { OR: [{ entityType: "user", entityId: userId }, { userId }] },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    success: true,
    data: rows.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      userName: row.userName,
      changes: row.changes,
      createdAt: row.createdAt,
    })),
  };
}
