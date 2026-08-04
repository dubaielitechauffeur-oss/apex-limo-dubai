"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import PhoneInput, { type Labels } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

interface PhoneInputFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  ariaDescribedBy?: string;
}

/** react-phone-number-input ships a per-locale country-name label file
 *  (~5-8KB each); loaded dynamically per the active locale rather than
 *  statically importing all 6, so no visitor's bundle carries country
 *  names for languages they aren't viewing. English needs no fetch — it's
 *  the library's own default label set. */
async function loadCountryLabels(locale: string): Promise<Labels | undefined> {
  if (locale === "en") return undefined;
  switch (locale) {
    case "ar":
      return (await import("react-phone-number-input/locale/ar.json")).default;
    case "ru":
      return (await import("react-phone-number-input/locale/ru.json")).default;
    case "zh":
      return (await import("react-phone-number-input/locale/zh.json")).default;
    case "fr":
      return (await import("react-phone-number-input/locale/fr.json")).default;
    case "de":
      return (await import("react-phone-number-input/locale/de.json")).default;
    default:
      return undefined;
  }
}

/**
 * International phone input — country flag + code selector defaulting to
 * the UAE, with automatic formatting as the user types. Wraps
 * react-phone-number-input, scoped via the `.phone-field` class in
 * globals.css so its styling never leaks into unrelated inputs.
 *
 * `flags` is passed explicitly (bundled inline SVGs from `country-flag-icons`,
 * re-exported via `react-phone-number-input/flags`) rather than left to the
 * library's default, which fetches each flag as an `<img>` from
 * `purecatamphetamine.github.io` — a third-party host outside the site's
 * `img-src` CSP allowlist, so every flag silently failed to load (broken
 * icon, CSP violation in the console) with the default.
 */
export default function PhoneInputField({
  id,
  value,
  onChange,
  error,
  ariaDescribedBy,
}: PhoneInputFieldProps) {
  const t = useTranslations("forms.fields");
  const locale = useLocale();
  const [labels, setLabels] = useState<Labels | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadCountryLabels(locale).then((loaded) => {
      if (!cancelled) setLabels(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <div className={`phone-field ${error ? "phone-field-error" : ""}`}>
      <PhoneInput
        id={id}
        international
        defaultCountry="AE"
        value={value}
        onChange={(next) => onChange(next ?? "")}
        aria-describedby={ariaDescribedBy}
        aria-invalid={error}
        placeholder={t("phonePlaceholder")}
        labels={labels}
        flags={flags}
      />
    </div>
  );
}
