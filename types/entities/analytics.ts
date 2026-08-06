import type { Timestamps } from "@/types/common";

export type AnalyticsEventType =
  | "page_view"
  | "booking_created"
  | "quote_requested"
  | "contact_submitted"
  | "vehicle_viewed"
  | "cta_clicked"
  | "form_started"
  | "form_abandoned";

export interface AnalyticsEvent extends Timestamps {
  id: string;
  type: AnalyticsEventType;
  metadata: Record<string, unknown>;
  userId: string | null;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
}

export type MetricPeriod = "day" | "week" | "month" | "quarter" | "year";

export interface DashboardMetric {
  key: string;
  label: string;
  value: number;
  previousValue: number | null;
  changePercent: number | null;
  period: MetricPeriod;
}

export interface DashboardSummary {
  totalBookings: DashboardMetric;
  totalQuotes: DashboardMetric;
  totalRevenue: DashboardMetric;
  conversionRate: DashboardMetric;
  topVehicles: Array<{ vehicleId: string; bookingCount: number }>;
  topServices: Array<{ serviceId: string; bookingCount: number }>;
  recentActivity: AnalyticsEvent[];
}
