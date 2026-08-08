import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { buildValidationMessages, validateQuoteForm, hasErrors, quoteBodySchema, type ValidationMessages } from "@/lib/validation";
import { dispatchLead } from "@/lib/notifications";
import { resolveLocale, generateReference, readJsonBodyWithLimit, persistQuote } from "@/lib/api-lead-handler";
import { isRateLimited, isHoneypotTripped, getClientIp } from "@/lib/spam-protection";

export async function POST(request: NextRequest) {
  let locale: Locale = routing.defaultLocale;

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

  // Honeypot checked on the raw body, before the schema strips `company`.
  if (isHoneypotTripped(raw)) {
    return NextResponse.json(
      { success: true, message: t("quote.successMessageApi"), reference: generateReference("APX-Q-") },
      { status: 200 }
    );
  }

  // Runtime-validated, type-coerced body — replaces the previous unchecked cast.
  const body = quoteBodySchema.parse(raw);

  const validationMessages: ValidationMessages = buildValidationMessages(t);

  const errors = validateQuoteForm(body, validationMessages);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { success: false, message: t("status.correctFieldsApi"), errors },
      { status: 422 }
    );
  }

  const reference = generateReference("APX-Q-");

  // Persisted first so the admin Quotes CMS (Phase 10) has a durable record
  // — see persistQuote's own doc comment for the field-mapping decisions
  // and why a persistence failure never fails the customer's submission.
  await persistQuote(body, { reference, locale, ipAddress: getClientIp(request.headers) });

  try {
    await dispatchLead("quote", body, reference);
  } catch (err) {
    console.error("[api/quote] dispatch error:", err);
  }

  return NextResponse.json(
    {
      success: true,
      message: t("quote.successMessageApi"),
      reference,
    },
    { status: 200 }
  );
}
