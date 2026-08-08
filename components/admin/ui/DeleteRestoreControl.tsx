"use client";

import { useRouter } from "next/navigation";
import { Trash2, RotateCcw } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

/** Soft-delete/restore action pair for entities with no publish/draft
 *  workflow (Booking, Quote) — same interaction shape as `PublishActions`'
 *  delete/restore half, without the publish/archive states that don't
 *  apply here. */
export function DeleteRestoreControl({
  isDeleted,
  listHref,
  deleteTitle,
  deleteDescription,
  onDelete,
  onRestore,
}: {
  isDeleted: boolean;
  listHref: string;
  deleteTitle: string;
  deleteDescription: string;
  onDelete: () => Promise<CmsActionState>;
  onRestore: () => Promise<CmsActionState>;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  if (isDeleted) {
    return (
      <button
        type="button"
        onClick={async () => {
          const result = await onRestore();
          if (!result.success) showToast(result.error ?? "Something went wrong.", "error");
          else {
            showToast(result.success ?? "Restored.", "success");
            router.refresh();
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 px-3.5 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Restore
      </button>
    );
  }

  return (
    <ConfirmDialog
      trigger={(open) => (
        <button type="button" onClick={open} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </button>
      )}
      title={deleteTitle}
      description={deleteDescription}
      confirmLabel="Delete"
      tone="danger"
      onConfirm={async () => {
        const result = await onDelete();
        if (!result.success) showToast(result.error ?? "Something went wrong.", "error");
        else {
          showToast(result.success ?? "Deleted.", "success");
          router.push(listHref);
        }
      }}
    />
  );
}
