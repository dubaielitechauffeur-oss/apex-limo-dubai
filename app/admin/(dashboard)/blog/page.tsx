import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Blog — Admin" };

export default async function BlogPage() {
  await requirePermission(PERMISSIONS.BLOG_READ);
  return <ModulePlaceholder title="Blog" description="Write and publish blog posts." />;
}
