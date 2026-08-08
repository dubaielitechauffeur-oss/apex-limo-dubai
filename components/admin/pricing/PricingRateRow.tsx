"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ui/Toast";
import { PublishStatusBadge } from "@/components/admin/cms/PublishStatusControls";
import type { VehiclePricingItem, VehicleRatesInput } from "@/lib/cms/fleet";
import type { CmsActionState } from "@/app/admin/(dashboard)/pricing/actions";

const RATE_FIELDS: { key: keyof VehicleRatesInput; label: string }[] = [
  { key: "oneHour", label: "1 Hour" },
  { key: "fiveHours", label: "5 Hours" },
  { key: "tenHours", label: "10 Hours" },
  { key: "airport", label: "Airport" },
  { key: "extraHour", label: "Extra Hr" },
  { key: "additionalCity", label: "+City" },
];

const INPUT_CLASSES =
  "w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500";

export function PricingRateRow({
  vehicle,
  onUpdate,
}: {
  vehicle: VehiclePricingItem;
  /** Pass a bound Server Action reference (e.g.
   *  `updateVehicleRatesAction.bind(null, vehicle.id)`) — see
   *  StatusTransitionControl.tsx for why this must be bound, not an inline
   *  closure, when crossing the Server → Client Component boundary. */
  onUpdate: (rates: VehicleRatesInput) => Promise<CmsActionState>;
}) {
  const [rates, setRates] = useState<VehicleRatesInput>(vehicle.rates);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const dirty = RATE_FIELDS.some((f) => rates[f.key] !== vehicle.rates[f.key]);

  function handleChange(key: keyof VehicleRatesInput, value: string) {
    setRates((prev) => ({ ...prev, [key]: value === "" ? 0 : Number(value) }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await onUpdate(rates);
      if (!result.success) {
        showToast(result.error ?? "Something went wrong.", "error");
      } else {
        showToast(result.success ?? "Rates updated.", "success");
        router.refresh();
      }
    });
  }

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="ps-5 pe-4 py-3">
        <p className="text-sm font-medium text-gray-900">{vehicle.name}</p>
        <p className="text-xs text-gray-500">{vehicle.categoryName}</p>
      </td>
      <td className="pe-4 py-3">
        <PublishStatusBadge status={vehicle.status} />
      </td>
      {RATE_FIELDS.map((field) => (
        <td key={field.key} className="pe-3 py-3">
          <input
            type="number"
            min={0}
            step={1}
            value={rates[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            disabled={isPending}
            aria-label={`${vehicle.name} — ${field.label} (AED)`}
            className={INPUT_CLASSES}
          />
        </td>
      ))}
      <td className="pe-5 py-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !dirty}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </td>
    </tr>
  );
}
