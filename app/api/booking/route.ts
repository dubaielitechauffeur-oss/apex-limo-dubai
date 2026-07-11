import { NextRequest, NextResponse } from "next/server";
import type { BookingFormData } from "@/lib/types";
import { validateBookingForm, hasErrors } from "@/lib/validation";
import { dispatchLead } from "@/lib/notifications";

function generateReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `APX-${stamp}-${rand}`;
}

export async function POST(request: NextRequest) {
  let body: BookingFormData;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const errors = validateBookingForm(body);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { success: false, message: "Please correct the highlighted fields.", errors },
      { status: 422 }
    );
  }

  const reference = generateReference();

  try {
    // Fire-and-forget style: we don't want a slow downstream provider to
    // block the customer's confirmation. Each channel isolates its own
    // failures inside dispatchLead.
    await dispatchLead("booking", body, reference);
  } catch (err) {
    console.error("[api/booking] dispatch error:", err);
    // The lead is still considered received — dispatch failures are logged
    // for ops follow-up rather than surfaced to the customer.
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Your booking request has been received. Our team will confirm shortly.",
      reference,
    },
    { status: 200 }
  );
}
