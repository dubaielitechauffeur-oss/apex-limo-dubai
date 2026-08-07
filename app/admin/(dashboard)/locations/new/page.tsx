import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getInitialMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LocationForm } from "@/components/admin/cms/LocationForm";

export const metadata: Metadata = { title: "New Location — Admin" };

export default async function NewLocationPage() {
  await requirePermission(PERMISSIONS.LOCATIONS_CREATE);
  const mediaLibraryItems = await getInitialMediaPickerItems();

  return (
    <div>
      <PageHeader title="New Location" breadcrumbs={[{ label: "Locations", href: "/admin/locations" }, { label: "New" }]} />
      <LocationForm location={null} mediaLibraryItems={mediaLibraryItems} />
    </div>
  );
}
