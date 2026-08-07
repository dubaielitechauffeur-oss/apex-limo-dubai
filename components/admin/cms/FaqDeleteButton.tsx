"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { deleteFaqAction } from "@/app/admin/(dashboard)/faq/actions";

/** FAQ has no `deletedAt`/`PublishStatus` in the schema (unlike Services/
 *  Locations/Blog) — delete here is a real hard delete, so this is a
 *  dedicated button rather than reusing `PublishActions`. */
export function FaqDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <ConfirmDialog
      trigger={(open) => (
        <button type="button" onClick={open} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete FAQ
        </button>
      )}
      title="Delete this FAQ?"
      description="This permanently removes the FAQ. This cannot be undone."
      confirmLabel="Delete"
      tone="danger"
      onConfirm={async () => {
        const result = await deleteFaqAction(id);
        if (!result.success) {
          showToast(result.error ?? "Something went wrong.", "error");
          return;
        }
        showToast(result.success ?? "Deleted.", "success");
        router.push("/admin/faq");
      }}
    />
  );
}
