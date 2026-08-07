"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "@/lib/auth/actions";
import PasswordInput from "./PasswordInput";
import { PASSWORD_REQUIREMENTS_HINT } from "@/lib/auth/password-policy";

const initialState: ChangePasswordState = {};

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="currentPassword" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke">
          Current Password
        </label>
        <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" />
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke">
          New Password
        </label>
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" minLength={12} />
        <p className="mt-1.5 text-xs text-smoke/80">{PASSWORD_REQUIREMENTS_HINT}</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke">
          Confirm New Password
        </label>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" minLength={12} />
      </div>

      {state.error ? (
        <p role="alert" data-testid="form-error" className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p data-testid="form-success" className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Password updated successfully.
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-gold w-full disabled:opacity-60">
        {isPending ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
