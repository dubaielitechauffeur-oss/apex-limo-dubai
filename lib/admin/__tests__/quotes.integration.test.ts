import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import {
  listQuotes,
  getQuote,
  setQuoteStatus,
  setQuoteNotes,
  setQuoteAmount,
  softDeleteQuote,
  restoreQuote,
  getQuoteAuditActivity,
  convertQuoteToBooking,
  QUOTE_STATUS_TRANSITIONS,
} from "@/lib/admin/quotes";

let users: Record<SystemRole, TestUser>;
const quoteIds: string[] = [];
const bookingIdsFromConversion: string[] = [];

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

async function createQuote(overrides: Record<string, unknown> = {}) {
  const row = await prisma.quote.create({
    data: {
      reference: `TEST-Q-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      fullName: "Vitest Quote Customer",
      phone: "+971500000001",
      email: `vitest-quote-${Math.random().toString(36).slice(2, 8)}@example.com`,
      pickupLocation: "Downtown Dubai",
      dropoffLocation: "",
      date: new Date("2027-02-01"),
      time: "",
      vehicleLabel: "Rolls-Royce Phantom Extended Wheelbase",
      passengers: 1,
      hours: "",
      specialRequests: "Service requested: airport-transfers.",
      locale: "en",
      ...overrides,
    },
  });
  quoteIds.push(row.id);
  return row;
}

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityType: "quote", entityId: { in: quoteIds } } });
  await prisma.auditLog.deleteMany({ where: { entityType: "booking", entityId: { in: bookingIdsFromConversion } } });
  await prisma.booking.deleteMany({ where: { id: { in: bookingIdsFromConversion } } });
  await prisma.quote.deleteMany({ where: { id: { in: quoteIds } } });
  await cleanupTestUsers(users);
});

describe("listQuotes — permissions and querying", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await listQuotes({});
    expect(result.success).toBe(false);
  });

  it("content_manager lacks quotes:read and is denied", async () => {
    mockSessionFor(users.content_manager);
    const result = await listQuotes({});
    expect(result.success).toBe(false);
  });

  it("booking_manager can list quotes", async () => {
    mockSessionFor(users.booking_manager);
    const result = await listQuotes({});
    expect(result.success).toBe(true);
  });

  it("search by reference finds the fixture quote", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    const result = await listQuotes({ q: quote.reference });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items.some((q) => q.id === quote.id)).toBe(true);
  });

  it("filters by status", async () => {
    const quote = await createQuote({ status: "sent" });
    mockSessionFor(users.booking_manager);
    const result = await listQuotes({ q: quote.reference, status: "sent" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.items.every((q) => q.status === "sent")).toBe(true);
  });
});

describe("getQuote", () => {
  it("returns full detail", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    const result = await getQuote(quote.id);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.reference).toBe(quote.reference);
  });

  it("fails cleanly for a nonexistent quote", async () => {
    mockSessionFor(users.booking_manager);
    const result = await getQuote("nonexistent-quote-id");
    expect(result.success).toBe(false);
  });
});

describe("setQuoteStatus — controlled transitions", () => {
  it("allows a valid transition (pending -> sent) and writes an audit log", async () => {
    const quote = await createQuote();
    const before = await prisma.auditLog.count({ where: { entityType: "quote", entityId: quote.id } });

    mockSessionFor(users.booking_manager);
    const result = await setQuoteStatus(quote.id, "sent");
    expect(result.success).toBe(true);

    const updated = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(updated.status).toBe("sent");

    const after = await prisma.auditLog.count({ where: { entityType: "quote", entityId: quote.id } });
    expect(after).toBe(before + 1);
  });

  it("rejects an invalid transition (pending -> accepted, skipping the workflow)", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    const result = await setQuoteStatus(quote.id, "accepted");
    expect(result.success).toBe(false);
  });

  it('rejects setting status to "converted" directly — must go through convertQuoteToBooking', async () => {
    const quote = await createQuote({ status: "accepted" });
    mockSessionFor(users.booking_manager);
    const result = await setQuoteStatus(quote.id, "converted");
    expect(result.success).toBe(false);

    const unchanged = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(unchanged.status).toBe("accepted");
  });

  it("rejects any transition out of a terminal status (rejected)", async () => {
    const quote = await createQuote({ status: "rejected" });
    mockSessionFor(users.booking_manager);
    const result = await setQuoteStatus(quote.id, "sent");
    expect(result.success).toBe(false);
  });

  it("viewer (read-only) cannot change status", async () => {
    const quote = await createQuote();
    mockSessionFor(users.viewer);
    const result = await setQuoteStatus(quote.id, "sent");
    expect(result.success).toBe(false);
  });
});

describe("setQuoteNotes / setQuoteAmount", () => {
  it("booking_manager can set internal notes", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    const result = await setQuoteNotes(quote.id, "Customer prefers evening pickup.");
    expect(result.success).toBe(true);
    const updated = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(updated.internalNotes).toBe("Customer prefers evening pickup.");
  });

  it("sets a valid quote amount", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    const result = await setQuoteAmount(quote.id, 1500, "AED");
    expect(result.success).toBe(true);
    const updated = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(updated.estimatedAmount?.toString()).toBe("1500");
  });

  it("rejects a negative quote amount", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    const result = await setQuoteAmount(quote.id, -50, "AED");
    expect(result.success).toBe(false);
  });

  it("rejects a NaN quote amount", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    const result = await setQuoteAmount(quote.id, Number.NaN, "AED");
    expect(result.success).toBe(false);
  });

  it("viewer cannot set amount or notes", async () => {
    const quote = await createQuote();
    mockSessionFor(users.viewer);
    const amountResult = await setQuoteAmount(quote.id, 1000, "AED");
    expect(amountResult.success).toBe(false);
    const notesResult = await setQuoteNotes(quote.id, "nope");
    expect(notesResult.success).toBe(false);
  });
});

describe("softDeleteQuote / restoreQuote", () => {
  it("booking_manager lacks quotes:delete and is denied", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    const result = await softDeleteQuote(quote.id);
    expect(result.success).toBe(false);
  });

  it("admin can soft-delete and restore a quote", async () => {
    const quote = await createQuote();

    mockSessionFor(users.admin);
    const deleteResult = await softDeleteQuote(quote.id);
    expect(deleteResult.success).toBe(true);
    const deleted = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(deleted.deletedAt).not.toBeNull();

    const restoreResult = await restoreQuote(quote.id);
    expect(restoreResult.success).toBe(true);
    const restored = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(restored.deletedAt).toBeNull();
  });
});

describe("getQuoteAuditActivity", () => {
  it("returns audit entries created by earlier mutations", async () => {
    const quote = await createQuote();
    mockSessionFor(users.booking_manager);
    await setQuoteStatus(quote.id, "sent");
    await setQuoteNotes(quote.id, "note");

    const result = await getQuoteAuditActivity(quote.id);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("convertQuoteToBooking — transactional conversion", () => {
  it("successfully converts an accepted quote into a linked booking, preserving trip details", async () => {
    const quote = await createQuote({ status: "accepted", estimatedAmount: 2200, currency: "AED" });

    mockSessionFor(users.booking_manager);
    const result = await convertQuoteToBooking(quote.id);
    expect(result.success).toBe(true);
    if (!result.success) return;
    bookingIdsFromConversion.push(result.data.bookingId);

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: result.data.bookingId } });
    expect(booking.reference).toBe(result.data.bookingReference);
    expect(booking.fullName).toBe(quote.fullName);
    expect(booking.email).toBe(quote.email);
    expect(booking.pickupLocation).toBe(quote.pickupLocation);
    expect(booking.vehicleLabel).toBe(quote.vehicleLabel);
    expect(booking.status).toBe("pending");
    expect(booking.source).toBe("admin");
    expect(booking.totalAmount?.toString()).toBe("2200");

    const updatedQuote = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(updatedQuote.status).toBe("converted");
    expect(updatedQuote.convertedBookingId).toBe(booking.id);

    const bookingAudit = await prisma.auditLog.count({ where: { entityType: "booking", entityId: booking.id, action: "create" } });
    expect(bookingAudit).toBeGreaterThanOrEqual(1);
    const quoteAudit = await prisma.auditLog.count({ where: { entityType: "quote", entityId: quote.id, action: "update" } });
    expect(quoteAudit).toBeGreaterThanOrEqual(1);
  });

  it("prevents duplicate conversion of an already-converted quote, without creating a second booking", async () => {
    const quote = await createQuote({ status: "accepted" });

    mockSessionFor(users.booking_manager);
    const first = await convertQuoteToBooking(quote.id);
    expect(first.success).toBe(true);
    if (first.success) bookingIdsFromConversion.push(first.data.bookingId);

    const bookingCountBefore = await prisma.booking.count();
    const second = await convertQuoteToBooking(quote.id);
    expect(second.success).toBe(false);
    const bookingCountAfter = await prisma.booking.count();
    expect(bookingCountAfter).toBe(bookingCountBefore);
  });

  it("rejects conversion of a quote that isn't accepted yet", async () => {
    const quote = await createQuote({ status: "pending" });
    mockSessionFor(users.booking_manager);
    const result = await convertQuoteToBooking(quote.id);
    expect(result.success).toBe(false);

    const stillPending = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(stillPending.status).toBe("pending");
    expect(stillPending.convertedBookingId).toBeNull();
  });

  it("viewer (neither quotes:update nor bookings:create) is denied", async () => {
    const quote = await createQuote({ status: "accepted" });
    mockSessionFor(users.viewer);
    const result = await convertQuoteToBooking(quote.id);
    expect(result.success).toBe(false);

    const unchanged = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } });
    expect(unchanged.status).toBe("accepted");
    expect(unchanged.convertedBookingId).toBeNull();
  });

  it("fleet_manager (quotes:read only, no quotes:update or bookings:create) is denied", async () => {
    const quote = await createQuote({ status: "accepted" });
    mockSessionFor(users.fleet_manager);
    const result = await convertQuoteToBooking(quote.id);
    expect(result.success).toBe(false);
  });

  it("every declared QUOTE transition target is itself a valid QuoteStatus", () => {
    const allStatuses = Object.keys(QUOTE_STATUS_TRANSITIONS);
    for (const targets of Object.values(QUOTE_STATUS_TRANSITIONS)) {
      for (const target of targets) expect(allStatuses).toContain(target);
    }
  });
});
