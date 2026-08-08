"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import { SelectField } from "./FormField";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

/**
 * Status dropdown + "Update" button for entities whose status enum isn't
 * the CMS's draft/published/archived (`PublishActions`/`PublishStatusSelect`
 * don't fit — Booking/Quote have their own, differently-shaped enums with
 * their own valid-transition rules). `options` should already be filtered
 * to the transitions valid from the current status; the server action is
 * still the real enforcement (this is a convenience, not the security
 * boundary — see lib/admin/bookings.ts's `BOOKING_STATUS_TRANSITIONS`).
 */
export function StatusTransitionControl<S extends string>({
  id,
  status,
  allLabels,
  allowedValues,
  onUpdate,
}: {
  id: string;
  status: S;
  /** Every status this entity type can ever have, for its display label —
   *  not all are selectable (see `allowedValues`). */
  allLabels: { value: S; label: string }[];
  /** The subset of `allLabels` reachable from the current status. */
  allowedValues: S[];
  /** Pass a bound Server Action reference (e.g.
   *  `setBookingStatusAction.bind(null, id)`), never a plain arrow function
   *  — this component is rendered from a Server Component detail page, and
   *  only a Server Action (bound or not) can cross that boundary as a prop;
   *  an inline closure throws "Event handlers cannot be passed to Client
   *  Component props" at request time. */
  onUpdate: (status: S) => Promise<CmsActionState>;
}) {
  const [value, setValue] = useState<S>(status);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  function handleSave() {
    if (value === status) return;
    startTransition(async () => {
      const result = await onUpdate(value);
      if (!result.success) {
        showToast(result.error ?? "Something went wrong.", "error");
        setValue(status);
      } else {
        showToast(result.success ?? "Status updated.", "success");
        router.refresh();
      }
    });
  }

  if (allowedValues.length === 0) {
    return <p className="text-sm text-gray-500">This status is final — no further changes are available.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <SelectField id={`status-${id}`} value={value} onChange={(next) => setValue(next as S)} disabled={isPending}>
        {allLabels.map((option) => (
          <option key={option.value} value={option.value} disabled={option.value !== status && !allowedValues.includes(option.value)}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || value === status}
        className="shrink-0 rounded-md bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Update"}
      </button>
    </div>
  );
}
