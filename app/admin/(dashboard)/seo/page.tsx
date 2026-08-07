import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "SEO Manager — Admin" };

export default async function SeoPage() {
  await requirePermission(PERMISSIONS.SEO_READ);
  return <ModulePlaceholder title="SEO Manager" description="Manage meta titles, descriptions, and structured data." />;
}
