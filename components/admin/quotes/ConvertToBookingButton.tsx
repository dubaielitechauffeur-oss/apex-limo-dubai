"use client";

import { ArrowRightCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { convertQuoteToBookingAction } from "@/app/admin/(dashboard)/quotes/actions";

/** Only rendered when the quote's status is "accepted" (see the detail
 *  page) — `convertQuoteToBooking()` itself independently re-verifies this
 *  server-side, so hiding the button for other statuses is a UX nicety, not
 *  the enforcement. On success the action redirects to the new booking;
 *  this component only ever handles the failure path (duplicate
 *  conversion, permission denial, wrong status). */
export function ConvertToBookingButton({ quoteId }: { quoteId: string }) {
  const { showToast } = useToast();

  return (
    <ConfirmDialog
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <ArrowRightCircle className="h-4 w-4" aria-hidden="true" />
          Convert to Booking
        </button>
      )}
      title="Convert this quote to a booking?"
      description="Creates a new booking with this quote's customer and trip details, and links it back to this quote. This cannot be undone or repeated."
      confirmLabel="Convert"
      onConfirm={async () => {
        const result = await convertQuoteToBookingAction(quoteId);
        if (result && !result.success) {
          showToast(result.error ?? "Conversion failed.", "error");
        }
      }}
    />
  );
}
