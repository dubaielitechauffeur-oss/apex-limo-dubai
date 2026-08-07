import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Analytics — Admin" };

export default async function AnalyticsPage() {
  await requirePermission(PERMISSIONS.ANALYTICS_READ);
  return <ModulePlaceholder title="Analytics" description="Traffic, conversion, and business performance dashboards." />;
}
