"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface FilterOption {
  label: string;
  value: string;
}

/** URL-driven `<select>` filter (?<paramName>=value). Kept as a plain
 *  native select rather than a custom listbox — cheapest way to get full
 *  keyboard/mobile support without a new dependency. */
export function FilterDropdown({
  paramName,
  label,
  options,
  allLabel = "All",
}: {
  paramName: string;
  label: string;
  options: FilterOption[];
  allLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? "";

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue) {
      params.set(paramName, nextValue);
    } else {
      params.delete(paramName);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span className="sr-only">{label}</span>
      <select
        value={current}
        onChange={(event) => handleChange(event.target.value)}
        className="h-9 rounded-md border border-gray-300 bg-white px-2.5 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
