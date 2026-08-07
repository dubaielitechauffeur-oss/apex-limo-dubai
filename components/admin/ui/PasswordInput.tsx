"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ADMIN_INPUT_CLASSES } from "./FormField";

/** Light-surface counterpart to `components/admin/auth/PasswordInput.tsx`
 *  (which is `.field-input`-styled for the dark auth cards). Same
 *  show/hide UX, admin dashboard styling — kept separate rather than
 *  parameterizing the auth version, since DESIGN_SYSTEM.md notes form
 *  inputs are dark-only by design with no light variant to extend. */
export default function AdminPasswordInput({
  id,
  name,
  autoComplete,
  required = true,
  minLength,
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  minLength?: number;
}) {
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
        minLength={minLength}
        className={`${ADMIN_INPUT_CLASSES} pr-11`}
      />
      <button
        type="button"
        id={toggleId}
        onClick={() => setVisible((value) => !value)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:text-gray-600"
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
