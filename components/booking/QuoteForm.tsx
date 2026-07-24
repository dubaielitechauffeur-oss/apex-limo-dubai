"use client";

import { useState, useRef, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import FormField from "@/components/shared/FormField";
import FormSectionHeading from "@/components/shared/FormSectionHeading";
import PhoneInputField from "@/components/shared/PhoneInputField";
import CTAButton from "@/components/shared/CTAButton";
import { SERVICES, getWhatsAppLink } from "@/lib/constants";
import { FLEET } from "@/data/fleet";
import { LOCATIONS } from "@/data/locations";
import type { QuoteFormData } from "@/lib/types";
import { validateQuoteForm, hasErrors, type FormErrors } from "@/lib/validation";

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
  searchParams: ReturnType<typeof useSearchParams>
): QuoteFormData {
  const form: QuoteFormData = { ...EMPTY_FORM };

  const vehicleSlug = searchParams.get("vehicle");
  if (vehicleSlug) {
    const vehicle = FLEET.find((v) => v.slug === vehicleSlug);
    if (vehicle) form.vehicle = vehicle.name;
  }

  const serviceSlug = searchParams.get("service");
  if (serviceSlug) {
    const service = SERVICES.find((s) => s.slug === serviceSlug);
    if (service) form.serviceType = service.name;
  }

  const locationSlug = searchParams.get("location");
  if (locationSlug) {
    const location = LOCATIONS.find((l) => l.slug === locationSlug);
    form.pickupLocation = location ? location.name : prettifySlug(locationSlug);
  }

  return form;
}

function QuoteFormSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 animate-pulse bg-[#1A1A1A]" />
      ))}
    </div>
  );
}

function QuoteFormFields() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<QuoteFormData>(() =>
    buildInitialQuoteForm(searchParams)
  );
  const [errors, setErrors] = useState<FormErrors<QuoteFormData>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [preservedMinHeight, setPreservedMinHeight] = useState<number | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const todayISO = new Date().toISOString().split("T")[0];

  function update<K extends keyof QuoteFormData>(key: K, value: QuoteFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateQuoteForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      setStatus("error");
      setServerMessage("Please correct the highlighted fields and try again.");
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch("/api/quote", {
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
      setServerMessage(
        "We couldn't reach our server. Please try again or WhatsApp us directly."
      );
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        style={preservedMinHeight ? { minHeight: preservedMinHeight } : undefined}
        className="flex flex-col items-center justify-end rounded-2xl border border-[rgba(201,161,74,0.25)] bg-[#111111] p-10 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-[#C9A14A]" strokeWidth={1.5} />
        <h3 className="mt-5 font-display text-2xl text-white">
          {customerName ? `Thank you, ${customerName}!` : "Thank You!"}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#B8B8B8]">
          Your quote request has been submitted successfully. Our team will
          get back to you shortly with pricing and availability.
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
              `Hello Apex Limo, I just requested a quote${
                reference ? ` (ref: ${reference})` : ""
              } and wanted to follow up.`
            )}
            external
          >
            Follow Up on WhatsApp
          </CTAButton>
          <button
            onClick={() => {
              setPreservedMinHeight(undefined);
              setStatus("idle");
            }}
            className="btn-outline"
            type="button"
          >
            Request Another Quote
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

      <div className="space-y-6">
        <FormSectionHeading step={1} title="Personal Details" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField id="q-fullName" label="Full Name" required error={errors.fullName}>
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
              placeholder="e.g. James Carter"
            />
          </FormField>

          <FormField id="q-phone" label="Phone Number" required error={errors.phone}>
            <PhoneInputField
              id="q-phone"
              value={form.phone}
              onChange={(value) => update("phone", value)}
              error={Boolean(errors.phone)}
              ariaDescribedBy={errors.phone ? "q-phone-error" : undefined}
            />
          </FormField>
        </div>

        <FormField id="q-email" label="Email" required error={errors.email}>
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
            placeholder="you@company.com"
          />
        </FormField>
      </div>

      <div className="space-y-6">
        <FormSectionHeading step={2} title="Journey Details" />

        <FormField
          id="q-serviceType"
          label="Service Needed"
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
            <option value="">Select a service</option>
            {SERVICES.map((service) => (
              <option key={service.slug} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            id="q-pickupLocation"
            label="Pickup Location"
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
              placeholder="e.g. Dubai Marina"
            />
          </FormField>

          <FormField id="q-date" label="Date (if known)" error={errors.date}>
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
        <FormSectionHeading step={3} title="Vehicle & Requirements" />

        <FormField id="q-vehicle" label="Preferred Vehicle (optional)">
          <select
            id="q-vehicle"
            name="vehicle"
            value={form.vehicle}
            onChange={(e) => update("vehicle", e.target.value)}
            className="field-input"
          >
            <option value="">No preference</option>
            {FLEET.map((vehicle) => (
              <option key={vehicle.slug} value={vehicle.name}>
                {vehicle.name} — {vehicle.category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="q-message"
          label="Tell Us More"
          hint="Trip details, number of passengers, or anything that helps us quote accurately."
        >
          <textarea
            id="q-message"
            name="message"
            rows={4}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            aria-describedby="q-message-hint"
            className="field-input resize-none"
            placeholder="Optional — the more detail, the more accurate the quote"
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
            Sending…
          </>
        ) : (
          "Request Instant Quote"
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
export default function QuoteForm() {
  return (
    <Suspense fallback={<QuoteFormSkeleton />}>
      <QuoteFormFields />
    </Suspense>
  );
}
