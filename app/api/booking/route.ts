import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import type { BookingFormData } from "@/lib/types";
import { validateBookingForm, hasErrors, type ValidationMessages } from "@/lib/validation";
import { dispatchLead } from "@/lib/notifications";

function generateReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `APX-${stamp}-${rand}`;
}

function resolveLocale(value: unknown): Locale {
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

export async function POST(request: NextRequest) {
  let locale: Locale = routing.defaultLocale;
  let body: BookingFormData;

  try {
    const raw = await request.json();
    locale = resolveLocale(raw.locale);
    delete raw.locale;
    body = raw;
  } catch {
    const t = await getTranslations({ locale, namespace: "forms.status" });
    return NextResponse.json(
      { success: false, message: t("invalidBody") },
      { status: 400 }
    );
  }

  const t = await getTranslations({ locale, namespace: "forms" });
  const validationMessages: ValidationMessages = {
    fullNameRequired: t("validation.fullNameRequired"),
    phoneInvalid: t("validation.phoneInvalid"),
    emailInvalid: t("validation.emailInvalid"),
    pickupRequired: t("validation.pickupRequired"),
    dropoffRequired: t("validation.dropoffRequired"),
    pickupDateRequired: t("validation.pickupDateRequired"),
    pickupDatePast: t("validation.pickupDatePast"),
    datePast: t("validation.datePast"),
    timeRequired: t("validation.timeRequired"),
    vehicleRequired: t("validation.vehicleRequired"),
    passengersMin: t("validation.passengersMin"),
    passengersMax: t("validation.passengersMax"),
    serviceRequired: t("validation.serviceRequired"),
  };

  const errors = validateBookingForm(body, validationMessages);
  if (hasErrors(errors)) {
    return NextResponse.json(
      { success: false, message: t("status.correctFieldsApi"), errors },
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
      message: t("booking.successMessageApi"),
      reference,
    },
    { status: 200 }
  );
}
