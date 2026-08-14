"use client";

import { useState } from "react";

/**
 * Curated amenity catalog — the checkboxes rendered under "Amenities"
 * on the vehicle form. Each key ends up in `vehicles.amenities` JSONB
 * and is rendered as an icon chip on the public detail page.
 * Adding a new amenity: append here + add its label to the public
 * renderer's label map. No schema change needed.
 */
export const AMENITY_CATALOG: { key: string; label: string }[] = [
  { key: "wifi", label: "Onboard Wi-Fi" },
  { key: "water", label: "Complimentary water" },
  { key: "refreshments", label: "Refreshments" },
  { key: "phone-charger", label: "Phone chargers (USB-C + Lightning)" },
  { key: "privacy-glass", label: "Privacy glass / tinted windows" },
  { key: "child-seat", label: "Child seat available" },
  { key: "wheelchair-accessible", label: "Wheelchair accessible" },
  { key: "leather-seats", label: "Full nappa leather" },
  { key: "panoramic-roof", label: "Panoramic roof" },
  { key: "business-tables", label: "Business tables" },
  { key: "reading-lights", label: "Individual reading lights" },
  { key: "climate-zones", label: "Multi-zone climate control" },
  { key: "ambient-lighting", label: "Ambient lighting" },
  { key: "reclining-seats", label: "Reclining rear seats" },
  { key: "large-luggage", label: "Extra-large luggage capacity" },
  { key: "champagne-service", label: "Champagne service on request" },
  { key: "bottled-mineral-water", label: "Chilled bottled mineral water" },
];

/**
 * Checkbox grid submitted as repeated `name="amenity"` values. The
 * server action reads `formData.getAll("amenity")` and stores it as a
 * plain string[] in the `amenities` JSONB column.
 */
export function AmenitiesField({ initial }: { initial: string[] }) {
  const [selected, setSelected] = useState(new Set(initial));

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">Amenities</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        Tick every amenity available on this vehicle. Shown as icon chips on the public detail page.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {AMENITY_CATALOG.map((amenity) => {
          const checked = selected.has(amenity.key);
          return (
            <label
              key={amenity.key}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                checked ? "border-gray-900 bg-gray-50 text-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                name="amenity"
                value={amenity.key}
                checked={checked}
                onChange={() => toggle(amenity.key)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span>{amenity.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
