"use client";

import { useState, FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import FormField from "@/components/shared/FormField";
import PhoneInputField from "@/components/shared/PhoneInputField";
import HoneypotField from "@/components/shared/HoneypotField";
import CTAButton from "@/components/shared/CTAButton";
import { getWhatsAppLink } from "@/lib/constants";
import type { ContactFormData } from "@/lib/types";
import { buildValidationMessages, validateContactForm, hasErrors, type FormErrors, type ValidationMessages } from "@/lib/validation";

const EMPTY_FORM: ContactFormData = {
  fullName: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Fully functional contact form — posts to /api/contact, sharing the same
 * validation/spam-protection/email-notification pipeline as the
 * booking and quote forms (see lib/validation.ts, lib/spam-protection.ts,
 * lib/notifications.ts). Previously this page rendered a static form with
 * no submit handler or backing API route.
 */
export default function ContactForm() {
  const t = useTranslations("contact.form");
  const tForms = useTranslations("forms");
  const locale = useLocale();

  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors<ContactFormData>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [reference, setReference] = useState("");
  const [customerName, setCustomerName] = useState("");

  const validationMessages: ValidationMessages = buildValidationMessages(tForms);

  function update<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formEl = e.currentTarget;
    const validationErrors = validateContactForm(form, validationMessages);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      setStatus("error");
      setServerMessage(tForms("status.correctFields"));
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    const honeypot = (new FormData(formEl).get("company") as string) ?? "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company: honeypot, locale }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setServerMessage(data.message ?? tForms("status.genericError"));
        return;
      }

      setCustomerName(form.fullName.trim());
      setReference(data.reference ?? "");
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
      setServerMessage(tForms("status.networkError"));
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center rounded-2xl border border-gold/25 bg-ink p-10 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-gold" strokeWidth={1.5} />
        <h3 className="mt-5 font-display text-2xl text-white">
          {customerName ? tForms("contact.thankYouName", { name: customerName }) : tForms("contact.thankYou")}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-smoke">
          {tForms("contact.successBody")}
          {reference ? (
            <>
              {" "}
              {tForms("contact.referenceLabel")}{" "}
              <span className="font-semibold text-gold">{reference}</span>.
            </>
          ) : null}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <CTAButton
            href={getWhatsAppLink(
              tForms("contact.followUpMessageTemplate", {
                refPart: reference ? tForms("contact.refPartTemplate", { reference }) : "",
              })
            )}
            external
          >
            {tForms("contact.followUpWhatsapp")}
          </CTAButton>
          <button onClick={() => setStatus("idle")} className="btn-outline" type="button">
            {tForms("contact.sendAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField id="contact-name" label={t("fullName")} required error={errors.fullName}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            aria-describedby={errors.fullName ? "contact-name-error" : undefined}
            aria-invalid={Boolean(errors.fullName)}
            className={`field-input ${errors.fullName ? "field-input-error" : ""}`}
            placeholder={t("fullNamePlaceholder")}
          />
        </FormField>

        <FormField id="contact-phone" label={t("phoneNumber")} required error={errors.phone}>
          <PhoneInputField
            id="contact-phone"
            value={form.phone}
            onChange={(value) => update("phone", value)}
            error={Boolean(errors.phone)}
            ariaDescribedBy={errors.phone ? "contact-phone-error" : undefined}
          />
        </FormField>
      </div>

      <FormField id="contact-email" label={t("email")} required error={errors.email}>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          className={`field-input ${errors.email ? "field-input-error" : ""}`}
          placeholder={t("emailPlaceholder")}
        />
      </FormField>

      <FormField id="contact-subject" label={t("subject")} error={errors.subject}>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          aria-invalid={Boolean(errors.subject)}
          className={`field-input ${errors.subject ? "field-input-error" : ""}`}
          placeholder={t("subjectPlaceholder")}
        />
      </FormField>

      <FormField id="contact-message" label={t("message")} required error={errors.message}>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          aria-invalid={Boolean(errors.message)}
          className={`field-input resize-none ${errors.message ? "field-input-error" : ""}`}
          placeholder={t("messagePlaceholder")}
        />
      </FormField>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            {tForms("contact.sending")}
          </>
        ) : (
          tForms("contact.submit")
        )}
      </button>
      <p className="text-xs text-smoke">{t("disclaimer")}</p>
    </form>
  );
}
