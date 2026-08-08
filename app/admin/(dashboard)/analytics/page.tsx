import type { Metadata } from "next";
import { CalendarCheck, MessageSquareQuote, TrendingUp, TrendingDown, Minus, Car } from "lucide-react";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getAnalyticsOverview } from "@/lib/admin/analytics";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DashboardCard } from "@/components/admin/ui/DashboardCard";
import { StatusBreakdown } from "@/components/admin/analytics/StatusBreakdown";

export const metadata: Metadata = { title: "Analytics — Admin" };

export default async function AnalyticsPage() {
  await requirePermission(PERMISSIONS.ANALYTICS_READ);
  const result = await getAnalyticsOverview();

  if (!result.success) {
    return (
      <div>
        <PageHeader title="Analytics" />
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{result.error}</p>
      </div>
    );
  }

  const { bookings, quotes, fleet, content, topVehicles } = result.data;
  const TrendIcon = bookings.trendPercent === null || bookings.trendPercent === 0 ? Minus : bookings.trendPercent > 0 ? TrendingUp : TrendingDown;
  const trendLabel =
    bookings.trendPercent === null
      ? "No prior period to compare"
      : `${bookings.trendPercent > 0 ? "+" : ""}${bookings.trendPercent}% vs previous 30 days`;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Booking, quote, and content performance — pulled directly from the database. Website traffic analytics (sessions, page views) require Google Analytics API credentials this environment doesn't have; Google Analytics itself is already live site-wide via the tracking script in the root layout."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Bookings" value={bookings.total} icon={CalendarCheck} href="/admin/bookings" />
        <DashboardCard label="Total Quotes" value={quotes.total} icon={MessageSquareQuote} href="/admin/quotes" />
        <DashboardCard label="Quote → Booking Conversion" value={`${quotes.conversionRatePercent}%`} icon={TrendingUp} />
        <DashboardCard label="Bookings, Last 30 Days" value={bookings.last30Days} icon={TrendIcon} />
      </div>

      <p className="mt-2 text-xs text-gray-500">{trendLabel}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusBreakdown title="Bookings by Status" rows={bookings.byStatus} />
        <StatusBreakdown title="Quotes by Status" rows={quotes.byStatus} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Most Booked Vehicles</h2>
          <ul className="mt-4 space-y-2">
            {topVehicles.length === 0 ? (
              <p className="text-sm text-gray-400">No bookings yet.</p>
            ) : (
              topVehicles.map((vehicle, index) => (
                <li key={vehicle.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                      {index + 1}
                    </span>
                    {vehicle.name}
                  </span>
                  <span className="tabular-nums text-gray-500">{vehicle.bookingCount} bookings</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Content Overview</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-700">
                <Car className="h-4 w-4 text-gray-400" aria-hidden="true" />
                Vehicles
              </span>
              <span className="tabular-nums text-gray-500">
                {fleet.published} published <span className="text-gray-300">/</span> {fleet.draft} draft
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Services</span>
              <span className="tabular-nums text-gray-500">
                {content.services.published} <span className="text-gray-300">/</span> {content.services.total}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Locations</span>
              <span className="tabular-nums text-gray-500">
                {content.locations.published} <span className="text-gray-300">/</span> {content.locations.total}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-gray-700">Blog Posts</span>
              <span className="tabular-nums text-gray-500">
                {content.blogPosts.published} <span className="text-gray-300">/</span> {content.blogPosts.total}
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-gray-400">Published / total.</p>
        </div>
      </div>
    </div>
  );
}
