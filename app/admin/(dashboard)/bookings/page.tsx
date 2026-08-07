import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Bookings — Admin" };

export default async function BookingsPage() {
  await requirePermission(PERMISSIONS.BOOKINGS_READ);
  return <ModulePlaceholder title="Bookings" description="Manage ride bookings, statuses, and driver assignments." />;
}
