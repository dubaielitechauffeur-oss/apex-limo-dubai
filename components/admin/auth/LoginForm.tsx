"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import PasswordInput from "./PasswordInput";

const initialState: LoginState = {};

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

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

      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke">
          Password
        </label>
        <PasswordInput id="password" name="password" autoComplete="current-password" />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-smoke">
          <input
            type="checkbox"
            name="rememberMe"
            className="h-4 w-4 rounded border-gold/40 bg-obsidian text-gold focus:ring-gold"
          />
          Remember me
        </label>
        <Link href="/admin/forgot-password" className="text-gold-pale transition-colors hover:text-gold">
          Forgot password?
        </Link>
      </div>

      {state.error ? (
        <p role="alert" data-testid="form-error" className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-gold w-full disabled:opacity-60">
        {isPending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
