"use client";

import { useRef } from "react";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { slugify } from "@/lib/cms/slug";

/** Plain text field plus a "Generate from name" button that reads another
 *  field's current DOM value and slugifies it — deliberately imperative
 *  (not React state) since it's a one-shot convenience action on an
 *  otherwise uncontrolled form, not a value that needs to stay in sync. */
export function SlugField({
  id = "slug",
  defaultValue,
  sourceFieldId,
  error,
}: {
  id?: string;
  defaultValue?: string;
  sourceFieldId: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function generate() {
    const source = document.getElementById(sourceFieldId) as HTMLInputElement | null;
    if (source && inputRef.current) {
      inputRef.current.value = slugify(source.value);
    }
  }

  return (
    <FormField id={id} label="Slug" required hint="Lowercase letters, numbers, and hyphens only — used in the public URL." error={error}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={id}
          name={id}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={defaultValue}
          className={`${ADMIN_INPUT_CLASSES} font-mono text-xs`}
        />
        <button
          type="button"
          onClick={generate}
          className="shrink-0 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Generate
        </button>
      </div>
    </FormField>
  );
}
