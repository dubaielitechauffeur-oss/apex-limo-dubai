import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getInitialMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ServiceForm } from "@/components/admin/cms/ServiceForm";

export const metadata: Metadata = { title: "New Service — Admin" };

export default async function NewServicePage() {
  await requirePermission(PERMISSIONS.SERVICES_CREATE);
  const mediaLibraryItems = await getInitialMediaPickerItems();

  return (
    <div>
      <PageHeader title="New Service" breadcrumbs={[{ label: "Services", href: "/admin/services" }, { label: "New" }]} />
      <ServiceForm service={null} mediaLibraryItems={mediaLibraryItems} />
    </div>
  );
}
