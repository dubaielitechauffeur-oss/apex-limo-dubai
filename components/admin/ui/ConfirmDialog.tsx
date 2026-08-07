"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "./Modal";

/**
 * Wraps a trigger element with a confirmation modal. `onConfirm` should
 * return a promise (typically a Server Action call) — the confirm button
 * shows a busy state and the dialog stays open on failure so the caller can
 * surface the error via Toast without losing the user's place.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "default",
  onConfirm,
}: {
  trigger: (open: () => void) => ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {trigger(() => setOpen(true))}
      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        title={title}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-md border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className={`rounded-md px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              {pending ? "Working…" : confirmLabel}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">{description}</p>
      </Modal>
    </>
  );
}
