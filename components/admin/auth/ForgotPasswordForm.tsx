"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type ForgotPasswordState } from "@/lib/auth/actions";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  if (state.submitted) {
    return (
      <div className="space-y-5">
        <p data-testid="form-success" className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          If an account exists for that email, a password reset link has been sent. Check your inbox.
        </p>
        <Link href="/admin/login" className="btn-outline block w-full text-center">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field-input"
        />
      </div>

      {state.error ? (
        <p role="alert" data-testid="form-error" className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-gold w-full disabled:opacity-60">
        {isPending ? "Sending…" : "Send Reset Link"}
      </button>

      <Link href="/admin/login" className="block text-center text-sm text-gold-pale transition-colors hover:text-gold">
        Back to Sign In
      </Link>
    </form>
  );
}
