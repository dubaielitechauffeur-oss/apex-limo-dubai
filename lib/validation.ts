import { z } from "zod";
import type { BookingFormData, QuoteFormData, ContactFormData } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s-]{7,16}$/;

/**
 * Runtime schema layer for the public lead API routes. This is the type-safe
 * gate that replaces the previous unchecked `raw as unknown as FormData`
 * cast: it guarantees every field is the type the rest of the pipeline
 * (validators, email templates) assumes, and strips any unknown keys the
 * client sent (e.g. the honeypot `company` and the `locale` marker, both
 * read off the raw body before this runs).
 *
 * Every field is lenient by design — a non-string coerces to "" and a
 * non-numeric passenger count coerces to 0 — so a normal browser submission
 * (which always sends the right shapes) is unchanged, and the existing
 * translated, business-rule validators below (`validateBookingForm` et al.)
 * remain the single source of user-facing "required"/"too long"/"date in
 * the past" errors. The schema only hardens the boundary against
 * hand-crafted payloads sending wrong JSON types (e.g. `fullName: 123` or
 * `passengers: "abc"`), which previously flowed straight into the outbound
 * email.
 */
const leadText = z.string().catch("");
const leadCount = z.coerce.number().catch(0);

export const bookingBodySchema = z.object({
  fullName: leadText,
  phone: leadText,
  email: leadText,
  pickupLocation: leadText,
  dropoffLocation: leadText,
  date: leadText,
  time: leadText,
  vehicle: leadText,
  passengers: leadCount,
  hours: leadText,
  specialRequests: leadText,
});

export const quoteBodySchema = z.object({
  fullName: leadText,
  phone: leadText,
  email: leadText,
  serviceType: leadText,
  pickupLocation: leadText,
  date: leadText,
  vehicle: leadText,
  message: leadText,
});

export const contactBodySchema = z.object({
  fullName: leadText,
  phone: leadText,
  email: leadText,
  subject: leadText,
  message: leadText,
});

/**
 * Upper bounds on free-text fields — every lead ends up interpolated into
 * an outbound email (see lib/email-templates.ts), so an unbounded string
 * is both an abuse vector (megabyte-scale POST bodies) and a readability
 * problem for whoever triages the inbox. Short identity/location fields
 * get a tight cap; open-ended notes/message fields get a generous one.
 */
const MAX_SHORT_FIELD_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;

function exceedsLength(value: string | undefined, max: number): boolean {
  return (value?.length ?? 0) > max;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

/** Translated validation messages, sourced from the `forms.validation` message namespace. */
export interface ValidationMessages {
  fullNameRequired: string;
  phoneInvalid: string;
  emailInvalid: string;
  pickupRequired: string;
  dropoffRequired: string;
  pickupDateRequired: string;
  pickupDatePast: string;
  datePast: string;
  timeRequired: string;
  vehicleRequired: string;
  passengersMin: string;
  passengersMax: string;
  serviceRequired: string;
  messageRequired: string;
}

/**
 * Builds a ValidationMessages object from any next-intl translator scoped
 * to the "forms" namespace — identical `t("validation.forgets...")` call
 * sequence previously copy-pasted verbatim across 3 API routes and 4 form
 * components. `t` accepts both the async server `getTranslations(...)`
 * result and the client `useTranslations("forms")` hook result, since both
 * expose the same `(key: string) => string` call signature.
 */
export function buildValidationMessages(t: (key: string) => string): ValidationMessages {
  return {
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
    messageRequired: t("validation.messageRequired"),
  };
}

function isTodayOrLater(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const picked = new Date(dateStr);
  return picked >= today;
}

export function validateBookingForm(
  data: BookingFormData,
  messages: ValidationMessages
): FormErrors<BookingFormData> {
  const errors: FormErrors<BookingFormData> = {};

  if (!data.fullName?.trim() || data.fullName.trim().length < 2 || exceedsLength(data.fullName, MAX_SHORT_FIELD_LENGTH)) {
    errors.fullName = messages.fullNameRequired;
  }
  if (!PHONE_PATTERN.test(data.phone?.trim() ?? "")) {
    errors.phone = messages.phoneInvalid;
  }
  if (!EMAIL_PATTERN.test(data.email?.trim() ?? "") || exceedsLength(data.email, MAX_SHORT_FIELD_LENGTH)) {
    errors.email = messages.emailInvalid;
  }
  if (!data.pickupLocation?.trim() || exceedsLength(data.pickupLocation, MAX_SHORT_FIELD_LENGTH)) {
    errors.pickupLocation = messages.pickupRequired;
  }
  if (!data.dropoffLocation?.trim() || exceedsLength(data.dropoffLocation, MAX_SHORT_FIELD_LENGTH)) {
    errors.dropoffLocation = messages.dropoffRequired;
  }
  if (!data.date) {
    errors.date = messages.pickupDateRequired;
  } else if (!isTodayOrLater(data.date)) {
    errors.date = messages.pickupDatePast;
  }
  if (!data.time) {
    errors.time = messages.timeRequired;
  }
  if (!data.vehicle) {
    errors.vehicle = messages.vehicleRequired;
  }
  if (!data.passengers || data.passengers < 1) {
    errors.passengers = messages.passengersMin;
  } else if (data.passengers > 14) {
    errors.passengers = messages.passengersMax;
  }
  if (exceedsLength(data.specialRequests, MAX_MESSAGE_LENGTH)) {
    errors.specialRequests = messages.messageRequired;
  }

  return errors;
}

export function validateQuoteForm(
  data: QuoteFormData,
  messages: ValidationMessages
): FormErrors<QuoteFormData> {
  const errors: FormErrors<QuoteFormData> = {};

  if (!data.fullName?.trim() || data.fullName.trim().length < 2 || exceedsLength(data.fullName, MAX_SHORT_FIELD_LENGTH)) {
    errors.fullName = messages.fullNameRequired;
  }
  if (!PHONE_PATTERN.test(data.phone?.trim() ?? "")) {
    errors.phone = messages.phoneInvalid;
  }
  if (!EMAIL_PATTERN.test(data.email?.trim() ?? "") || exceedsLength(data.email, MAX_SHORT_FIELD_LENGTH)) {
    errors.email = messages.emailInvalid;
  }
  if (!data.serviceType) {
    errors.serviceType = messages.serviceRequired;
  }
  if (!data.pickupLocation?.trim() || exceedsLength(data.pickupLocation, MAX_SHORT_FIELD_LENGTH)) {
    errors.pickupLocation = messages.pickupRequired;
  }
  if (data.date && !isTodayOrLater(data.date)) {
    errors.date = messages.datePast;
  }
  if (exceedsLength(data.message, MAX_MESSAGE_LENGTH)) {
    errors.message = messages.messageRequired;
  }

  return errors;
}

export function validateContactForm(
  data: ContactFormData,
  messages: ValidationMessages
): FormErrors<ContactFormData> {
  const errors: FormErrors<ContactFormData> = {};

  if (!data.fullName?.trim() || data.fullName.trim().length < 2 || exceedsLength(data.fullName, MAX_SHORT_FIELD_LENGTH)) {
    errors.fullName = messages.fullNameRequired;
  }
  if (!PHONE_PATTERN.test(data.phone?.trim() ?? "")) {
    errors.phone = messages.phoneInvalid;
  }
  if (!EMAIL_PATTERN.test(data.email?.trim() ?? "") || exceedsLength(data.email, MAX_SHORT_FIELD_LENGTH)) {
    errors.email = messages.emailInvalid;
  }
  if (exceedsLength(data.subject, MAX_SHORT_FIELD_LENGTH)) {
    errors.subject = messages.messageRequired;
  }
  if (!data.message?.trim() || exceedsLength(data.message, MAX_MESSAGE_LENGTH)) {
    errors.message = messages.messageRequired;
  }

  return errors;
}

export function hasErrors(errors: FormErrors<unknown>): boolean {
  return Object.values(errors).some(Boolean);
}
