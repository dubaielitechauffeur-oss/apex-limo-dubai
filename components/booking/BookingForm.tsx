"use client";

import { useState, useRef, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import FormField from "@/components/shared/FormField";
import FormSectionHeading from "@/components/shared/FormSectionHeading";
import PhoneInputField from "@/components/shared/PhoneInputField";
import HoneypotField from "@/components/shared/HoneypotField";
import CTAButton from "@/components/shared/CTAButton";
import type { ServiceOption, LocationOption, VehicleOption } from "./QuoteForm";
import { getWhatsAppLink } from "@/lib/constants";
import type { BookingFormData } from "@/lib/types";
import { buildValidationMessages, validateBookingForm, hasErrors, type FormErrors, type ValidationMessages } from "@/lib/validation";

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
  searchParams: ReturnType<typeof useSearchParams>,
  services: ServiceOption[],
  locations: LocationOption[],
  vehicles: VehicleOption[],
  serviceRequestedTemplate: string
): BookingFormData {
  const form: BookingFormData = { ...EMPTY_FORM };

  const vehicleSlug = searchParams.get("vehicle");
  if (vehicleSlug) {
    const vehicle = vehicles.find((v) => v.slug === vehicleSlug);
    if (vehicle) form.vehicle = vehicle.name;
  }

  const locationSlug = searchParams.get("location");
  if (locationSlug) {
    const location = locations.find((l) => l.slug === locationSlug);
    form.pickupLocation = location ? location.name : prettifySlug(locationSlug);
  }

  const serviceSlug = searchParams.get("service");
  if (serviceSlug) {
    const service = services.find((s) => s.slug === serviceSlug);
    const serviceName = service ? service.name : prettifySlug(serviceSlug);
    form.specialRequests = serviceRequestedTemplate.replace("{name}", serviceName);
  }

  return form;
}

function BookingFormSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 animate-pulse bg-obsidian-light" />
      ))}
    </div>
  );
}

function BookingFormFields({
  services,
  locations,
  vehicles,
}: {
  services: ServiceOption[];
  locations: LocationOption[];
  vehicles: VehicleOption[];
}) {
  const t = useTranslations("forms");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<BookingFormData>(() =>
    buildInitialBookingForm(
      searchParams,
      services,
      locations,
      vehicles,
      t("booking.serviceRequestedTemplate")
    )
  );
  const [errors, setErrors] = useState<FormErrors<BookingFormData>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [preservedMinHeight, setPreservedMinHeight] = useState<number | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const todayISO = new Date().toISOString().split("T")[0];

  const hourOptions = [
    t("hourOptions.oneWay"),
    t("hourOptions.twoHours"),
    t("hourOptions.fourHours"),
    t("hourOptions.sixHours"),
    t("hourOptions.eightHours"),
    t("hourOptions.custom"),
  ];

  const validationMessages: ValidationMessages = buildValidationMessages(t);

  function update<K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateBookingForm(form, validationMessages);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      setStatus("error");
      setServerMessage(t("status.correctFields"));
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    const honeypot = (new FormData(e.currentTarget).get("company") as string) ?? "";

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company: honeypot, locale }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setServerMessage(data.message ?? t("status.genericError"));
        return;
      }

      // Capture the form's current rendered height before swapping to the
      // much shorter success view. Without this, the page shrinks out from
      // under the user's scroll position and the browser clamps scrollY to
      // the new (shorter) document height, which visually jumps the page
      // down toward the footer.
      if (formRef.current) {
        setPreservedMinHeight(formRef.current.offsetHeight);
      }
      setCustomerName(form.fullName.trim());
      setReference(data.reference ?? "");
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
      setServerMessage(t("status.networkError"));
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        style={preservedMinHeight ? { minHeight: preservedMinHeight } : undefined}
        className="flex flex-col items-center justify-end rounded-2xl border border-gold/25 bg-ink p-10 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-gold" strokeWidth={1.5} />
        <h3 className="mt-5 font-display text-2xl text-white">
          {customerName ? t("booking.thankYouName", { name: customerName }) : t("booking.thankYou")}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-smoke">
          {t("booking.successBody")}
          {reference ? (
            <>
              {" "}
              {t("booking.referenceLabel")}{" "}
              <span className="font-semibold text-gold">{reference}</span>.
            </>
          ) : null}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <CTAButton
            href={getWhatsAppLink(
              t("booking.confirmMessageTemplate", {
                refPart: reference ? t("booking.refPartTemplate", { reference }) : "",
              })
            )}
            external
          >
            {t("booking.confirmWhatsapp")}
          </CTAButton>
          <button
            onClick={() => {
              setPreservedMinHeight(undefined);
              setStatus("idle");
            }}
            className="btn-outline"
            type="button"
          >
            {t("booking.makeAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-10">
      {status === "error" && serverMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
          <p>{serverMessage}</p>
        </div>
      ) : null}

      <HoneypotField />

      <div className="space-y-6">
        <FormSectionHeading step={1} title={t("sections.personalDetails")} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField id="fullName" label={t("fields.fullName")} required error={errors.fullName}>
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
              placeholder={t("fields.fullNamePlaceholder")}
            />
          </FormField>

          <FormField id="phone" label={t("fields.phone")} required error={errors.phone}>
            <PhoneInputField
              id="phone"
              value={form.phone}
              onChange={(value) => update("phone", value)}
              error={Boolean(errors.phone)}
              ariaDescribedBy={errors.phone ? "phone-error" : undefined}
            />
          </FormField>
        </div>

        <FormField id="email" label={t("fields.email")} required error={errors.email}>
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
            placeholder={t("fields.emailPlaceholder")}
          />
        </FormField>
      </div>

      <div className="space-y-6">
        <FormSectionHeading step={2} title={t("sections.journeyDetails")} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            id="pickupLocation"
            label={t("fields.pickupLocation")}
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
              placeholder={t("fields.pickupLocationPlaceholderAirport")}
            />
          </FormField>

          <FormField
            id="dropoffLocation"
            label={t("fields.dropoffLocation")}
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
              placeholder={t("fields.dropoffLocationPlaceholder")}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField id="date" label={t("fields.date")} required error={errors.date}>
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

          <FormField id="time" label={t("fields.time")} required error={errors.time}>
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
        <FormSectionHeading step={3} title={t("sections.vehicleAndRequirements")} />

        <FormField id="vehicle" label={t("fields.vehicle")} required error={errors.vehicle}>
          <select
            id="vehicle"
            name="vehicle"
            value={form.vehicle}
            onChange={(e) => update("vehicle", e.target.value)}
            aria-describedby={errors.vehicle ? "vehicle-error" : undefined}
            aria-invalid={Boolean(errors.vehicle)}
            className={`field-input ${errors.vehicle ? "field-input-error" : ""}`}
          >
            <option value="">{t("fields.selectVehicle")}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.slug} value={vehicle.name}>
                {vehicle.name} — {vehicle.category}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            id="passengers"
            label={t("fields.passengers")}
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
            label={t("fields.hours")}
            hint={t("fields.hoursHint")}
          >
            <select
              id="hours"
              name="hours"
              value={form.hours}
              onChange={(e) => update("hours", e.target.value)}
              aria-describedby="hours-hint"
              className="field-input"
            >
              <option value="">{t("fields.selectDuration")}</option>
              {hourOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          id="specialRequests"
          label={t("fields.specialRequests")}
          hint={t("fields.specialRequestsHint")}
        >
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows={4}
            value={form.specialRequests}
            onChange={(e) => update("specialRequests", e.target.value)}
            aria-describedby="specialRequests-hint"
            className="field-input resize-none"
            placeholder={t("fields.specialRequestsPlaceholder")}
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
            {t("booking.submitting")}
          </>
        ) : (
          t("booking.submit")
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
export default function BookingForm({
  services,
  locations,
  vehicles,
}: {
  services: ServiceOption[];
  locations: LocationOption[];
  vehicles: VehicleOption[];
}) {
  return (
    <Suspense fallback={<BookingFormSkeleton />}>
      <BookingFormFields services={services} locations={locations} vehicles={vehicles} />
    </Suspense>
  );
}
