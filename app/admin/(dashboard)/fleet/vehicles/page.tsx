import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Vehicles — Admin" };

export default async function VehiclesPage() {
  await requirePermission(PERMISSIONS.FLEET_READ);
  return <ModulePlaceholder title="Vehicles" description="Manage individual vehicles, pricing, and imagery." />;
}
