import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { buildValidationMessages, validateContactForm, hasErrors, contactBodySchema, type ValidationMessages } from "@/lib/validation";
import { dispatchLead } from "@/lib/notifications";
import { resolveLocale, generateReference, readJsonBodyWithLimit, persistContact } from "@/lib/api-lead-handler";
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
      { success: true, message: t("contact.successMessageApi"), reference: generateReference("APX-C-") },
      { status: 200 }
    );
  }

  // Runtime-validated, type-coerced body — replaces the previous unchecked cast.
  const body = contactBodySchema.parse(raw);

  const validationMessages: ValidationMessages = buildValidationMessages(t);

  const errors = validateContactForm(body, validationMessages);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { success: false, message: t("status.correctFieldsApi"), errors },
      { status: 422 }
    );
  }

  const reference = generateReference("APX-C-");

  // Persisted first so the admin Contacts module has a durable record
  // regardless of whether the downstream email dispatch below succeeds.
  await persistContact(body, { reference, locale, ipAddress: getClientIp(request.headers) });

  try {
    await dispatchLead("contact", body, reference);
  } catch (err) {
    console.error("[api/contact] dispatch error:", err);
  }

  return NextResponse.json(
    {
      success: true,
      message: t("contact.successMessageApi"),
      reference,
    },
    { status: 200 }
  );
}
