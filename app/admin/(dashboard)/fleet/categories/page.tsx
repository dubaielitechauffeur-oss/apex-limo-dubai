import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listVehicleCategories } from "@/lib/cms/fleet";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { VehicleCategoryManager } from "@/components/admin/cms/VehicleCategoryManager";

export const metadata: Metadata = { title: "Vehicle Categories — Admin" };

export default async function VehicleCategoriesPage() {
  await requirePermission(PERMISSIONS.FLEET_READ);
  const result = await listVehicleCategories();

  return (
    <div>
      <PageHeader title="Vehicle Categories" subtitle="Organize the fleet into browsable categories." />
      {result.success ? <VehicleCategoryManager categories={result.data} /> : <ErrorState description={result.error} />}
    </div>
  );
}
