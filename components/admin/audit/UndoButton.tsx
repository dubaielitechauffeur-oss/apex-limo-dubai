"use client";

import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { undoAuditEntryAction } from "@/app/admin/(dashboard)/audit/actions";

/** Per-entry Undo on the audit log (owner only). */
export function UndoButton({ entryId, label }: { entryId: string; label: string }) {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <ConfirmDialog
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
          Undo
        </button>
      )}
      title="Undo this change?"
      description={`This puts "${label}" back exactly as it was before this change, and the live site updates straight away. The undo is recorded in the audit log and can itself be undone.`}
      confirmLabel="Undo change"
      onConfirm={async () => {
        const result = await undoAuditEntryAction(entryId);
        if (!result.success) showToast(result.error ?? "Something went wrong.", "error");
        else {
          showToast(result.success, "success");
          router.refresh();
        }
      }}
    />
  );
}
