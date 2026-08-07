import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Vehicle Categories — Admin" };

export default async function VehicleCategoriesPage() {
  await requirePermission(PERMISSIONS.FLEET_READ);
  return <ModulePlaceholder title="Vehicle Categories" description="Organize the fleet into browsable categories." />;
}
