import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listVehicleRates } from "@/lib/cms/fleet";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { PricingRateRow } from "@/components/admin/pricing/PricingRateRow";
import { updateVehicleRatesAction } from "./actions";

export const metadata: Metadata = { title: "Pricing — Admin" };

export default async function PricingPage() {
  await requirePermission(PERMISSIONS.PRICING_READ);
  const result = await listVehicleRates();
  const vehicles = result.success ? result.data : [];

  return (
    <div>
      <PageHeader
        title="Pricing"
        subtitle="Chauffeur rates (AED) per vehicle, per package — the same duration grid shown on each vehicle's Fleet page and detail page. Never displayed publicly; confirmed pricing is always quoted per-trip on WhatsApp or a quote request."
      />

      {!result.success ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{result.error}</p>
      ) : vehicles.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
          No vehicles yet — add one under Fleet first.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="ps-5 pe-4 py-3 text-start">Vehicle</th>
                <th className="pe-4 py-3 text-start">Status</th>
                <th className="pe-3 py-3 text-start">1 Hour</th>
                <th className="pe-3 py-3 text-start">5 Hours</th>
                <th className="pe-3 py-3 text-start">10 Hours</th>
                <th className="pe-3 py-3 text-start">Airport</th>
                <th className="pe-3 py-3 text-start">Extra Hr</th>
                <th className="pe-3 py-3 text-start">+City</th>
                <th className="pe-5 py-3 text-start" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <PricingRateRow key={vehicle.id} vehicle={vehicle} onUpdate={updateVehicleRatesAction.bind(null, vehicle.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
