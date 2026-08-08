import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { requireCmsPermission } from "@/lib/cms/guard";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { BookingStatus, QuoteStatus } from "@/lib/generated/prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface AnalyticsOverview {
  bookings: {
    total: number;
    byStatus: { status: BookingStatus; count: number }[];
    last30Days: number;
    prev30Days: number;
    /** Percent change of last30Days vs prev30Days — null when prev30Days is 0 (no baseline to compare against). */
    trendPercent: number | null;
  };
  quotes: {
    total: number;
    byStatus: { status: QuoteStatus; count: number }[];
    /** Share of quotes ever converted to a booking, 0–100. */
    conversionRatePercent: number;
  };
  fleet: { total: number; published: number; draft: number };
  content: {
    services: { total: number; published: number };
    locations: { total: number; published: number };
    blogPosts: { total: number; published: number };
  };
  topVehicles: { name: string; bookingCount: number }[];
  /**
   * Website traffic/pageview analytics (sessions, bounce rate, top pages)
   * are intentionally out of scope here — Google Analytics is already live
   * site-wide (see app/[locale]/layout.tsx's <GoogleAnalytics>) but pulling
   * its numbers into this dashboard needs a GA4 Data API service-account
   * credential this environment doesn't have. Everything below is real
   * internal data (bookings, quotes, fleet, content), not a placeholder.
   */
  trafficAnalyticsAvailable: false;
}

const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"];
const QUOTE_STATUSES: QuoteStatus[] = ["pending", "sent", "viewed", "accepted", "rejected", "expired", "converted"];

export async function getAnalyticsOverview(): Promise<RoleAdminResult<AnalyticsOverview>> {
  const gate = await requireCmsPermission(PERMISSIONS.ANALYTICS_READ);
  if (!gate.success) return gate;

  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * DAY_MS);
  const prev30Start = new Date(now.getTime() - 60 * DAY_MS);

  const [
    bookingTotal,
    bookingByStatusRaw,
    bookingLast30,
    bookingPrev30,
    quoteTotal,
    quoteByStatusRaw,
    quoteConverted,
    vehicleTotal,
    vehiclePublished,
    servicesTotal,
    servicesPublished,
    locationsTotal,
    locationsPublished,
    blogTotal,
    blogPublished,
    topVehiclesRaw,
  ] = await Promise.all([
    prisma.booking.count({ where: { deletedAt: null } }),
    prisma.booking.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.booking.count({ where: { deletedAt: null, createdAt: { gte: last30Start } } }),
    prisma.booking.count({ where: { deletedAt: null, createdAt: { gte: prev30Start, lt: last30Start } } }),
    prisma.quote.count({ where: { deletedAt: null } }),
    prisma.quote.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.quote.count({ where: { deletedAt: null, status: "converted" } }),
    prisma.vehicle.count({ where: { deletedAt: null } }),
    prisma.vehicle.count({ where: { deletedAt: null, status: "published" } }),
    prisma.service.count({ where: { deletedAt: null } }),
    prisma.service.count({ where: { deletedAt: null, status: "published" } }),
    prisma.location.count({ where: { deletedAt: null } }),
    prisma.location.count({ where: { deletedAt: null, status: "published" } }),
    prisma.blogPost.count({ where: { deletedAt: null } }),
    prisma.blogPost.count({ where: { deletedAt: null, status: "published" } }),
    prisma.booking.groupBy({
      by: ["vehicleLabel"],
      where: { deletedAt: null },
      _count: { vehicleLabel: true },
      orderBy: { _count: { vehicleLabel: "desc" } },
      take: 5,
    }),
  ]);

  const bookingCountByStatus = new Map(bookingByStatusRaw.map((row) => [row.status, row._count._all]));
  const quoteCountByStatus = new Map(quoteByStatusRaw.map((row) => [row.status, row._count._all]));

  const trendPercent = bookingPrev30 === 0 ? null : Math.round(((bookingLast30 - bookingPrev30) / bookingPrev30) * 1000) / 10;
  const conversionRatePercent = quoteTotal === 0 ? 0 : Math.round((quoteConverted / quoteTotal) * 1000) / 10;

  return {
    success: true,
    data: {
      bookings: {
        total: bookingTotal,
        byStatus: BOOKING_STATUSES.map((status) => ({ status, count: bookingCountByStatus.get(status) ?? 0 })),
        last30Days: bookingLast30,
        prev30Days: bookingPrev30,
        trendPercent,
      },
      quotes: {
        total: quoteTotal,
        byStatus: QUOTE_STATUSES.map((status) => ({ status, count: quoteCountByStatus.get(status) ?? 0 })),
        conversionRatePercent,
      },
      fleet: { total: vehicleTotal, published: vehiclePublished, draft: vehicleTotal - vehiclePublished },
      content: {
        services: { total: servicesTotal, published: servicesPublished },
        locations: { total: locationsTotal, published: locationsPublished },
        blogPosts: { total: blogTotal, published: blogPublished },
      },
      topVehicles: topVehiclesRaw.map((row) => ({ name: row.vehicleLabel, bookingCount: row._count.vehicleLabel })),
      trafficAnalyticsAvailable: false,
    },
  };
}
