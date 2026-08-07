"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Archive, Trash2, RotateCcw } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import type { PublishStatus } from "@/lib/generated/prisma/client";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

/** Generic publish/unpublish/archive/delete/restore action bar shared by
 *  every CMS module's detail page — each module passes its own Server
 *  Action functions (same signatures across services/locations/blog) so
 *  this component isn't duplicated per module. */
export function PublishActions({
  status,
  isDeleted,
  listHref,
  onSetStatus,
  onDelete,
  onRestore,
}: {
  status: PublishStatus;
  isDeleted?: boolean;
  /** Where to navigate after a successful delete (the module's list page). */
  listHref: string;
  onSetStatus: (status: PublishStatus) => Promise<CmsActionState>;
  onDelete: () => Promise<CmsActionState>;
  onRestore?: () => Promise<CmsActionState>;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSetStatus(next: PublishStatus) {
    const result = await onSetStatus(next);
    if (!result.success) showToast(result.error ?? "Something went wrong.", "error");
    else {
      showToast(result.success ?? "Updated.", "success");
      router.refresh();
    }
  }

  if (isDeleted) {
    return (
      <button
        type="button"
        onClick={async () => {
          const result = await onRestore?.();
          if (!result?.success) showToast(result?.error ?? "Something went wrong.", "error");
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
    <div className="flex flex-col gap-2">
      {status !== "published" ? (
        <button
          type="button"
          onClick={() => handleSetStatus("published")}
          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 px-3.5 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Publish
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleSetStatus("draft")}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <EyeOff className="h-4 w-4" aria-hidden="true" />
          Unpublish
        </button>
      )}
      {status !== "archived" ? (
        <button
          type="button"
          onClick={() => handleSetStatus("archived")}
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 px-3.5 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
        >
          <Archive className="h-4 w-4" aria-hidden="true" />
          Archive
        </button>
      ) : null}
      <ConfirmDialog
        trigger={(open) => (
          <button
            type="button"
            onClick={open}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        )}
        title="Delete this item?"
        description="This soft-deletes the item — it's removed from the admin list and the public site, and can be restored later."
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
    </div>
  );
}
