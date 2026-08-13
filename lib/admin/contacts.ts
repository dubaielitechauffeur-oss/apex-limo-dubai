import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { requireCmsPermission } from "@/lib/cms/guard";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { ContactSubmission, ContactSubmissionStatus, Prisma } from "@/lib/generated/prisma/client";

/**
 * Admin Contacts module — list/detail/status for the `ContactSubmission`
 * rows the public `/api/contact` route persists (see
 * `lib/api-lead-handler.ts`'s `persistContact`). Follows the same shape
 * as `lib/admin/bookings.ts`. No soft-delete on the schema — hard delete
 * only.
 */

export const CONTACT_STATUS_TRANSITIONS: Record<ContactSubmissionStatus, ContactSubmissionStatus[]> = {
  new_submission: ["read", "archived"],
  read: ["replied", "archived"],
  replied: ["archived"],
  archived: ["read"],
};

export interface AdminContactListItem {
  id: string;
  reference: string;
  status: ContactSubmissionStatus;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  createdAt: Date;
}

export interface ListContactsParams {
  q?: string;
  status?: ContactSubmissionStatus;
  page?: number;
  pageSize?: number;
}

export interface ListContactsResult {
  items: AdminContactListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;

function toListItem(row: ContactSubmission): AdminContactListItem {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    createdAt: row.createdAt,
  };
}

export async function listContacts(params: ListContactsParams): Promise<RoleAdminResult<ListContactsResult>> {
  const gate = await requireCmsPermission(PERMISSIONS.CONTACTS_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.ContactSubmissionWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.q
      ? {
          OR: [
            { reference: { contains: params.q, mode: "insensitive" as const } },
            { fullName: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
            { subject: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.contactSubmission.count({ where }),
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    success: true,
    data: { items: rows.map(toListItem), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export interface AdminContactDetail extends AdminContactListItem {
  message: string;
  locale: string;
  ipAddress: string | null;
  updatedAt: Date;
}

export async function getContact(id: string): Promise<RoleAdminResult<AdminContactDetail>> {
  const gate = await requireCmsPermission(PERMISSIONS.CONTACTS_READ);
  if (!gate.success) return gate;

  const row = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!row) return { success: false, error: "Contact submission not found." };

  return {
    success: true,
    data: {
      ...toListItem(row),
      message: row.message,
      locale: row.locale,
      ipAddress: row.ipAddress,
      updatedAt: row.updatedAt,
    },
  };
}

export async function setContactStatus(
  id: string,
  status: ContactSubmissionStatus
): Promise<RoleAdminResult<{ status: ContactSubmissionStatus }>> {
  const gate = await requireCmsPermission(PERMISSIONS.CONTACTS_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Contact submission not found." };

  if (existing.status === status) return { success: true, data: { status } };

  const allowed = CONTACT_STATUS_TRANSITIONS[existing.status];
  if (!allowed.includes(status)) {
    return { success: false, error: `Cannot change status from "${existing.status}" to "${status}".` };
  }

  await prisma.contactSubmission.update({ where: { id }, data: { status } });
  await writeAuditLog({
    action: "update",
    entityType: "contact",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "status", before: existing.status, after: status }],
  });

  return { success: true, data: { status } };
}

export async function deleteContact(id: string): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.CONTACTS_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Contact submission not found." };

  await prisma.contactSubmission.delete({ where: { id } });
  await writeAuditLog({
    action: "delete",
    entityType: "contact",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "reference", before: existing.reference }],
  });

  return { success: true, data: null };
}

export interface AdminContactAuditEntry {
  id: string;
  action: string;
  userName: string;
  changes: unknown;
  createdAt: Date;
}

export async function getContactAuditActivity(id: string, limit = 20): Promise<RoleAdminResult<AdminContactAuditEntry[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.CONTACTS_READ);
  if (!gate.success) return gate;

  const rows = await prisma.auditLog.findMany({
    where: { entityType: "contact", entityId: id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    success: true,
    data: rows.map((row) => ({ id: row.id, action: row.action, userName: row.userName, changes: row.changes, createdAt: row.createdAt })),
  };
}
