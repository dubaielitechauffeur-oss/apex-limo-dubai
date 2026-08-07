import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ModulePlaceholder } from "@/components/admin/ui/ModulePlaceholder";

export const metadata: Metadata = { title: "Pricing — Admin" };

export default async function PricingPage() {
  await requirePermission(PERMISSIONS.PRICING_READ);
  return <ModulePlaceholder title="Pricing" description="Manage vehicle rates and pricing rules." />;
}
