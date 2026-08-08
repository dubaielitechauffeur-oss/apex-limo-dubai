import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import { getAnalyticsOverview } from "@/lib/admin/analytics";

let users: Record<SystemRole, TestUser>;
const bookingIds: string[] = [];
const quoteIds: string[] = [];

const BOOKING_BASE = {
  fullName: "Vitest Analytics",
  phone: "+971500000000",
  email: "vitest-analytics@example.com",
  pickupLocation: "Dubai Marina",
  dropoffLocation: "DXB Airport",
  date: new Date(),
  time: "10:00",
  vehicleLabel: "Vitest Analytics Vehicle",
  passengers: 2,
  hours: "Airport Transfer",
  locale: "en",
};

beforeAll(async () => {
  users = await createTestUsers();

  const b1 = await prisma.booking.create({ data: { ...BOOKING_BASE, reference: "VITEST-ANALYTICS-B1", status: "confirmed" } });
  const b2 = await prisma.booking.create({ data: { ...BOOKING_BASE, reference: "VITEST-ANALYTICS-B2", status: "confirmed" } });
  const b3 = await prisma.booking.create({ data: { ...BOOKING_BASE, reference: "VITEST-ANALYTICS-B3", status: "cancelled" } });
  bookingIds.push(b1.id, b2.id, b3.id);

  const q1 = await prisma.quote.create({ data: { ...BOOKING_BASE, reference: "VITEST-ANALYTICS-Q1", status: "converted" } });
  const q2 = await prisma.quote.create({ data: { ...BOOKING_BASE, reference: "VITEST-ANALYTICS-Q2", status: "pending" } });
  quoteIds.push(q1.id, q2.id);
});

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  await prisma.quote.deleteMany({ where: { id: { in: quoteIds } } });
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

describe("getAnalyticsOverview — permission gating", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await getAnalyticsOverview();
    expect(result.success).toBe(false);
  });

  it("content_manager lacks analytics:read and is denied", async () => {
    mockSessionFor(users.content_manager);
    const result = await getAnalyticsOverview();
    expect(result.success).toBe(false);
  });

  it("booking_manager has analytics:read and is allowed", async () => {
    mockSessionFor(users.booking_manager);
    const result = await getAnalyticsOverview();
    expect(result.success).toBe(true);
  });

  it("viewer has analytics:read and is allowed", async () => {
    mockSessionFor(users.viewer);
    const result = await getAnalyticsOverview();
    expect(result.success).toBe(true);
  });
});

describe("getAnalyticsOverview — data correctness", () => {
  it("counts fixture bookings/quotes correctly by status", async () => {
    mockSessionFor(users.super_admin);
    const result = await getAnalyticsOverview();
    expect(result.success).toBe(true);
    if (!result.success) return;

    const confirmedRow = result.data.bookings.byStatus.find((r) => r.status === "confirmed");
    const cancelledRow = result.data.bookings.byStatus.find((r) => r.status === "cancelled");
    expect(confirmedRow?.count).toBeGreaterThanOrEqual(2);
    expect(cancelledRow?.count).toBeGreaterThanOrEqual(1);
    expect(result.data.bookings.total).toBeGreaterThanOrEqual(3);

    const convertedRow = result.data.quotes.byStatus.find((r) => r.status === "converted");
    expect(convertedRow?.count).toBeGreaterThanOrEqual(1);
    expect(result.data.quotes.total).toBeGreaterThanOrEqual(2);
  });

  it("reports a conversion rate between 0 and 100", async () => {
    mockSessionFor(users.super_admin);
    const result = await getAnalyticsOverview();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.quotes.conversionRatePercent).toBeGreaterThanOrEqual(0);
    expect(result.data.quotes.conversionRatePercent).toBeLessThanOrEqual(100);
  });

  it("includes the fixture vehicle label in top vehicles ranked by booking count", async () => {
    mockSessionFor(users.super_admin);
    const result = await getAnalyticsOverview();
    expect(result.success).toBe(true);
    if (!result.success) return;
    const fixtureRow = result.data.topVehicles.find((v) => v.name === "Vitest Analytics Vehicle");
    expect(fixtureRow).toBeDefined();
    expect(fixtureRow?.bookingCount).toBeGreaterThanOrEqual(3);
  });

  it("marks traffic analytics as unavailable (no GA API credentials wired)", async () => {
    mockSessionFor(users.super_admin);
    const result = await getAnalyticsOverview();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.trafficAnalyticsAvailable).toBe(false);
  });
});
