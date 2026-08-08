"use client";

import { useState, useTransition } from "react";
import { useToast } from "./Toast";
import { ADMIN_INPUT_CLASSES } from "./FormField";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

/**
 * Free-text internal-notes editor shared by Bookings and Quotes. Never
 * rendered on any public page/component — internal notes exist only inside
 * `/admin`, gated the same as the rest of each entity's detail page.
 */
export function NotesEditor({ id, initialValue, onSave }: { id: string; initialValue: string; onSave: (notes: string) => Promise<CmsActionState> }) {
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSave() {
    startTransition(async () => {
      const result = await onSave(value);
      if (!result.success) showToast(result.error ?? "Something went wrong.", "error");
      else showToast(result.success ?? "Notes saved.", "success");
    });
  }

  return (
    <div>
      <textarea
        id={`notes-${id}`}
        rows={4}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Internal notes — never shown to the customer or on the public site."
        className={ADMIN_INPUT_CLASSES}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || value === initialValue}
        className="mt-2 rounded-md border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save notes"}
      </button>
    </div>
  );
}
