import { NextRequest, NextResponse } from "next/server";
import type { QuoteFormData } from "@/lib/types";
import { validateQuoteForm, hasErrors } from "@/lib/validation";
import { dispatchLead } from "@/lib/notifications";

function generateReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `APX-Q-${stamp}-${rand}`;
}

export async function POST(request: NextRequest) {
  let body: QuoteFormData;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const errors = validateQuoteForm(body);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { success: false, message: "Please correct the highlighted fields.", errors },
      { status: 422 }
    );
  }

  const reference = generateReference();

  try {
    await dispatchLead("quote", body, reference);
  } catch (err) {
    console.error("[api/quote] dispatch error:", err);
  }

  return NextResponse.json(
    {
      success: true,
      message: "Thanks — your quote request is in. We'll be in touch shortly.",
      reference,
    },
    { status: 200 }
  );
}
