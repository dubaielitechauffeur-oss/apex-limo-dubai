"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { deleteMediaAction } from "@/app/admin/(dashboard)/media/actions";
import type { MediaUsageRef } from "@/lib/media/items";

export function MediaDeleteSection({ mediaId, usage }: { mediaId: string; usage: MediaUsageRef[] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const description =
    usage.length === 0
      ? "This file isn't currently used anywhere. This soft-deletes it — it's removed from the library and can't be selected for new use."
      : `This file is used in ${usage.length} place${usage.length === 1 ? "" : "s"}: ${usage
          .map((u) => u.label)
          .join(", ")}. Deleting it removes it from the library, but existing pages keep rendering it until you update them.`;

  return (
    <ConfirmDialog
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete media
        </button>
      )}
      title="Delete this media item?"
      description={description}
      confirmLabel="Delete"
      tone="danger"
      onConfirm={async () => {
        const result = await deleteMediaAction(mediaId);
        if (!result.success) {
          showToast(result.error ?? "Could not delete media.", "error");
          return;
        }
        showToast(result.success ?? "Deleted.", "success");
        router.push("/admin/media");
      }}
    />
  );
}
