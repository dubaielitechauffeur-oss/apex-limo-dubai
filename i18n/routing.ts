import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for supported locales. Every other i18n file
 * (navigation, request config, middleware) imports from here.
 */
export const routing = defineRouting({
  locales: ["en", "ar", "ru", "zh", "fr", "de"],
  defaultLocale: "en",
  // Default locale is unprefixed ("/"), the other five are prefixed
  // ("/ar", "/ru", ...) — matches the requested URL structure exactly.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
