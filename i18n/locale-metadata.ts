import type { Locale } from "./routing";

/** Static display data for the language switcher — no provider needed. */
export interface LocaleMeta {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LOCALE_METADATA: LocaleMeta[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇦🇪" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "Chinese (Simplified)", nativeLabel: "中文", flag: "🇨🇳" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
  { code: "de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪" },
];

const RTL_LOCALES: ReadonlySet<string> = new Set(["ar"]);

/** True for any locale that reads right-to-left — currently just Arabic,
 *  but written against the full set so a future RTL locale (e.g. Hebrew,
 *  Urdu) only needs adding here, not at each call site. */
export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}
