"use client";

import { useState, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import FormField from "@/components/shared/FormField";
import FormSectionHeading from "@/components/shared/FormSectionHeading";
import PhoneInputField from "@/components/shared/PhoneInputField";
import CTAButton from "@/components/shared/CTAButton";
import { FLEET } from "@/data/fleet";
import { LOCATIONS } from "@/data/locations";
import { SERVICES, getWhatsAppLink } from "@/lib/constants";
import type { BookingFormData } from "@/lib/types";
import { validateBookingForm, hasErrors, type FormErrors } from "@/lib/validation";

const HOUR_OPTIONS = [
  "One-way transfer",
  "2 hours",
  "4 hours",
  "6 hours",
  "8 hours (full day)",
  "Custom — specify in notes",
];

const EMPTY_FORM: BookingFormData = {
  fullName: "",
  phone: "",
  email: "",
  pickupLocation: "",
  dropoffLocation: "",
  date: "",
  time: "",
  vehicle: "",
  passengers: 1,
  hours: "",
  specialRequests: "",
};

type Status = "idle" | "submitting" | "success" | "error";

/** Turns a URL slug like "airport-transfers" into "Airport Transfers" as a readable fallback. */
function prettifySlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Builds initial form values from ?vehicle=, ?service=, and ?location= query
 * params, matching them against known fleet/service/location data where
 * possible so select fields land on a valid option rather than a blank one.
 */
function buildInitialBookingForm(
  searchParams: ReturnType<typeof useSearchParams>
): BookingFormData {
  const form: BookingFormData = { ...EMPTY_FORM };

  const vehicleSlug = searchParams.get("vehicle");
  if (vehicleSlug) {
    const vehicle = FLEET.find((v) => v.slug === vehicleSlug);
    if (vehicle) form.vehicle = vehicle.name;
  }

  const locationSlug = searchParams.get("location");
  if (locationSlug) {
    const location = LOCATIONS.find((l) => l.slug === locationSlug);
    form.pickupLocation = location ? location.name : prettifySlug(locationSlug);
  }

  const serviceSlug = searchParams.get("service");
  if (serviceSlug) {
    const service = SERVICES.find((s) => s.slug === serviceSlug);
    const serviceName = service ? service.name : prettifySlug(serviceSlug);
    form.specialRequests = `Service requested: ${serviceName}`;
  }

  return form;
}

function BookingFormSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 animate-pulse bg-[#1A1A1A]" />
      ))}
    </div>
  );
}

function BookingFormFields() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<BookingFormData>(() =>
    buildInitialBookingForm(searchParams)
  );
  const [errors, setErrors] = useState<FormErrors<BookingFormData>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  const todayISO = new Date().toISOString().split("T")[0];

  function update<K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateBookingForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      setStatus("error");
      setServerMessage("Please correct the highlighted fields and try again.");
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setServerMessage(
          data.message ?? "Something went wrong. Please try again or WhatsApp us."
        );
        return;
      }

      setReference(data.reference ?? "");
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
      setServerMessage(
        "We couldn't reach our server. Please try again or WhatsApp us directly."
      );
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-center rounded-2xl border border-[rgba(201,161,74,0.25)] bg-[#111111] p-10 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-[#C9A14A]" strokeWidth={1.5} />
        <h3 className="mt-5 font-display text-2xl text-white">
          Booking Request Received
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#B8B8B8]">
          {serverMessage || "Our team will confirm your chauffeur shortly."}
          {reference ? (
            <>
              {" "}
              Your reference is{" "}
              <span className="font-semibold text-[#C9A14A]">{reference}</span>.
            </>
          ) : null}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <CTAButton
            href={getWhatsAppLink(
              `Hello Apex Limo, I just submitted a booking request${
                reference ? ` (ref: ${reference})` : ""
              } and wanted to confirm.`
            )}
            external
          >
            Confirm on WhatsApp
          </CTAButton>
          <button
            onClick={() => setStatus("idle")}
            className="btn-outline"
            type="button"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      {status === "error" && serverMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
          <p>{serverMessage}</p>
        </div>
      ) : null}

      <div className="space-y-6">
        <FormSectionHeading step={1} title="Personal Details" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField id="fullName" label="Full Name" required error={errors.fullName}>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              aria-invalid={Boolean(errors.fullName)}
              className={`field-input ${errors.fullName ? "field-input-error" : ""}`}
              placeholder="e.g. James Carter"
            />
          </FormField>

          <FormField id="phone" label="Phone Number" required error={errors.phone}>
            <PhoneInputField
              id="phone"
              value={form.phone}
              onChange={(value) => update("phone", value)}
              error={Boolean(errors.phone)}
              ariaDescribedBy={errors.phone ? "phone-error" : undefined}
            />
          </FormField>
        </div>

        <FormField id="email" label="Email" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            className={`field-input ${errors.email ? "field-input-error" : ""}`}
            placeholder="you@company.com"
          />
        </FormField>
      </div>

      <div className="space-y-6">
        <FormSectionHeading step={2} title="Journey Details" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            id="pickupLocation"
            label="Pickup Location"
            required
            error={errors.pickupLocation}
          >
            <input
              id="pickupLocation"
              name="pickupLocation"
              type="text"
              value={form.pickupLocation}
              onChange={(e) => update("pickupLocation", e.target.value)}
              aria-describedby={errors.pickupLocation ? "pickupLocation-error" : undefined}
              aria-invalid={Boolean(errors.pickupLocation)}
              className={`field-input ${errors.pickupLocation ? "field-input-error" : ""}`}
              placeholder="e.g. Dubai International Airport, T3"
            />
          </FormField>

          <FormField
            id="dropoffLocation"
            label="Drop-off Location"
            required
            error={errors.dropoffLocation}
          >
            <input
              id="dropoffLocation"
              name="dropoffLocation"
              type="text"
              value={form.dropoffLocation}
              onChange={(e) => update("dropoffLocation", e.target.value)}
              aria-describedby={
                errors.dropoffLocation ? "dropoffLocation-error" : undefined
              }
              aria-invalid={Boolean(errors.dropoffLocation)}
              className={`field-input ${errors.dropoffLocation ? "field-input-error" : ""}`}
              placeholder="e.g. Burj Al Arab, Jumeirah"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField id="date" label="Date" required error={errors.date}>
            <input
              id="date"
              name="date"
              type="date"
              min={todayISO}
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              aria-describedby={errors.date ? "date-error" : undefined}
              aria-invalid={Boolean(errors.date)}
              className={`field-input ${errors.date ? "field-input-error" : ""}`}
            />
          </FormField>

          <FormField id="time" label="Time" required error={errors.time}>
            <input
              id="time"
              name="time"
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              aria-describedby={errors.time ? "time-error" : undefined}
              aria-invalid={Boolean(errors.time)}
              className={`field-input ${errors.time ? "field-input-error" : ""}`}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-6">
        <FormSectionHeading step={3} title="Vehicle & Requirements" />

        <FormField id="vehicle" label="Vehicle Selection" required error={errors.vehicle}>
          <select
            id="vehicle"
            name="vehicle"
            value={form.vehicle}
            onChange={(e) => update("vehicle", e.target.value)}
            aria-describedby={errors.vehicle ? "vehicle-error" : undefined}
            aria-invalid={Boolean(errors.vehicle)}
            className={`field-input ${errors.vehicle ? "field-input-error" : ""}`}
          >
            <option value="">Select a vehicle</option>
            {FLEET.map((vehicle) => (
              <option key={vehicle.slug} value={vehicle.name}>
                {vehicle.name} — {vehicle.category}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            id="passengers"
            label="Passenger Count"
            required
            error={errors.passengers}
          >
            <input
              id="passengers"
              name="passengers"
              type="number"
              min={1}
              max={14}
              value={form.passengers}
              onChange={(e) => update("passengers", Number(e.target.value))}
              aria-describedby={errors.passengers ? "passengers-error" : undefined}
              aria-invalid={Boolean(errors.passengers)}
              className={`field-input ${errors.passengers ? "field-input-error" : ""}`}
            />
          </FormField>

          <FormField
            id="hours"
            label="Number of Hours"
            hint="Leave as one-way if this isn't an hourly hire."
          >
            <select
              id="hours"
              name="hours"
              value={form.hours}
              onChange={(e) => update("hours", e.target.value)}
              aria-describedby="hours-hint"
              className="field-input"
            >
              <option value="">Select duration</option>
              {HOUR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          id="specialRequests"
          label="Special Requests"
          hint="Child seats, meet-and-greet signage, extra stops, accessibility needs, etc."
        >
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows={4}
            value={form.specialRequests}
            onChange={(e) => update("specialRequests", e.target.value)}
            aria-describedby="specialRequests-hint"
            className="field-input resize-none"
            placeholder="Anything our chauffeur should know in advance"
          />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Submitting…
          </>
        ) : (
          "Reserve Chauffeur"
        )}
      </button>
    </form>
  );
}

/**
 * Public entry point. Wrapped in Suspense here (rather than in the page
 * that renders it) because useSearchParams requires a Suspense boundary
 * during static rendering — keeping the boundary inside this file means
 * app/booking/page.tsx doesn't need to know about it.
 */
export default function BookingForm() {
  return (
    <Suspense fallback={<BookingFormSkeleton />}>
      <BookingFormFields />
    </Suspense>
  );
}
