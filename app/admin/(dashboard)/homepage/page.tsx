import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Homepage — Admin" };

export default async function HomepagePage() {
  await requirePermission(PERMISSIONS.HOMEPAGE_READ);
  return <ModulePlaceholder title="Homepage" description="Manage homepage hero content and featured sections." />;
}
