"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { ImageOff, Search, Check } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { searchMediaForPicker, type MediaPickerResult } from "@/lib/cms/media-picker-actions";

/**
 * The ONLY way any CMS form selects an image — always an existing
 * `MediaItem`, never a new upload embedded in the form (Phase 7 brief:
 * "Do NOT add separate upload systems inside CMS forms"). Renders a
 * hidden `<input type="hidden" name={name}>` carrying the chosen media id,
 * so it drops into any `<form action={...}>` like a native field.
 */
export function MediaPickerField({
  name,
  label,
  initial,
  initialItems,
}: {
  name: string;
  label: string;
  initial: MediaPickerResult | null;
  initialItems: MediaPickerResult[];
}) {
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const results = await searchMediaForPicker(value);
        setItems(results);
      });
    }, 300);
  }

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <div className="mt-1.5 flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
          {selected ? (
            <div className="relative h-full w-full">
              <Image src={selected.url} alt={selected.alt} fill sizes="64px" className="object-cover" />
            </div>
          ) : (
            <ImageOff className="h-5 w-5 text-gray-300" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-gray-700">{selected ? selected.originalFilename : "No image selected"}</p>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-sm font-medium text-gray-900 underline hover:no-underline"
            >
              Choose from Library
            </button>
            {selected ? (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm font-medium text-red-600 underline hover:no-underline"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Choose from Media Library">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search media…"
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div className={`grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 ${isPending ? "opacity-50" : ""}`}>
          {items.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-gray-400">No media found.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelected(item);
                  setOpen(false);
                }}
                className={`group relative aspect-square overflow-hidden rounded-md border-2 ${
                  selected?.id === item.id ? "border-gray-900" : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image src={item.url} alt={item.alt} fill sizes="120px" className="object-cover" />
                {selected?.id === item.id ? (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
