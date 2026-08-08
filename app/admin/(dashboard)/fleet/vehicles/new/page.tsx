import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listVehicleCategories } from "@/lib/cms/fleet";
import { getInitialMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { VehicleForm } from "@/components/admin/cms/VehicleForm";

export const metadata: Metadata = { title: "New Vehicle — Admin" };

export default async function NewVehiclePage() {
  await requirePermission(PERMISSIONS.FLEET_CREATE);
  const [categoriesResult, mediaLibraryItems] = await Promise.all([listVehicleCategories(), getInitialMediaPickerItems()]);

  if (!categoriesResult.success) {
    return (
      <div>
        <PageHeader title="New Vehicle" breadcrumbs={[{ label: "Vehicles", href: "/admin/fleet/vehicles" }, { label: "New" }]} />
        <ErrorState description={categoriesResult.error} />
      </div>
    );
  }

  if (categoriesResult.data.length === 0) {
    return (
      <div>
        <PageHeader title="New Vehicle" breadcrumbs={[{ label: "Vehicles", href: "/admin/fleet/vehicles" }, { label: "New" }]} />
        <ErrorState title="No categories yet" description="Create at least one vehicle category before adding a vehicle." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="New Vehicle" breadcrumbs={[{ label: "Vehicles", href: "/admin/fleet/vehicles" }, { label: "New" }]} />
      <VehicleForm vehicle={null} categories={categoriesResult.data} mediaLibraryItems={mediaLibraryItems} />
    </div>
  );
}
