"use client";

import { useRouter } from "next/navigation";
import { Ban, CircleCheck } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { toggleUserActiveAction } from "@/app/admin/(dashboard)/users/[id]/actions";

export function UserStatusToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleConfirm() {
    const result = await toggleUserActiveAction(userId, !isActive);
    if (!result.success) {
      showToast(result.error ?? "Something went wrong.", "error");
      return;
    }
    showToast(result.success, "success");
    router.refresh();
  }

  return (
    <ConfirmDialog
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-medium ${
            isActive
              ? "border-red-200 text-red-700 hover:bg-red-50"
              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          {isActive ? <Ban className="h-4 w-4" aria-hidden="true" /> : <CircleCheck className="h-4 w-4" aria-hidden="true" />}
          {isActive ? "Disable account" : "Enable account"}
        </button>
      )}
      title={isActive ? "Disable this account?" : "Enable this account?"}
      description={
        isActive
          ? "The user will be immediately signed out of the admin panel and unable to sign back in until reactivated."
          : "The user will be able to sign in to the admin panel again."
      }
      confirmLabel={isActive ? "Disable account" : "Enable account"}
      tone={isActive ? "danger" : "default"}
      onConfirm={handleConfirm}
    />
  );
}
