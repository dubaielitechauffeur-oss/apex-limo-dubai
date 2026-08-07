import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Locations — Admin" };

export default async function LocationsPage() {
  await requirePermission(PERMISSIONS.LOCATIONS_READ);
  return <ModulePlaceholder title="Locations" description="Manage service area and location pages." />;
}
