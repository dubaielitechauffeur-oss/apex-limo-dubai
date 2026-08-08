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

/** Formats a whole-AED chauffeur rate for display, e.g. 2500 -> "AED 2,500".
 *  Thousands separator uses "en-US" regardless of locale — Arabic-indic
 *  digit variants would defeat the `<Ltr>` wrapper callers use around this
 *  string, and AED amounts are conventionally shown in Western digits
 *  site-wide (see the phone number formatting this same pattern follows). */
export function formatAedPrice(amount: number): string {
  return `AED ${new Intl.NumberFormat("en-US").format(amount)}`;
}
