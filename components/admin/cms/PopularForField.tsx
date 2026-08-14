"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

export interface PopularForOption {
  id: string;
  label: string;
}

export interface PopularForRow {
  serviceId: string | null;
  locationId: string | null;
}

/**
 * Up to 4 "Popular for [Service] in [Location]" pairs per vehicle.
 * Each row picks one service (or none) + one location (or none) from
 * the given admin lists. Empty rows are dropped server-side (see the
 * vehicle action's popularFor parser), so an admin can also just add
 * a service without a location and vice-versa. Submits as parallel
 * arrays: name="popularFor_serviceId" + name="popularFor_locationId".
 */
export function PopularForField({
  initial,
  services,
  locations,
  maxRows = 4,
}: {
  initial: PopularForRow[];
  services: PopularForOption[];
  locations: PopularForOption[];
  maxRows?: number;
}) {
  const [rows, setRows] = useState<PopularForRow[]>(() => {
    const seed = initial.length > 0 ? initial.slice(0, maxRows) : [{ serviceId: "", locationId: "" }];
    return seed.map((r) => ({ serviceId: r.serviceId ?? "", locationId: r.locationId ?? "" }));
  });

  function addRow() {
    if (rows.length >= maxRows) return;
    setRows((prev) => [...prev, { serviceId: "", locationId: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? [{ serviceId: "", locationId: "" }] : prev.filter((_, i) => i !== index)));
  }

  function update(index: number, field: "serviceId" | "locationId", value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">Popular for</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        Up to {maxRows} pairs. Renders on the public detail page as clickable chips like
        &ldquo;Popular for <span className="underline">Event Transportation</span> in{" "}
        <span className="underline">Downtown Dubai</span>.&rdquo; Leave either dropdown blank to skip that half.
      </p>

      <div className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2">
            <select
              name="popularFor_serviceId"
              value={row.serviceId ?? ""}
              onChange={(e) => update(index, "serviceId", e.target.value)}
              className="h-9 flex-1 min-w-[160px] rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900"
            >
              <option value="">— Service —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <span className="text-xs text-gray-500">in</span>
            <select
              name="popularFor_locationId"
              value={row.locationId ?? ""}
              onChange={(e) => update(index, "locationId", e.target.value)}
              className="h-9 flex-1 min-w-[160px] rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900"
            >
              <option value="">— Location —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeRow(index)}
              aria-label="Remove row"
              className="rounded p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {rows.length < maxRows ? (
        <button
          type="button"
          onClick={addRow}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add pair
        </button>
      ) : null}
    </div>
  );
}
