"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { SlugField } from "@/components/admin/cms/SlugField";
import { useToast } from "@/components/admin/ui/Toast";
import { createVehicleCategoryAction, updateVehicleCategoryAction, deleteVehicleCategoryAction } from "@/app/admin/(dashboard)/fleet/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import type { VehicleCategoryItem } from "@/lib/cms/fleet";
import { emptyLocalizedText } from "@/lib/cms/localized";

const initialState: CmsActionState = {};

export function VehicleCategoryManager({ categories }: { categories: VehicleCategoryItem[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleCategoryItem | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Vehicle Categories</h2>
        <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New category
        </button>
      </div>

      <ul className="mt-4 divide-y divide-gray-100">
        {categories.length === 0 ? <li className="py-4 text-sm text-gray-400">No categories yet.</li> : null}
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {cat.name.en || cat.slug} <span className="text-xs font-normal text-gray-400">({cat.vehicleCount} vehicle{cat.vehicleCount === 1 ? "" : "s"})</span>
              </p>
              <code className="font-mono text-xs text-gray-500">{cat.slug}</code>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => setEditing(cat)} aria-label="Edit" className="text-gray-400 hover:text-gray-700">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <ConfirmDialog
                trigger={(open) => (
                  <button type="button" onClick={open} aria-label="Delete" className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                title={`Delete "${cat.name.en || cat.slug}"?`}
                description={cat.vehicleCount > 0 ? `${cat.vehicleCount} vehicle(s) currently use this category — reassign or delete them first.` : "This category isn't used by any vehicle."}
                confirmLabel="Delete"
                tone="danger"
                onConfirm={async () => {
                  const result = await deleteVehicleCategoryAction(cat.id);
                  if (!result.success) showToast(result.error ?? "Could not delete.", "error");
                  else {
                    showToast(result.success ?? "Deleted.", "success");
                    router.refresh();
                  }
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <CategoryFormModal open={createOpen} onClose={() => setCreateOpen(false)} category={null} />
      {editing ? <CategoryFormModal open onClose={() => setEditing(null)} category={editing} /> : null}
    </div>
  );
}

function CategoryFormModal({ open, onClose, category }: { open: boolean; onClose: () => void; category: VehicleCategoryItem | null }) {
  const action = category ? updateVehicleCategoryAction : createVehicleCategoryAction;
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

  return (
    <Modal open={open} onClose={onClose} title={category ? "Edit category" : "New category"}>
      <form action={formAction} className="space-y-4">
        {category ? <input type="hidden" name="id" value={category.id} /> : null}
        <LocalizedField prefix="name" label="Name" value={category?.name ?? emptyLocalizedText()} required />
        <SlugField defaultValue={category?.slug} sourceFieldId="name_en" />
        <LocalizedField prefix="description" label="Description" value={category?.description ?? emptyLocalizedText()} multiline />
        <FormField id="sortOrder" label="Sort order">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <button type="submit" disabled={isPending} className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
          {isPending ? "Saving…" : category ? "Save changes" : "Create category"}
        </button>
      </form>
    </Modal>
  );
}
