import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { generateReference, persistBooking, persistQuote } from "@/lib/api-lead-handler";
import type { BookingFormData, QuoteFormData } from "@/lib/types";

/**
 * Regression coverage for the Phase 10 finding that the public booking/quote
 * API routes never wrote to the database — only sent an email. These tests
 * exercise `persistBooking`/`persistQuote` directly (the same functions
 * `app/api/booking/route.ts`/`app/api/quote/route.ts` now call), against a
 * real Postgres connection, with no session/permission mocking since these
 * are intentionally anonymous public-submission helpers, not admin-gated
 * mutations.
 */

const bookingIds: string[] = [];
const quoteIds: string[] = [];

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  await prisma.quote.deleteMany({ where: { id: { in: quoteIds } } });
});

const bookingData: BookingFormData = {
  fullName: "Persist Test",
  phone: "+971501234567",
  email: "persist-booking@example.com",
  pickupLocation: "Burj Khalifa",
  dropoffLocation: "Dubai International Airport",
  date: "2027-03-10",
  time: "14:30",
  vehicle: "Mercedes-Maybach S-Class",
  passengers: 3,
  hours: "As directed",
  specialRequests: "Meet and greet please.",
};

describe("persistBooking", () => {
  it("creates a real Booking row with reference/locale/ipAddress populated", async () => {
    const reference = generateReference("APX-");
    const result = await persistBooking(bookingData, { reference, locale: "en", ipAddress: "203.0.113.5" });
    expect(result).not.toBeNull();
    if (!result) return;
    bookingIds.push(result.id);

    const row = await prisma.booking.findUniqueOrThrow({ where: { id: result.id } });
    expect(row.reference).toBe(reference);
    expect(row.fullName).toBe(bookingData.fullName);
    expect(row.email).toBe(bookingData.email);
    expect(row.pickupLocation).toBe(bookingData.pickupLocation);
    expect(row.dropoffLocation).toBe(bookingData.dropoffLocation);
    expect(row.time).toBe(bookingData.time);
    expect(row.passengers).toBe(bookingData.passengers);
    expect(row.vehicleLabel).toBe(bookingData.vehicle);
    expect(row.specialRequests).toBe(bookingData.specialRequests);
    expect(row.locale).toBe("en");
    expect(row.ipAddress).toBe("203.0.113.5");
    expect(row.status).toBe("pending");
    expect(row.source).toBe("website");
  });

  it("resolves vehicleId when the vehicle label matches a real, non-deleted Vehicle by name", async () => {
    const vehicle = await prisma.vehicle.findFirst({ where: { deletedAt: null }, select: { id: true, name: true } });
    if (!vehicle) return; // no seeded/migrated vehicles in this environment — nothing to assert

    const reference = generateReference("APX-");
    const result = await persistBooking({ ...bookingData, vehicle: vehicle.name }, { reference, locale: "en", ipAddress: null });
    expect(result).not.toBeNull();
    if (!result) return;
    bookingIds.push(result.id);

    const row = await prisma.booking.findUniqueOrThrow({ where: { id: result.id } });
    expect(row.vehicleId).toBe(vehicle.id);
  });

  it("leaves vehicleId null (not an error) when the vehicle label matches nothing", async () => {
    const reference = generateReference("APX-");
    const result = await persistBooking({ ...bookingData, vehicle: "Some Unlisted Car Nobody Sells" }, { reference, locale: "en", ipAddress: null });
    expect(result).not.toBeNull();
    if (!result) return;
    bookingIds.push(result.id);

    const row = await prisma.booking.findUniqueOrThrow({ where: { id: result.id } });
    expect(row.vehicleId).toBeNull();
    expect(row.vehicleLabel).toBe("Some Unlisted Car Nobody Sells");
  });

  it("does not throw and returns null on a duplicate reference instead of corrupting the customer response", async () => {
    const reference = generateReference("APX-");
    const first = await persistBooking(bookingData, { reference, locale: "en", ipAddress: null });
    expect(first).not.toBeNull();
    if (first) bookingIds.push(first.id);

    const second = await persistBooking(bookingData, { reference, locale: "en", ipAddress: null });
    expect(second).toBeNull();
  });
});

const quoteData: QuoteFormData = {
  fullName: "Persist Quote Test",
  phone: "+971509876543",
  email: "persist-quote@example.com",
  serviceType: "Airport Transfer",
  pickupLocation: "Palm Jumeirah",
  date: "2027-04-01",
  vehicle: "Rolls-Royce Phantom Extended Wheelbase",
  message: "Need a quote for a family of 4.",
};

describe("persistQuote", () => {
  it("creates a real Quote row, folding serviceType/message into specialRequests", async () => {
    const reference = generateReference("APX-Q-");
    const result = await persistQuote(quoteData, { reference, locale: "en", ipAddress: "198.51.100.7" });
    expect(result).not.toBeNull();
    if (!result) return;
    quoteIds.push(result.id);

    const row = await prisma.quote.findUniqueOrThrow({ where: { id: result.id } });
    expect(row.reference).toBe(reference);
    expect(row.fullName).toBe(quoteData.fullName);
    expect(row.pickupLocation).toBe(quoteData.pickupLocation);
    expect(row.vehicleLabel).toBe(quoteData.vehicle);
    expect(row.date.toISOString().slice(0, 10)).toBe(quoteData.date);
    expect(row.specialRequests).toContain("Service requested: Airport Transfer.");
    expect(row.specialRequests).toContain(quoteData.message);
    expect(row.locale).toBe("en");
    expect(row.ipAddress).toBe("198.51.100.7");
    expect(row.status).toBe("pending");
    // Fields the public quote form doesn't collect get honest, non-null placeholders:
    expect(row.dropoffLocation).toBe("");
    expect(row.time).toBe("");
    expect(row.passengers).toBe(1);
  });

  it('defaults date to today and notes "no specific date requested" when the form left date blank', async () => {
    const reference = generateReference("APX-Q-");
    const result = await persistQuote({ ...quoteData, date: "" }, { reference, locale: "en", ipAddress: null });
    expect(result).not.toBeNull();
    if (!result) return;
    quoteIds.push(result.id);

    const row = await prisma.quote.findUniqueOrThrow({ where: { id: result.id } });
    const today = new Date().toISOString().slice(0, 10);
    expect(row.date.toISOString().slice(0, 10)).toBe(today);
    expect(row.specialRequests).toContain("No specific date requested (flexible).");
  });

  it("resolves vehicleId for quotes the same way as bookings", async () => {
    const vehicle = await prisma.vehicle.findFirst({ where: { deletedAt: null }, select: { id: true, name: true } });
    if (!vehicle) return;

    const reference = generateReference("APX-Q-");
    const result = await persistQuote({ ...quoteData, vehicle: vehicle.name }, { reference, locale: "en", ipAddress: null });
    expect(result).not.toBeNull();
    if (!result) return;
    quoteIds.push(result.id);

    const row = await prisma.quote.findUniqueOrThrow({ where: { id: result.id } });
    expect(row.vehicleId).toBe(vehicle.id);
  });
});
