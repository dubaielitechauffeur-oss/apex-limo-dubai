"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "@/lib/auth/actions";
import PasswordInput from "./PasswordInput";
import { PASSWORD_REQUIREMENTS_HINT } from "@/lib/auth/password-policy";

const initialState: ResetPasswordState = {};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/admin/login?reset=success");
    }
  }, [state.success, router]);

  if (!token) {
    return (
      <div className="space-y-5">
        <p className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          This reset link is invalid or has expired. Request a new one below.
        </p>
        <Link href="/admin/forgot-password" className="btn-gold block w-full text-center">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke">
          New Password
        </label>
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={12} />
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

      <button type="submit" disabled={isPending} className="btn-gold w-full disabled:opacity-60">
        {isPending ? "Resetting…" : "Reset Password"}
      </button>
    </form>
  );
}
