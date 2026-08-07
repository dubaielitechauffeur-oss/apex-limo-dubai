"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

/** URL-driven search box (?q=). Debounces navigation so the query string
 *  updates ~350ms after typing stops rather than on every keystroke, then
 *  resets pagination back to page 1 since the result set changes. */
export function SearchInput({
  paramName = "q",
  placeholder = "Search…",
}: {
  paramName?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(paramName) ?? "";

  // Local (typed-but-not-yet-navigated) value, reset from the URL whenever
  // it changes externally (back/forward nav, a filter dropdown clearing
  // `page`, etc.) — adjusted during render rather than in a `useEffect`,
  // per React's guidance for resetting state on a prop-like change without
  // an extra render pass.
  const [value, setValue] = useState(urlValue);
  const [lastUrlValue, setLastUrlValue] = useState(urlValue);
  if (urlValue !== lastUrlValue) {
    setLastUrlValue(urlValue);
    setValue(urlValue);
  }

  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(nextValue: string) {
    setValue(nextValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextValue) {
        params.set(paramName, nextValue);
      } else {
        params.delete(paramName);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 350);
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:w-64"
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" aria-hidden="true" />
      ) : null}
    </div>
  );
}
