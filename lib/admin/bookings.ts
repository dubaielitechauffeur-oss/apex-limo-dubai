import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { requireCmsPermission } from "@/lib/cms/guard";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Booking, BookingStatus, Prisma } from "@/lib/generated/prisma/client";

/**
 * Admin Bookings CMS (Phase 10) — list/detail/status/notes for the
 * `Booking` rows the public `/api/booking` route now persists (see
 * lib/api-lead-handler.ts's `persistBooking`). Follows `lib/admin/users.ts`'s
 * shape (operational data, not publishable CMS content — no draft/publish
 * workflow, no localization, no SEO), not `lib/cms/*.ts`'s.
 */

/** Every allowed status transition, enforced server-side regardless of who's
 *  asking (including super_admin) — a business rule, not a permission rule.
 *  `pending`/`confirmed` are the two "live" entry states; `completed`/
 *  `cancelled`/`no_show` are terminal — no transition leaves them. */
export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled", "no_show"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export interface AdminBookingListItem {
  id: string;
  reference: string;
  status: BookingStatus;
  fullName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: Date;
  time: string;
  vehicleLabel: string;
  passengers: number;
  createdAt: Date;
}

export interface ListBookingsParams {
  q?: string;
  status?: BookingStatus;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sort?: "date" | "createdAt";
  order?: "asc" | "desc";
}

export interface ListBookingsResult {
  items: AdminBookingListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;

function toListItem(row: Booking): AdminBookingListItem {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    pickupLocation: row.pickupLocation,
    dropoffLocation: row.dropoffLocation,
    date: row.date,
    time: row.time,
    vehicleLabel: row.vehicleLabel,
    passengers: row.passengers,
    createdAt: row.createdAt,
  };
}

export async function listBookings(params: ListBookingsParams): Promise<RoleAdminResult<ListBookingsResult>> {
  const gate = await requireCmsPermission(PERMISSIONS.BOOKINGS_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const sort = params.sort ?? "createdAt";
  const order = params.order ?? "desc";

  const where: Prisma.BookingWhereInput = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.vehicleId ? { vehicleId: params.vehicleId } : {}),
    ...(params.dateFrom || params.dateTo
      ? {
          date: {
            ...(params.dateFrom ? { gte: new Date(params.dateFrom) } : {}),
            ...(params.dateTo ? { lte: new Date(params.dateTo) } : {}),
          },
        }
      : {}),
    ...(params.q
      ? {
          OR: [
            { reference: { contains: params.q, mode: "insensitive" as const } },
            { fullName: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
            { phone: { contains: params.q, mode: "insensitive" as const } },
            { vehicleLabel: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    success: true,
    data: { items: rows.map(toListItem), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export interface AdminBookingDetail extends AdminBookingListItem {
  vehicleId: string | null;
  hours: string;
  specialRequests: string;
  totalAmount: string | null;
  currency: string;
  paymentStatus: string;
  internalNotes: string;
  source: string;
  locale: string;
  ipAddress: string | null;
  deletedAt: Date | null;
  updatedAt: Date;
  vehicle: { id: string; slug: string; name: string } | null;
}

export async function getBooking(id: string): Promise<RoleAdminResult<AdminBookingDetail>> {
  const gate = await requireCmsPermission(PERMISSIONS.BOOKINGS_READ);
  if (!gate.success) return gate;

  const row = await prisma.booking.findFirst({
    where: { id, deletedAt: null },
    include: { vehicle: { select: { id: true, slug: true, name: true } } },
  });
  if (!row) return { success: false, error: "Booking not found." };

  return {
    success: true,
    data: {
      ...toListItem(row),
      vehicleId: row.vehicleId,
      hours: row.hours,
      specialRequests: row.specialRequests,
      totalAmount: row.totalAmount?.toString() ?? null,
      currency: row.currency,
      paymentStatus: row.paymentStatus,
      internalNotes: row.internalNotes,
      source: row.source,
      locale: row.locale,
      ipAddress: row.ipAddress,
      deletedAt: row.deletedAt,
      updatedAt: row.updatedAt,
      vehicle: row.vehicle,
    },
  };
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<RoleAdminResult<{ status: BookingStatus }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BOOKINGS_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.booking.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Booking not found." };

  if (existing.status === status) return { success: true, data: { status } };

  const allowed = BOOKING_STATUS_TRANSITIONS[existing.status];
  if (!allowed.includes(status)) {
    return { success: false, error: `Cannot change status from "${existing.status}" to "${status}".` };
  }

  await prisma.booking.update({ where: { id }, data: { status } });
  await writeAuditLog({
    action: "update",
    entityType: "booking",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "status", before: existing.status, after: status }],
  });

  return { success: true, data: { status } };
}

export async function setBookingNotes(id: string, internalNotes: string): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.BOOKINGS_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.booking.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Booking not found." };

  await prisma.booking.update({ where: { id }, data: { internalNotes } });
  await writeAuditLog({
    action: "update",
    entityType: "booking",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "internalNotes" }],
  });

  return { success: true, data: null };
}

export async function softDeleteBooking(id: string): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.BOOKINGS_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.booking.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Booking not found." };

  await prisma.booking.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({
    action: "delete",
    entityType: "booking",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "reference", before: existing.reference }],
  });

  return { success: true, data: null };
}

export async function restoreBooking(id: string): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.BOOKINGS_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.booking.findFirst({ where: { id } });
  if (!existing || !existing.deletedAt) return { success: false, error: "Booking not found or not deleted." };

  await prisma.booking.update({ where: { id }, data: { deletedAt: null } });
  await writeAuditLog({
    action: "restore",
    entityType: "booking",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "reference", after: existing.reference }],
  });

  return { success: true, data: null };
}

export interface AdminBookingAuditEntry {
  id: string;
  action: string;
  userName: string;
  changes: unknown;
  createdAt: Date;
}

export async function getBookingAuditActivity(id: string, limit = 20): Promise<RoleAdminResult<AdminBookingAuditEntry[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.BOOKINGS_READ);
  if (!gate.success) return gate;

  const rows = await prisma.auditLog.findMany({
    where: { entityType: "booking", entityId: id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    success: true,
    data: rows.map((row) => ({ id: row.id, action: row.action, userName: row.userName, changes: row.changes, createdAt: row.createdAt })),
  };
}
