"use client";

import { KeyRound } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { sendPasswordResetAction } from "@/app/admin/(dashboard)/users/[id]/actions";

export function SendPasswordResetButton({ userId, email }: { userId: string; email: string }) {
  const { showToast } = useToast();

  async function handleConfirm() {
    const result = await sendPasswordResetAction(userId);
    if (!result.success) {
      showToast(result.error ?? "Something went wrong.", "error");
      return;
    }
    showToast(result.success, "success");
  }

  return (
    <ConfirmDialog
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Send password reset
        </button>
      )}
      title="Send a password reset email?"
      description={`A password reset link will be emailed to ${email}. The link expires in 1 hour.`}
      confirmLabel="Send email"
      onConfirm={handleConfirm}
    />
  );
}
