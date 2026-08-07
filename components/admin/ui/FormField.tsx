import type { ReactNode } from "react";

/** Admin-scoped form field wrapper. Deliberately not reusing
 *  `components/shared/FormField.tsx` — that component's dark-surface
 *  styling is built for the public site's obsidian auth cards, while every
 *  admin surface here is light. Same contract shape, different theme. */
export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export const ADMIN_INPUT_CLASSES =
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

/** Controlled when `onChange` is passed (drives a live preview/derived UI
 *  elsewhere, e.g. RoleChangeForm's permission preview); otherwise a plain
 *  uncontrolled field via `defaultValue`, submitted with the rest of its
 *  `<form>`. Passing `value` without `onChange` would make React log a
 *  read-only-field warning and silently ignore user input, so the two
 *  modes use different React props rather than trying to share one. */
export function SelectField({
  id,
  value,
  defaultValue,
  onChange,
  disabled,
  children,
}: {
  id: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const controlledProps = onChange
    ? { value, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value) }
    : { defaultValue };

  return (
    <select id={id} name={id} disabled={disabled} className={ADMIN_INPUT_CLASSES} {...controlledProps}>
      {children}
    </select>
  );
}
