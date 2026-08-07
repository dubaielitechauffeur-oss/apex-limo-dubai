"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(param: "from" | "to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <input
        type="date"
        aria-label="From date"
        defaultValue={searchParams.get("from") ?? ""}
        onChange={(event) => update("from", event.target.value)}
        className="h-9 rounded-md border border-gray-300 bg-white px-2.5 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />
      <span className="text-gray-400">to</span>
      <input
        type="date"
        aria-label="To date"
        defaultValue={searchParams.get("to") ?? ""}
        onChange={(event) => update("to", event.target.value)}
        className="h-9 rounded-md border border-gray-300 bg-white px-2.5 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />
    </div>
  );
}
