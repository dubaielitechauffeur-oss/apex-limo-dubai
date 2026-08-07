import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Services — Admin" };

export default async function ServicesPage() {
  await requirePermission(PERMISSIONS.SERVICES_READ);
  return <ModulePlaceholder title="Services" description="Manage the chauffeur service catalog." />;
}
