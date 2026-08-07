"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { useToast } from "@/components/admin/ui/Toast";
import { createFaqCategoryAction, updateFaqCategoryAction, deleteFaqCategoryAction } from "@/app/admin/(dashboard)/faq/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import type { FaqCategoryItem } from "@/lib/cms/faq";
import { emptyLocalizedText } from "@/lib/cms/localized";

const initialState: CmsActionState = {};

export function FaqCategoryManager({ categories }: { categories: FaqCategoryItem[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<FaqCategoryItem | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Categories</h2>
        <button type="button" onClick={() => setCreateOpen(true)} aria-label="New category" className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <ul className="mt-2 space-y-1">
        {categories.map((cat) => (
          <li key={cat.id} className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50">
            <span className="truncate text-gray-700">
              {cat.name.en || cat.key} <span className="text-xs text-gray-400">({cat.faqCount})</span>
            </span>
            <span className="hidden items-center gap-1 group-hover:flex">
              <button type="button" onClick={() => setEditing(cat)} aria-label={`Edit ${cat.key}`} className="text-gray-400 hover:text-gray-700">
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <ConfirmDialog
                trigger={(open) => (
                  <button type="button" onClick={open} aria-label={`Delete ${cat.key}`} className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
                title={`Delete "${cat.name.en || cat.key}"?`}
                description={cat.faqCount > 0 ? `${cat.faqCount} FAQ(s) currently use this category — they'll become uncategorized, not deleted.` : "This category isn't used by any FAQ."}
                confirmLabel="Delete"
                tone="danger"
                onConfirm={async () => {
                  const result = await deleteFaqCategoryAction(cat.id);
                  if (!result.success) showToast(result.error ?? "Could not delete.", "error");
                  else {
                    showToast(result.success ?? "Deleted.", "success");
                    router.refresh();
                  }
                }}
              />
            </span>
          </li>
        ))}
      </ul>

      <CategoryFormModal open={createOpen} onClose={() => setCreateOpen(false)} category={null} />
      {editing ? <CategoryFormModal open onClose={() => setEditing(null)} category={editing} /> : null}
    </div>
  );
}

function CategoryFormModal({ open, onClose, category }: { open: boolean; onClose: () => void; category: FaqCategoryItem | null }) {
  const action = category ? updateFaqCategoryAction : createFaqCategoryAction;
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
        <FormField id="key" label="Key" required hint="Lowercase letters, numbers, hyphens — used internally.">
          <input id="key" name="key" required defaultValue={category?.key} className={`${ADMIN_INPUT_CLASSES} font-mono text-xs`} />
        </FormField>
        <LocalizedField prefix="name" label="Name" value={category?.name ?? emptyLocalizedText()} required />
        <FormField id="sortOrder" label="Sort order">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="showChip" defaultChecked={category?.showChip ?? true} className="h-4 w-4 rounded border-gray-300" />
          Show as a filter chip on the public FAQ page
        </label>
        <button type="submit" disabled={isPending} className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
          {isPending ? "Saving…" : category ? "Save changes" : "Create category"}
        </button>
      </form>
    </Modal>
  );
}
