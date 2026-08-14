"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { ImageOff, Search, Check, ArrowLeft, ArrowRight, Trash2, Upload } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";
import { searchMediaForPicker, uploadMediaForPicker, type MediaPickerResult } from "@/lib/cms/media-picker-actions";

/**
 * Multi-image counterpart to `MediaPickerField` — same "choose from
 * library" modal, but accumulates an ordered list instead of one item.
 * Index 0 is always the primary/hero image (matches data/fleet.ts's
 * documented convention: "Index 0 is always the primary/hero image").
 * Submits as repeated `<input name="imageIds">` so the server action reads
 * it with `formData.getAll("imageIds")`, same convention as blog tagIds.
 */
export function VehicleImagesManager({
  name,
  mobileName = "mobileImageIds",
  initial,
  initialMobiles = [],
  initialItems,
}: {
  name: string;
  mobileName?: string;
  initial: MediaPickerResult[];
  /** Aligned with `initial` by index — null when a slot has no mobile
   *  variant, so desktop is used at every viewport (backwards-compat). */
  initialMobiles?: (MediaPickerResult | null)[];
  initialItems: MediaPickerResult[];
}) {
  const [selected, setSelected] = useState<MediaPickerResult[]>(initial);
  const [mobileSelected, setMobileSelected] = useState<(MediaPickerResult | null)[]>(() => {
    const seed = [...initialMobiles];
    while (seed.length < initial.length) seed.push(null);
    return seed.slice(0, initial.length);
  });
  const [open, setOpen] = useState(false);
  const [mobilePickerFor, setMobilePickerFor] = useState<number | null>(null);
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMediaForPicker(formData);
      if (!result.success) {
        showToast(`${file.name}: ${result.error}`, "error");
        continue;
      }
      setItems((prev) => [result.data, ...prev.filter((i) => i.id !== result.data.id)]);
      setSelected((prev) => (prev.some((i) => i.id === result.data.id) ? prev : [...prev, result.data]));
      uploaded++;
    }
    setUploading(false);
    if (event.target) event.target.value = "";
    if (uploaded > 0) showToast(`Uploaded ${uploaded} image${uploaded === 1 ? "" : "s"} and added to gallery.`, "success");
  }

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

  function addImage(item: MediaPickerResult) {
    setSelected((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
    setMobileSelected((prev) => [...prev, null]);
  }

  function removeImage(id: string) {
    setSelected((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      if (index < 0) return prev;
      setMobileSelected((m) => m.filter((_, i) => i !== index));
      return prev.filter((_, i) => i !== index);
    });
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      setMobileSelected((m) => {
        const nextM = [...m];
        [nextM[index], nextM[target]] = [nextM[target], nextM[index]];
        return nextM;
      });
      return next;
    });
  }

  function setMobileAt(index: number, item: MediaPickerResult | null) {
    setMobileSelected((prev) => {
      const next = [...prev];
      next[index] = item;
      return next;
    });
  }

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">Gallery images</span>
      <p className="mt-0.5 text-xs text-gray-500">First image is the primary/hero. Each slot has an optional mobile variant — leave blank to use desktop on all viewports.</p>
      {selected.map((item, idx) => (
        <span key={`${item.id}-${idx}`}>
          <input type="hidden" name={name} value={item.id} />
          <input type="hidden" name={mobileName} value={mobileSelected[idx]?.id ?? ""} />
        </span>
      ))}

      <ul className="mt-2 space-y-2">
        {selected.length === 0 ? (
          <li className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">No images selected.</li>
        ) : null}
        {selected.map((item, index) => {
          const mobileItem = mobileSelected[index] ?? null;
          return (
            <li key={`${item.id}-${index}`} className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-2">
              <div className="flex items-center gap-2">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50" title="Desktop">
                  <Image src={item.url} alt={item.alt} fill sizes="56px" className="object-cover" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                {mobileItem ? (
                  <>
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50" title="Mobile">
                      <Image src={mobileItem.url} alt={mobileItem.alt} fill sizes="56px" className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileAt(index, null)}
                      className="text-xs font-medium text-red-600 underline hover:no-underline"
                    >
                      Clear mobile
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMobilePickerFor(index)}
                    className="rounded-md border border-dashed border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    + Mobile variant
                  </button>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-700">{item.originalFilename}</p>
                {index === 0 ? <span className="text-xs font-medium text-gray-500">Primary image</span> : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move earlier" className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" disabled={index === selected.length - 1} onClick={() => move(index, 1)} aria-label="Move later" className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => removeImage(item.id)} aria-label="Remove image" className="rounded p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add from Library
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {uploading ? "Uploading…" : "Upload from device"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Choose from Media Library">
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search media…"
              className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        <div className={`grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 ${isPending ? "opacity-50" : ""}`}>
          {items.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-gray-400">No media found.</p>
          ) : (
            items.map((item) => {
              const isSelected = selected.some((i) => i.id === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (isSelected ? removeImage(item.id) : addImage(item))}
                  className={`group relative aspect-square overflow-hidden rounded-md border-2 ${
                    isSelected ? "border-gray-900" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image src={item.url} alt={item.alt} fill sizes="120px" className="object-cover" />
                  {isSelected ? (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </Modal>

      <Modal open={mobilePickerFor !== null} onClose={() => setMobilePickerFor(null)} title="Pick a mobile variant">
        <p className="mb-3 text-xs text-gray-500">
          Choose a mobile-optimised image for this slot — shown below the tablet breakpoint on the public detail page.
          Leave the slot empty (Cancel) to keep using the desktop image everywhere.
        </p>
        <div className={`grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 ${isPending ? "opacity-50" : ""}`}>
          {items.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-gray-400">No media found.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (mobilePickerFor !== null) setMobileAt(mobilePickerFor, item);
                  setMobilePickerFor(null);
                }}
                className="group relative aspect-square overflow-hidden rounded-md border-2 border-transparent hover:border-gray-300"
              >
                <Image src={item.url} alt={item.alt} fill sizes="120px" className="object-cover" />
              </button>
            ))
          )}
        </div>
      </Modal>

      {selected.length === 0 ? (
        <span className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          <ImageOff className="h-3.5 w-3.5" aria-hidden="true" /> No image selected yet.
        </span>
      ) : null}
    </div>
  );
}
