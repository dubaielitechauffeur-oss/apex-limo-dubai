import { prisma } from "@/lib/db";
import { getAuthzContext, hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { logUnauthorizedAccess } from "@/lib/permissions/audit";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { AuditAction } from "@/lib/generated/prisma/client";

export interface AdminAuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  userName: string;
  changes: unknown;
  ipAddress: string | null;
  createdAt: Date;
}

export interface ListAuditParams {
  action?: string;
  entityType?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminAuditListResult {
  entries: AdminAuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 25;

/** `AuditLog.action` is a Prisma enum — an unrecognized/empty filter value
 *  from the URL must fall through to "no filter" rather than reach Prisma
 *  and throw. */
function isKnownAuditAction(value: string): value is AuditAction {
  const known: AuditAction[] = [
    "create",
    "update",
    "delete",
    "publish",
    "unpublish",
    "archive",
    "restore",
    "login",
    "logout",
    "settings_change",
    "unauthorized_access",
  ];
  return (known as string[]).includes(value);
}

export async function listAuditLogs(params: ListAuditParams): Promise<RoleAdminResult<AdminAuditListResult>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!isSuperAdmin(ctx) && !hasPermission(ctx, PERMISSIONS.AUDIT_READ)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.AUDIT_READ, "missing_permission");
    return { success: false, error: "You do not have permission to view the audit log." };
  }

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const createdAt: { gte?: Date; lte?: Date } = {};
  if (params.from) createdAt.gte = new Date(`${params.from}T00:00:00.000Z`);
  if (params.to) createdAt.lte = new Date(`${params.to}T23:59:59.999Z`);

  const where = {
    ...(params.action && isKnownAuditAction(params.action) ? { action: params.action } : {}),
    ...(params.entityType ? { entityType: params.entityType } : {}),
    ...(Object.keys(createdAt).length > 0 ? { createdAt } : {}),
    ...(params.q
      ? {
          OR: [
            { userName: { contains: params.q, mode: "insensitive" as const } },
            { entityId: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    success: true,
    data: {
      entries: rows.map((row) => ({
        id: row.id,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        userId: row.userId,
        userName: row.userName,
        changes: row.changes,
        ipAddress: row.ipAddress,
        createdAt: row.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

/** Distinct `entityType` values currently in the table — powers the filter
 *  dropdown without hardcoding a list that would drift from real data. */
export async function listAuditEntityTypes(): Promise<string[]> {
  const rows = await prisma.auditLog.findMany({ distinct: ["entityType"], select: { entityType: true }, orderBy: { entityType: "asc" } });
  return rows.map((row) => row.entityType);
}
