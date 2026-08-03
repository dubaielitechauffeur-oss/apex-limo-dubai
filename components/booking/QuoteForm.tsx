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
import { getWhatsAppLink } from "@/lib/constants";
import type { QuoteFormData } from "@/lib/types";
import { buildValidationMessages, validateQuoteForm, hasErrors, type FormErrors, type ValidationMessages } from "@/lib/validation";

const EMPTY_FORM: QuoteFormData = {
  fullName: "",
  phone: "",
  email: "",
  serviceType: "",
  pickupLocation: "",
  date: "",
  vehicle: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

/** Trimmed, locale-resolved service data — just enough for the dropdown and
 *  ?service= prefill, so the client bundle doesn't ship every locale's full
 *  service content (descriptions, FAQs, etc.) that a Server Component parent
 *  already localized via getAllServices(). */
export interface ServiceOption {
  slug: string;
  name: string;
}

/** Trimmed, locale-resolved location data — just enough for the ?location=
 *  prefill, mirroring ServiceOption's client-bundle-bloat fix above. */
export interface LocationOption {
  slug: string;
  name: string;
}

/** Trimmed, locale-resolved fleet data — just enough for the ?vehicle=
 *  prefill and the vehicle dropdown, mirroring ServiceOption's
 *  client-bundle-bloat fix above (the full FLEET array holds every
 *  locale's vehicle copy, which must never ship to this client bundle). */
export interface VehicleOption {
  slug: string;
  name: string;
  category: string;
}

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
function buildInitialQuoteForm(
  searchParams: ReturnType<typeof useSearchParams>,
  services: ServiceOption[],
  locations: LocationOption[],
  vehicles: VehicleOption[]
): QuoteFormData {
  const form: QuoteFormData = { ...EMPTY_FORM };

  const vehicleSlug = searchParams.get("vehicle");
  if (vehicleSlug) {
    const vehicle = vehicles.find((v) => v.slug === vehicleSlug);
    if (vehicle) form.vehicle = vehicle.name;
  }

  const serviceSlug = searchParams.get("service");
  if (serviceSlug) {
    const service = services.find((s) => s.slug === serviceSlug);
    if (service) form.serviceType = service.name;
  }

  const locationSlug = searchParams.get("location");
  if (locationSlug) {
    const location = locations.find((l) => l.slug === locationSlug);
    form.pickupLocation = location ? location.name : prettifySlug(locationSlug);
  }

  return form;
}

function QuoteFormSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 animate-pulse bg-obsidian-light" />
      ))}
    </div>
  );
}

function QuoteFormFields({
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
  const [form, setForm] = useState<QuoteFormData>(() =>
    buildInitialQuoteForm(searchParams, services, locations, vehicles)
  );
  const [errors, setErrors] = useState<FormErrors<QuoteFormData>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [preservedMinHeight, setPreservedMinHeight] = useState<number | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const todayISO = new Date().toISOString().split("T")[0];

  const validationMessages: ValidationMessages = buildValidationMessages(t);

  function update<K extends keyof QuoteFormData>(key: K, value: QuoteFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateQuoteForm(form, validationMessages);
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
      const res = await fetch("/api/quote", {
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
          {customerName ? t("quote.thankYouName", { name: customerName }) : t("quote.thankYou")}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-smoke">
          {t("quote.successBody")}
          {reference ? (
            <>
              {" "}
              {t("quote.referenceLabel")}{" "}
              <span className="font-semibold text-gold">{reference}</span>.
            </>
          ) : null}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <CTAButton
            href={getWhatsAppLink(
              t("quote.followUpMessageTemplate", {
                refPart: reference ? t("quote.refPartTemplate", { reference }) : "",
              })
            )}
            external
          >
            {t("quote.followUpWhatsapp")}
          </CTAButton>
          <button
            onClick={() => {
              setPreservedMinHeight(undefined);
              setStatus("idle");
            }}
            className="btn-outline"
            type="button"
          >
            {t("quote.requestAnother")}
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
          <FormField id="q-fullName" label={t("fields.fullName")} required error={errors.fullName}>
            <input
              id="q-fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              aria-describedby={errors.fullName ? "q-fullName-error" : undefined}
              aria-invalid={Boolean(errors.fullName)}
              className={`field-input ${errors.fullName ? "field-input-error" : ""}`}
              placeholder={t("fields.fullNamePlaceholder")}
            />
          </FormField>

          <FormField id="q-phone" label={t("fields.phone")} required error={errors.phone}>
            <PhoneInputField
              id="q-phone"
              value={form.phone}
              onChange={(value) => update("phone", value)}
              error={Boolean(errors.phone)}
              ariaDescribedBy={errors.phone ? "q-phone-error" : undefined}
            />
          </FormField>
        </div>

        <FormField id="q-email" label={t("fields.email")} required error={errors.email}>
          <input
            id="q-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-describedby={errors.email ? "q-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            className={`field-input ${errors.email ? "field-input-error" : ""}`}
            placeholder={t("fields.emailPlaceholder")}
          />
        </FormField>
      </div>

      <div className="space-y-6">
        <FormSectionHeading step={2} title={t("sections.journeyDetails")} />

        <FormField
          id="q-serviceType"
          label={t("fields.serviceNeeded")}
          required
          error={errors.serviceType}
        >
          <select
            id="q-serviceType"
            name="serviceType"
            value={form.serviceType}
            onChange={(e) => update("serviceType", e.target.value)}
            aria-describedby={errors.serviceType ? "q-serviceType-error" : undefined}
            aria-invalid={Boolean(errors.serviceType)}
            className={`field-input ${errors.serviceType ? "field-input-error" : ""}`}
          >
            <option value="">{t("fields.selectService")}</option>
            {services.map((service) => (
              <option key={service.slug} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            id="q-pickupLocation"
            label={t("fields.pickupLocation")}
            required
            error={errors.pickupLocation}
          >
            <input
              id="q-pickupLocation"
              name="pickupLocation"
              type="text"
              value={form.pickupLocation}
              onChange={(e) => update("pickupLocation", e.target.value)}
              aria-describedby={
                errors.pickupLocation ? "q-pickupLocation-error" : undefined
              }
              aria-invalid={Boolean(errors.pickupLocation)}
              className={`field-input ${errors.pickupLocation ? "field-input-error" : ""}`}
              placeholder={t("fields.pickupLocationPlaceholderCity")}
            />
          </FormField>

          <FormField id="q-date" label={t("fields.dateOptional")} error={errors.date}>
            <input
              id="q-date"
              name="date"
              type="date"
              min={todayISO}
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              aria-describedby={errors.date ? "q-date-error" : undefined}
              aria-invalid={Boolean(errors.date)}
              className={`field-input ${errors.date ? "field-input-error" : ""}`}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-6">
        <FormSectionHeading step={3} title={t("sections.vehicleAndRequirements")} />

        <FormField id="q-vehicle" label={t("fields.vehicleOptional")}>
          <select
            id="q-vehicle"
            name="vehicle"
            value={form.vehicle}
            onChange={(e) => update("vehicle", e.target.value)}
            className="field-input"
          >
            <option value="">{t("fields.noPreference")}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.slug} value={vehicle.name}>
                {vehicle.name} — {vehicle.category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="q-message"
          label={t("fields.tellUsMore")}
          hint={t("fields.tellUsMoreHint")}
        >
          <textarea
            id="q-message"
            name="message"
            rows={4}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            aria-describedby="q-message-hint"
            className="field-input resize-none"
            placeholder={t("fields.tellUsMorePlaceholder")}
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
            {t("quote.sending")}
          </>
        ) : (
          t("quote.submit")
        )}
      </button>
    </form>
  );
}

/**
 * Public entry point. Wrapped in Suspense here (rather than in the page
 * that renders it) because useSearchParams requires a Suspense boundary
 * during static rendering — keeping the boundary inside this file means
 * app/quote/page.tsx doesn't need to know about it.
 */
export default function QuoteForm({
  services,
  locations,
  vehicles,
}: {
  services: ServiceOption[];
  locations: LocationOption[];
  vehicles: VehicleOption[];
}) {
  return (
    <Suspense fallback={<QuoteFormSkeleton />}>
      <QuoteFormFields services={services} locations={locations} vehicles={vehicles} />
    </Suspense>
  );
}
