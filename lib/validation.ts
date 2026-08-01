import type { BookingFormData, QuoteFormData } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s-]{7,16}$/;

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

  if (!data.fullName?.trim() || data.fullName.trim().length < 2) {
    errors.fullName = messages.fullNameRequired;
  }
  if (!PHONE_PATTERN.test(data.phone?.trim() ?? "")) {
    errors.phone = messages.phoneInvalid;
  }
  if (!EMAIL_PATTERN.test(data.email?.trim() ?? "")) {
    errors.email = messages.emailInvalid;
  }
  if (!data.pickupLocation?.trim()) {
    errors.pickupLocation = messages.pickupRequired;
  }
  if (!data.dropoffLocation?.trim()) {
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

  return errors;
}

export function validateQuoteForm(
  data: QuoteFormData,
  messages: ValidationMessages
): FormErrors<QuoteFormData> {
  const errors: FormErrors<QuoteFormData> = {};

  if (!data.fullName?.trim() || data.fullName.trim().length < 2) {
    errors.fullName = messages.fullNameRequired;
  }
  if (!PHONE_PATTERN.test(data.phone?.trim() ?? "")) {
    errors.phone = messages.phoneInvalid;
  }
  if (!EMAIL_PATTERN.test(data.email?.trim() ?? "")) {
    errors.email = messages.emailInvalid;
  }
  if (!data.serviceType) {
    errors.serviceType = messages.serviceRequired;
  }
  if (!data.pickupLocation?.trim()) {
    errors.pickupLocation = messages.pickupRequired;
  }
  if (data.date && !isTodayOrLater(data.date)) {
    errors.date = messages.datePast;
  }

  return errors;
}

export function hasErrors(errors: FormErrors<unknown>): boolean {
  return Object.values(errors).some(Boolean);
}
