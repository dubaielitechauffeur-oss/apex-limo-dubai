import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Media Library — Admin" };

export default async function MediaPage() {
  await requirePermission(PERMISSIONS.MEDIA_READ);
  return <ModulePlaceholder title="Media Library" description="Upload and organize images and documents." />;
}
