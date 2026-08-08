import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listVehicles, listVehicleCategories } from "@/lib/cms/fleet";
import { PageHeader } from "@/components/admin/ui/PageHeader";

export const metadata: Metadata = { title: "Fleet — Admin" };

export default async function FleetOverviewPage() {
  await requirePermission(PERMISSIONS.FLEET_READ);
  const [vehiclesResult, categoriesResult] = await Promise.all([listVehicles({ pageSize: 1 }), listVehicleCategories()]);

  const vehicleCount = vehiclesResult.success ? vehiclesResult.data.total : 0;
  const categoryCount = categoriesResult.success ? categoriesResult.data.length : 0;

  return (
    <div>
      <PageHeader title="Fleet" subtitle="Manage vehicles and vehicle categories." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/fleet/vehicles" className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300">
          <p className="text-3xl font-semibold text-gray-900">{vehicleCount}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Vehicles</p>
          <p className="mt-1 text-xs text-gray-500">Create, edit, publish, and organize individual vehicles.</p>
        </Link>
        <Link href="/admin/fleet/categories" className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300">
          <p className="text-3xl font-semibold text-gray-900">{categoryCount}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Categories</p>
          <p className="mt-1 text-xs text-gray-500">Sedan, SUV, Van, Ultra-Luxury, and any others you add.</p>
        </Link>
      </div>
    </div>
  );
}
