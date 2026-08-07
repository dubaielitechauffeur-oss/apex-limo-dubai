"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, Plus, ImageOff } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { MediaPickerField } from "@/components/admin/cms/MediaPickerField";
import { useToast } from "@/components/admin/ui/Toast";
import { createBrandAction, updateBrandAction, deleteBrandAction } from "@/app/admin/(dashboard)/homepage/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import type { BrandItem } from "@/lib/cms/homepage";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";

const initialState: CmsActionState = {};

export function BrandManager({ brands, mediaLibraryItems }: { brands: BrandItem[]; mediaLibraryItems: MediaPickerResult[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BrandItem | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Brands</h2>
        <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New brand
        </button>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {brands.length === 0 ? <p className="col-span-full py-4 text-sm text-gray-400">No brands yet.</p> : null}
        {brands.map((brand) => {
          const logo = mediaLibraryItems.find((m) => m.id === brand.logoId);
          return (
            <li key={brand.id} className="group relative flex flex-col items-center gap-2 rounded-md border border-gray-100 p-3">
              <div className="flex h-10 w-full items-center justify-center">
                {logo ? <Image src={logo.url} alt={brand.name} width={80} height={40} className="max-h-10 w-auto object-contain" /> : <ImageOff className="h-5 w-5 text-gray-300" aria-hidden="true" />}
              </div>
              <p className="truncate text-xs text-gray-600">{brand.name}</p>
              <div className="absolute right-1 top-1 hidden items-center gap-1 rounded bg-white/90 p-0.5 group-hover:flex">
                <button type="button" onClick={() => setEditing(brand)} aria-label="Edit" className="text-gray-400 hover:text-gray-700">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <ConfirmDialog
                  trigger={(open) => (
                    <button type="button" onClick={open} aria-label="Delete" className="text-gray-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                  title={`Delete "${brand.name}"?`}
                  description="This permanently removes the brand. This cannot be undone."
                  confirmLabel="Delete"
                  tone="danger"
                  onConfirm={async () => {
                    const result = await deleteBrandAction(brand.id);
                    if (!result.success) showToast(result.error ?? "Could not delete.", "error");
                    else {
                      showToast(result.success ?? "Deleted.", "success");
                      router.refresh();
                    }
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <BrandFormModal open={createOpen} onClose={() => setCreateOpen(false)} brand={null} mediaLibraryItems={mediaLibraryItems} />
      {editing ? <BrandFormModal open onClose={() => setEditing(null)} brand={editing} mediaLibraryItems={mediaLibraryItems} /> : null}
    </section>
  );
}

function BrandFormModal({ open, onClose, brand, mediaLibraryItems }: { open: boolean; onClose: () => void; brand: BrandItem | null; mediaLibraryItems: MediaPickerResult[] }) {
  const action = brand ? updateBrandAction : createBrandAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast(state.success, "success");
      router.refresh();
      onClose();
    } else if (state.error) {
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const logo = brand?.logoId ? (mediaLibraryItems.find((m) => m.id === brand.logoId) ?? null) : null;

  return (
    <Modal open={open} onClose={onClose} title={brand ? "Edit brand" : "New brand"}>
      <form action={formAction} className="space-y-4">
        {brand ? <input type="hidden" name="id" value={brand.id} /> : null}
        <FormField id="name" label="Name" required>
          <input id="name" name="name" required defaultValue={brand?.name} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <MediaPickerField name="logoId" label="Logo" initial={logo} initialItems={mediaLibraryItems} />
        <FormField id="sortOrder" label="Sort order">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={brand?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <button type="submit" disabled={isPending} className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
          {isPending ? "Saving…" : brand ? "Save changes" : "Create brand"}
        </button>
      </form>
    </Modal>
  );
}
