"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "@/lib/auth/actions";
import { PASSWORD_REQUIREMENTS_HINT } from "@/lib/auth/password-policy";
import { FormField } from "@/components/admin/ui/FormField";
import AdminPasswordInput from "@/components/admin/ui/PasswordInput";

const initialState: ChangePasswordState = {};

/** Same `changePasswordAction` Server Action Phase 3 built (verifies the
 *  current password, enforces the password policy, hashes with argon2) —
 *  only the surrounding form markup is new, to match the light admin shell
 *  instead of the dark auth card it originally shipped inside. */
export default function AdminChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-5" noValidate>
      <FormField id="currentPassword" label="Current password" required>
        <AdminPasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" />
      </FormField>

      <FormField id="newPassword" label="New password" required hint={PASSWORD_REQUIREMENTS_HINT}>
        <AdminPasswordInput id="newPassword" name="newPassword" autoComplete="new-password" minLength={12} />
      </FormField>

      <FormField id="confirmPassword" label="Confirm new password" required>
        <AdminPasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" minLength={12} />
      </FormField>

      {state.error ? (
        <p role="alert" data-testid="form-error" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p data-testid="form-success" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Password updated successfully.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
      >
        {isPending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
