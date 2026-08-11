"use client";

import { useState, FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import FormField from "@/components/shared/FormField";
import PhoneInputField from "@/components/shared/PhoneInputField";
import HoneypotField from "@/components/shared/HoneypotField";
import CTAButton from "@/components/shared/CTAButton";
import { getWhatsAppLink } from "@/lib/constants";
import type { PlainFleetVehicle } from "@/data/fleet";
import type { SiteContact } from "@/lib/public/site-contact";
import type { QuoteFormData } from "@/lib/types";
import { buildValidationMessages, validateQuoteForm, hasErrors, type FormErrors, type ValidationMessages } from "@/lib/validation";

interface VehicleHeroQuoteFormProps {
  vehicle: PlainFleetVehicle;
  contact: SiteContact;
}

/** Hardcoded to a real, recognized service so the lead notification reads
 *  sensibly — this compact form trades the full QuoteForm's service picker
 *  for a vehicle-specific duration picker instead (below). */
const SERVICE_TYPE = "Luxury Chauffeur Service";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Compact quote request card for the desktop hero — sits beside the gallery
 * instead of the CTA-button row. Posts to the exact same /api/quote
 * endpoint and QuoteFormData shape as the full QuoteForm (components/booking/QuoteForm.tsx),
 * so no backend/API changes are involved — just a leaner front-end for this
 * one placement. Vehicle and duration are folded into the message field
 * since the API only stores free text there.
 */
export default function VehicleHeroQuoteForm({ vehicle, contact }: VehicleHeroQuoteFormProps) {
  const t = useTranslations("fleet.heroQuoteForm");
  const tDetail = useTranslations("fleet.detail");
  const tForms = useTranslations("forms");
  const locale = useLocale();

  const durationOptions = [
    { label: tDetail("twoHours"), value: "2 Hours" },
    { label: tDetail("fiveHours"), value: "5 Hours" },
    { label: tDetail("tenHours"), value: "10 Hours" },
    { label: tDetail("airportTransfer"), value: "Airport Transfer" },
    { label: tDetail("pointToPoint"), value: "Point-to-Point Transfer" },
  ];

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(durationOptions[0].value);
  const [errors, setErrors] = useState<FormErrors<QuoteFormData>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [reference, setReference] = useState("");
  const todayISO = new Date().toISOString().split("T")[0];

  const validationMessages: ValidationMessages = buildValidationMessages(tForms);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload: QuoteFormData = {
      fullName,
      phone,
      email,
      serviceType: SERVICE_TYPE,
      pickupLocation,
      date,
      vehicle: vehicle.name,
      message: `Package: ${duration}. Submitted from the ${vehicle.name} page.`,
    };

    const validationErrors = validateQuoteForm(payload, validationMessages);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      setStatus("error");
      setServerMessage(tForms("status.correctFields"));
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    const honeypot = (new FormData(e.currentTarget).get("company") as string) ?? "";

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, company: honeypot, locale }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setServerMessage(data.message ?? tForms("status.genericError"));
        return;
      }

      setReference(data.reference ?? "");
      setStatus("success");
    } catch {
      setStatus("error");
      setServerMessage(tForms("status.networkError"));
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-center justify-center rounded-2xl border border-gold/20 bg-charcoal p-8 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-gold" strokeWidth={1.5} />
        <h3 className="mt-5 font-display text-2xl text-heading">
          {fullName ? t("thankYouName", { name: fullName.split(" ")[0] }) : t("thankYou")}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-smoke">
          {t("quoteReceivedTemplate", { name: vehicle.name })}
          {reference ? (
            <>
              {" "}
              {t("reference")} <span className="font-semibold text-gold">{reference}</span>.
            </>
          ) : null}
        </p>
        <CTAButton
          href={getWhatsAppLink(
            t("followUpMessageTemplate", {
              name: vehicle.name,
              refPart: reference ? t("refPartTemplate", { reference }) : "",
            }),
            contact.whatsapp
          )}
          external
          className="mt-6"
        >
          {t("followUpWhatsapp")}
        </CTAButton>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gold/20 bg-charcoal p-6 shadow-[0_20px_45px_-28px_rgba(0,0,0,0.9)] xl:p-8">
      <p className="text-[11px] uppercase tracking-wide text-smoke">{tDetail("priceOnRequest")}</p>
      <h3 className="mt-1 font-display text-xl text-heading">{t("requestQuote")}</h3>
      <p className="mt-1 text-xs text-smoke">{t("approxRouteNote")}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        {status === "error" && serverMessage ? (
          <div role="alert" className="flex items-start gap-2 border border-red-400/40 bg-red-400/10 p-3 text-xs text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <p>{serverMessage}</p>
          </div>
        ) : null}

        <HoneypotField />

        <FormField id="hq-fullName" label={tForms("fields.fullName")} required error={errors.fullName}>
          <input
            id="hq-fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            className={`field-input ${errors.fullName ? "field-input-error" : ""}`}
            placeholder={tForms("fields.fullNamePlaceholderShort")}
          />
        </FormField>

        <FormField id="hq-phone" label={tForms("fields.phone")} required error={errors.phone}>
          <PhoneInputField
            id="hq-phone"
            value={phone}
            onChange={setPhone}
            error={Boolean(errors.phone)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="hq-date" label={tForms("fields.date")} error={errors.date}>
            <input
              id="hq-date"
              type="date"
              min={todayISO}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={Boolean(errors.date)}
              className={`field-input ${errors.date ? "field-input-error" : ""}`}
            />
          </FormField>

          <FormField id="hq-duration" label={tForms("fields.package")}>
            <select
              id="hq-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="field-input"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField id="hq-pickup" label={tForms("fields.pickupLocation")} required error={errors.pickupLocation}>
          <input
            id="hq-pickup"
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            aria-invalid={Boolean(errors.pickupLocation)}
            className={`field-input ${errors.pickupLocation ? "field-input-error" : ""}`}
            placeholder={tForms("fields.pickupLocationPlaceholderCity")}
          />
        </FormField>

        <FormField id="hq-email" label={tForms("fields.email")} required error={errors.email}>
          <input
            id="hq-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            className={`field-input ${errors.email ? "field-input-error" : ""}`}
            placeholder={tForms("fields.emailPlaceholder")}
          />
        </FormField>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              {t("sending")}
            </>
          ) : (
            t("submit")
          )}
        </button>

        <p className="text-center text-[11px] text-smoke/70">
          {t("noDepositNote")}
        </p>
      </form>
    </div>
  );
}
