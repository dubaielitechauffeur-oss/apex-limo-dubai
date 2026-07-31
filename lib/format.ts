import type { Locale } from "@/i18n/routing";

/** BCP-47 tag per site locale, for Intl.DateTimeFormat. */
const DATE_LOCALE_MAP: Record<Locale, string> = {
  en: "en-GB",
  ar: "ar-AE",
  ru: "ru-RU",
  zh: "zh-CN",
  fr: "fr-FR",
  de: "de-DE",
};

/** Formats an ISO date string (e.g. "2026-06-15") for display, e.g. "15 June 2026". */
export function formatDate(iso: string, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(DATE_LOCALE_MAP[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
