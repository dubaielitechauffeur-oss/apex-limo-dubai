import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import {
  listBookings,
  getBooking,
  setBookingStatus,
  setBookingNotes,
  softDeleteBooking,
  restoreBooking,
  getBookingAuditActivity,
  BOOKING_STATUS_TRANSITIONS,
} from "@/lib/admin/bookings";

let users: Record<SystemRole, TestUser>;
const bookingIds: string[] = [];

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

async function createBooking(overrides: Record<string, unknown> = {}) {
  const row = await prisma.booking.create({
    data: {
      reference: `TEST-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      fullName: "Vitest Customer",
      phone: "+971500000000",
      email: `vitest-booking-${Math.random().toString(36).slice(2, 8)}@example.com`,
      pickupLocation: "Dubai Marina",
      dropoffLocation: "Dubai International Airport",
      date: new Date("2027-01-15"),
      time: "10:00",
      vehicleLabel: "Mercedes-Maybach S-Class",
      passengers: 2,
      hours: "As directed",
      specialRequests: "",
      locale: "en",
      ...overrides,
    },
  });
  bookingIds.push(row.id);
  return row;
}

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityType: "booking", entityId: { in: bookingIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  await cleanupTestUsers(users);
});

describe("listBookings — permissions and querying", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await listBookings({});
    expect(result.success).toBe(false);
  });

  it("content_manager lacks bookings:read and is denied", async () => {
    mockSessionFor(users.content_manager);
    const result = await listBookings({});
    expect(result.success).toBe(false);
  });

  it("booking_manager can list bookings", async () => {
    mockSessionFor(users.booking_manager);
    const result = await listBookings({});
    expect(result.success).toBe(true);
  });

  it("viewer (read-only) can list bookings", async () => {
    mockSessionFor(users.viewer);
    const result = await listBookings({});
    expect(result.success).toBe(true);
  });

  it("search by reference finds the fixture booking", async () => {
    const booking = await createBooking();
    mockSessionFor(users.booking_manager);
    const result = await listBookings({ q: booking.reference });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items.some((b) => b.id === booking.id)).toBe(true);
  });

  it("search by customer email finds the fixture booking", async () => {
    const booking = await createBooking();
    mockSessionFor(users.booking_manager);
    const result = await listBookings({ q: booking.email });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items.some((b) => b.id === booking.id)).toBe(true);
  });

  it("filters by status", async () => {
    const booking = await createBooking({ status: "confirmed" });
    mockSessionFor(users.booking_manager);
    const result = await listBookings({ q: booking.reference, status: "confirmed" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items.every((b) => b.status === "confirmed")).toBe(true);

    const mismatched = await listBookings({ q: booking.reference, status: "cancelled" });
    expect(mismatched.success).toBe(true);
    if (mismatched.success) expect(mismatched.data.items.some((b) => b.id === booking.id)).toBe(false);
  });

  it("paginates results", async () => {
    mockSessionFor(users.booking_manager);
    const result = await listBookings({ page: 1, pageSize: 1 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items.length).toBeLessThanOrEqual(1);
  });
});

describe("getBooking", () => {
  it("returns full detail including vehicle relation shape", async () => {
    const booking = await createBooking();
    mockSessionFor(users.booking_manager);
    const result = await getBooking(booking.id);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reference).toBe(booking.reference);
      expect(result.data.fullName).toBe(booking.fullName);
      expect(result.data.vehicle).toBeNull();
    }
  });

  it("fails cleanly for a nonexistent booking", async () => {
    mockSessionFor(users.booking_manager);
    const result = await getBooking("nonexistent-booking-id");
    expect(result.success).toBe(false);
  });

  it("soft-deleted booking is not returned", async () => {
    const booking = await createBooking();
    await prisma.booking.update({ where: { id: booking.id }, data: { deletedAt: new Date() } });
    mockSessionFor(users.booking_manager);
    const result = await getBooking(booking.id);
    expect(result.success).toBe(false);
  });
});

describe("setBookingStatus — controlled transitions", () => {
  it("allows a valid transition (pending -> confirmed) and writes an audit log", async () => {
    const booking = await createBooking();
    const before = await prisma.auditLog.count({ where: { entityType: "booking", entityId: booking.id } });

    mockSessionFor(users.booking_manager);
    const result = await setBookingStatus(booking.id, "confirmed");
    expect(result.success).toBe(true);

    const updated = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(updated.status).toBe("confirmed");

    const after = await prisma.auditLog.count({ where: { entityType: "booking", entityId: booking.id } });
    expect(after).toBe(before + 1);
  });

  it("rejects an invalid transition (pending -> completed, skipping the workflow)", async () => {
    const booking = await createBooking();
    mockSessionFor(users.booking_manager);
    const result = await setBookingStatus(booking.id, "completed");
    expect(result.success).toBe(false);

    const unchanged = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(unchanged.status).toBe("pending");
  });

  it("rejects any transition out of a terminal status (completed)", async () => {
    const booking = await createBooking({ status: "completed" });
    mockSessionFor(users.booking_manager);
    const result = await setBookingStatus(booking.id, "confirmed");
    expect(result.success).toBe(false);
  });

  it("every declared transition target is itself a valid BookingStatus (schema/logic stay in sync)", () => {
    const allStatuses = Object.keys(BOOKING_STATUS_TRANSITIONS);
    for (const targets of Object.values(BOOKING_STATUS_TRANSITIONS)) {
      for (const target of targets) expect(allStatuses).toContain(target);
    }
  });

  it("viewer (read-only) cannot change status", async () => {
    const booking = await createBooking();
    mockSessionFor(users.viewer);
    const result = await setBookingStatus(booking.id, "confirmed");
    expect(result.success).toBe(false);

    const unchanged = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(unchanged.status).toBe("pending");
  });
});

describe("setBookingNotes — internal notes", () => {
  it("booking_manager can set internal notes", async () => {
    const booking = await createBooking();
    mockSessionFor(users.booking_manager);
    const result = await setBookingNotes(booking.id, "Customer requested child seat.");
    expect(result.success).toBe(true);

    const updated = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(updated.internalNotes).toBe("Customer requested child seat.");
  });

  it("viewer cannot set internal notes", async () => {
    const booking = await createBooking();
    mockSessionFor(users.viewer);
    const result = await setBookingNotes(booking.id, "should not be saved");
    expect(result.success).toBe(false);

    const unchanged = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(unchanged.internalNotes).toBe("");
  });
});

describe("softDeleteBooking / restoreBooking", () => {
  it("booking_manager lacks bookings:delete and is denied", async () => {
    const booking = await createBooking();
    mockSessionFor(users.booking_manager);
    const result = await softDeleteBooking(booking.id);
    expect(result.success).toBe(false);
  });

  it("admin can soft-delete and restore a booking", async () => {
    const booking = await createBooking();

    mockSessionFor(users.admin);
    const deleteResult = await softDeleteBooking(booking.id);
    expect(deleteResult.success).toBe(true);

    const deleted = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(deleted.deletedAt).not.toBeNull();

    const listAfterDelete = await listBookings({ q: booking.reference });
    expect(listAfterDelete.success).toBe(true);
    if (listAfterDelete.success) expect(listAfterDelete.data.items.some((b) => b.id === booking.id)).toBe(false);

    const restoreResult = await restoreBooking(booking.id);
    expect(restoreResult.success).toBe(true);

    const restored = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(restored.deletedAt).toBeNull();
  });
});

describe("getBookingAuditActivity", () => {
  it("returns audit entries created by earlier mutations on this booking", async () => {
    const booking = await createBooking();
    mockSessionFor(users.booking_manager);
    await setBookingStatus(booking.id, "confirmed");
    await setBookingNotes(booking.id, "note");

    const result = await getBookingAuditActivity(booking.id);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.length).toBeGreaterThanOrEqual(2);
  });
});
