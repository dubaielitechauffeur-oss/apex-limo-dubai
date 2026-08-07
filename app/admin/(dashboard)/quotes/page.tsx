import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Quotes — Admin" };

export default async function QuotesPage() {
  await requirePermission(PERMISSIONS.QUOTES_READ);
  return <ModulePlaceholder title="Quotes" description="Review, price, and convert customer quote requests." />;
}
