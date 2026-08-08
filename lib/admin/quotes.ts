import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { requireCmsPermission } from "@/lib/cms/guard";
import { generateReference } from "@/lib/api-lead-handler";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Quote, QuoteStatus, Prisma } from "@/lib/generated/prisma/client";

/**
 * Admin Quotes CMS (Phase 10) — mirrors lib/admin/bookings.ts's shape
 * exactly, plus the one Quote-specific operation: transactional conversion
 * into a real `Booking` row.
 */

/** `converted` is deliberately unreachable here — it's only ever set by
 *  `convertQuoteToBooking()` below, alongside the `Booking` row it requires,
 *  never by a bare status change. `rejected`/`expired` are terminal. */
export const QUOTE_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  pending: ["sent", "rejected", "expired"],
  sent: ["viewed", "accepted", "rejected", "expired"],
  viewed: ["accepted", "rejected", "expired"],
  accepted: ["rejected", "expired"],
  rejected: [],
  expired: [],
  converted: [],
};

export interface AdminQuoteListItem {
  id: string;
  reference: string;
  status: QuoteStatus;
  fullName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: Date;
  vehicleLabel: string;
  estimatedAmount: string | null;
  currency: string;
  convertedBookingId: string | null;
  createdAt: Date;
}

export interface ListQuotesParams {
  q?: string;
  status?: QuoteStatus;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sort?: "date" | "createdAt";
  order?: "asc" | "desc";
}

export interface ListQuotesResult {
  items: AdminQuoteListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;

function toListItem(row: Quote): AdminQuoteListItem {
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
    vehicleLabel: row.vehicleLabel,
    estimatedAmount: row.estimatedAmount?.toString() ?? null,
    currency: row.currency,
    convertedBookingId: row.convertedBookingId,
    createdAt: row.createdAt,
  };
}

export async function listQuotes(params: ListQuotesParams): Promise<RoleAdminResult<ListQuotesResult>> {
  const gate = await requireCmsPermission(PERMISSIONS.QUOTES_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const sort = params.sort ?? "createdAt";
  const order = params.order ?? "desc";

  const where: Prisma.QuoteWhereInput = {
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
    prisma.quote.count({ where }),
    prisma.quote.findMany({ where, orderBy: { [sort]: order }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);

  return {
    success: true,
    data: { items: rows.map(toListItem), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export interface AdminQuoteDetail extends AdminQuoteListItem {
  vehicleId: string | null;
  time: string;
  passengers: number;
  hours: string;
  specialRequests: string;
  internalNotes: string;
  source: string;
  locale: string;
  ipAddress: string | null;
  expiresAt: Date | null;
  deletedAt: Date | null;
  updatedAt: Date;
  vehicle: { id: string; slug: string; name: string } | null;
}

export async function getQuote(id: string): Promise<RoleAdminResult<AdminQuoteDetail>> {
  const gate = await requireCmsPermission(PERMISSIONS.QUOTES_READ);
  if (!gate.success) return gate;

  const row = await prisma.quote.findFirst({
    where: { id, deletedAt: null },
    include: { vehicle: { select: { id: true, slug: true, name: true } } },
  });
  if (!row) return { success: false, error: "Quote not found." };

  return {
    success: true,
    data: {
      ...toListItem(row),
      vehicleId: row.vehicleId,
      time: row.time,
      passengers: row.passengers,
      hours: row.hours,
      specialRequests: row.specialRequests,
      internalNotes: row.internalNotes,
      source: row.source,
      locale: row.locale,
      ipAddress: row.ipAddress,
      expiresAt: row.expiresAt,
      deletedAt: row.deletedAt,
      updatedAt: row.updatedAt,
      vehicle: row.vehicle,
    },
  };
}

export async function setQuoteStatus(id: string, status: QuoteStatus): Promise<RoleAdminResult<{ status: QuoteStatus }>> {
  const gate = await requireCmsPermission(PERMISSIONS.QUOTES_UPDATE);
  if (!gate.success) return gate;

  if (status === "converted") {
    return { success: false, error: 'Use "Convert to Booking" to move a quote to converted status.' };
  }

  const existing = await prisma.quote.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Quote not found." };

  if (existing.status === status) return { success: true, data: { status } };

  const allowed = QUOTE_STATUS_TRANSITIONS[existing.status];
  if (!allowed.includes(status)) {
    return { success: false, error: `Cannot change status from "${existing.status}" to "${status}".` };
  }

  await prisma.quote.update({ where: { id }, data: { status } });
  await writeAuditLog({
    action: "update",
    entityType: "quote",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "status", before: existing.status, after: status }],
  });

  return { success: true, data: { status } };
}

export async function setQuoteNotes(id: string, internalNotes: string): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.QUOTES_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.quote.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Quote not found." };

  await prisma.quote.update({ where: { id }, data: { internalNotes } });
  await writeAuditLog({
    action: "update",
    entityType: "quote",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "internalNotes" }],
  });

  return { success: true, data: null };
}

export async function setQuoteAmount(id: string, estimatedAmount: number | null, currency: string): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.QUOTES_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.quote.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Quote not found." };
  if (estimatedAmount !== null && (Number.isNaN(estimatedAmount) || estimatedAmount < 0)) {
    return { success: false, error: "Quote amount must be a non-negative number." };
  }

  await prisma.quote.update({ where: { id }, data: { estimatedAmount, currency: currency.trim() || "AED" } });
  await writeAuditLog({
    action: "update",
    entityType: "quote",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "estimatedAmount", before: existing.estimatedAmount?.toString(), after: estimatedAmount?.toString() }],
  });

  return { success: true, data: null };
}

export async function softDeleteQuote(id: string): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.QUOTES_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.quote.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Quote not found." };

  await prisma.quote.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({
    action: "delete",
    entityType: "quote",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "reference", before: existing.reference }],
  });

  return { success: true, data: null };
}

export async function restoreQuote(id: string): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.QUOTES_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.quote.findFirst({ where: { id } });
  if (!existing || !existing.deletedAt) return { success: false, error: "Quote not found or not deleted." };

  await prisma.quote.update({ where: { id }, data: { deletedAt: null } });
  await writeAuditLog({
    action: "restore",
    entityType: "quote",
    entityId: id,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "reference", after: existing.reference }],
  });

  return { success: true, data: null };
}

export interface AdminQuoteAuditEntry {
  id: string;
  action: string;
  userName: string;
  changes: unknown;
  createdAt: Date;
}

export async function getQuoteAuditActivity(id: string, limit = 20): Promise<RoleAdminResult<AdminQuoteAuditEntry[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.QUOTES_READ);
  if (!gate.success) return gate;

  const rows = await prisma.auditLog.findMany({
    where: { entityType: "quote", entityId: id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    success: true,
    data: rows.map((row) => ({ id: row.id, action: row.action, userName: row.userName, changes: row.changes, createdAt: row.createdAt })),
  };
}

/**
 * Transactionally converts an `accepted` quote into a new `Booking` row,
 * copying its trip/customer details across, then links the two
 * (`Quote.convertedBookingId`, `Quote.status = "converted"`).
 *
 * Duplicate-conversion safety: the initial read checks
 * `convertedBookingId`/`status`, but the actual guarantee is the
 * `updateMany({ where: { id, convertedBookingId: null } })` inside the same
 * interactive transaction as the `Booking` creation — if a concurrent
 * request already converted this quote between the read and here, that
 * update matches zero rows, the function throws, and Prisma rolls back the
 * `Booking` row it had just created. Only requires *both*
 * `quotes:update` and `bookings:create` — booking_manager/admin/super_admin
 * hold both; a role with only one (or neither) is correctly denied.
 */
export async function convertQuoteToBooking(quoteId: string): Promise<RoleAdminResult<{ bookingId: string; bookingReference: string }>> {
  const quoteGate = await requireCmsPermission(PERMISSIONS.QUOTES_UPDATE);
  if (!quoteGate.success) return quoteGate;
  const bookingGate = await requireCmsPermission(PERMISSIONS.BOOKINGS_CREATE);
  if (!bookingGate.success) return bookingGate;

  const existing = await prisma.quote.findFirst({ where: { id: quoteId, deletedAt: null } });
  if (!existing) return { success: false, error: "Quote not found." };
  if (existing.convertedBookingId || existing.status === "converted") {
    return { success: false, error: "This quote has already been converted to a booking." };
  }
  if (existing.status !== "accepted") {
    return { success: false, error: `Only accepted quotes can be converted to a booking (current status: "${existing.status}").` };
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          reference: generateReference("APX-"),
          status: "pending",
          source: "admin",
          fullName: existing.fullName,
          phone: existing.phone,
          email: existing.email,
          pickupLocation: existing.pickupLocation,
          dropoffLocation: existing.dropoffLocation,
          date: existing.date,
          time: existing.time,
          vehicleId: existing.vehicleId,
          vehicleLabel: existing.vehicleLabel,
          passengers: existing.passengers,
          hours: existing.hours,
          specialRequests: existing.specialRequests,
          totalAmount: existing.estimatedAmount,
          currency: existing.currency,
          locale: existing.locale,
          ipAddress: existing.ipAddress,
        },
      });

      const linked = await tx.quote.updateMany({
        where: { id: quoteId, convertedBookingId: null },
        data: { convertedBookingId: created.id, status: "converted" },
      });
      if (linked.count === 0) {
        throw new Error("This quote has already been converted to a booking.");
      }

      return created;
    });

    await writeAuditLog({
      action: "create",
      entityType: "booking",
      entityId: booking.id,
      userId: quoteGate.data.userId,
      userName: quoteGate.data.roleName,
      changes: [{ field: "convertedFromQuote", after: quoteId }],
    });
    await writeAuditLog({
      action: "update",
      entityType: "quote",
      entityId: quoteId,
      userId: quoteGate.data.userId,
      userName: quoteGate.data.roleName,
      changes: [
        { field: "status", before: "accepted", after: "converted" },
        { field: "convertedBookingId", after: booking.id },
      ],
    });

    return { success: true, data: { bookingId: booking.id, bookingReference: booking.reference } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Conversion failed.";
    return { success: false, error: message };
  }
}
