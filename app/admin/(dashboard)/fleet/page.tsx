import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Fleet — Admin" };

export default async function FleetPage() {
  await requirePermission(PERMISSIONS.FLEET_READ);
  return <ModulePlaceholder title="Fleet" description="Manage vehicles and vehicle categories." />;
}
