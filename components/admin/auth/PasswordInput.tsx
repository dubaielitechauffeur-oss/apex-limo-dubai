"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}

/** `.field-input` with a show/hide toggle — reused by login, reset, and
 *  change-password forms. Toggle is a plain button (not a submit), and its
 *  label swaps with `aria-pressed` so screen readers announce the state
 *  change, not just an icon swap. */
export default function PasswordInput({
  id,
  name,
  autoComplete,
  required = true,
  placeholder,
  minLength,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggleId = useId();

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="field-input pe-12"
      />
      <button
        type="button"
        id={toggleId}
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-smoke transition-colors hover:text-gold"
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
