import type { BookingFormData, QuoteFormData } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s-]{7,16}$/;

export type FormErrors<T> = Partial<Record<keyof T, string>>;

function isTodayOrLater(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const picked = new Date(dateStr);
  return picked >= today;
}

export function validateBookingForm(
  data: BookingFormData
): FormErrors<BookingFormData> {
  const errors: FormErrors<BookingFormData> = {};

  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name.";
  }
  if (!PHONE_PATTERN.test(data.phone.trim())) {
    errors.phone = "Enter a valid phone number, e.g. +971 5X XXX XXXX.";
  }
  if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!data.pickupLocation.trim()) {
    errors.pickupLocation = "Enter a pickup location.";
  }
  if (!data.dropoffLocation.trim()) {
    errors.dropoffLocation = "Enter a drop-off location.";
  }
  if (!data.date) {
    errors.date = "Select a pickup date.";
  } else if (!isTodayOrLater(data.date)) {
    errors.date = "Pickup date can't be in the past.";
  }
  if (!data.time) {
    errors.time = "Select a pickup time.";
  }
  if (!data.vehicle) {
    errors.vehicle = "Select a vehicle.";
  }
  if (!data.passengers || data.passengers < 1) {
    errors.passengers = "Enter at least 1 passenger.";
  } else if (data.passengers > 14) {
    errors.passengers = "For groups over 14, WhatsApp us directly.";
  }

  return errors;
}

export function validateQuoteForm(
  data: QuoteFormData
): FormErrors<QuoteFormData> {
  const errors: FormErrors<QuoteFormData> = {};

  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name.";
  }
  if (!PHONE_PATTERN.test(data.phone.trim())) {
    errors.phone = "Enter a valid phone number, e.g. +971 5X XXX XXXX.";
  }
  if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!data.serviceType) {
    errors.serviceType = "Select the service you need.";
  }
  if (!data.pickupLocation.trim()) {
    errors.pickupLocation = "Enter a pickup location.";
  }
  if (data.date && !isTodayOrLater(data.date)) {
    errors.date = "Date can't be in the past.";
  }

  return errors;
}

export function hasErrors(errors: FormErrors<unknown>): boolean {
  return Object.values(errors).some(Boolean);
}
