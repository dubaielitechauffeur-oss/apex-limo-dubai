import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { buildValidationMessages, validateBookingForm, hasErrors, bookingBodySchema, type ValidationMessages } from "@/lib/validation";
import { dispatchLead } from "@/lib/notifications";
import { resolveLocale, generateReference, readJsonBodyWithLimit } from "@/lib/api-lead-handler";
import { isRateLimited, isHoneypotTripped } from "@/lib/spam-protection";

export async function POST(request: NextRequest) {
  let locale: Locale = routing.defaultLocale;

  // Rate limit before touching the body at all — a spammer/DoS attempt is
  // rejected on IP alone, without ever buffering or parsing their payload.
  if (isRateLimited(request)) {
    const t = await getTranslations({ locale, namespace: "forms.status" });
    return NextResponse.json({ success: false, message: t("rateLimited") }, { status: 429 });
  }

  const parsed = await readJsonBodyWithLimit(request);
  if (!parsed.ok) {
    const t = await getTranslations({ locale, namespace: "forms.status" });
    if (parsed.reason === "too_large") {
      return NextResponse.json({ success: false, message: t("payloadTooLarge") }, { status: 413 });
    }
    return NextResponse.json({ success: false, message: t("invalidBody") }, { status: 400 });
  }

  const raw = parsed.data;
  locale = resolveLocale(raw.locale);

  const t = await getTranslations({ locale, namespace: "forms" });

  // Honeypot tripped: pretend success so bots don't adapt, but never
  // validate, dispatch, or send an email for this submission. Checked on the
  // raw body, before the schema strips the `company` field.
  if (isHoneypotTripped(raw)) {
    return NextResponse.json(
      { success: true, message: t("booking.successMessageApi"), reference: generateReference("APX-") },
      { status: 200 }
    );
  }

  // Runtime-validated, type-coerced body — replaces the previous unchecked
  // cast so wrong JSON types can't reach the validators or the email.
  const body = bookingBodySchema.parse(raw);

  const validationMessages: ValidationMessages = buildValidationMessages(t);

  const errors = validateBookingForm(body, validationMessages);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { success: false, message: t("status.correctFieldsApi"), errors },
      { status: 422 }
    );
  }

  const reference = generateReference("APX-");

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
      message: t("booking.successMessageApi"),
      reference,
    },
    { status: 200 }
  );
}
