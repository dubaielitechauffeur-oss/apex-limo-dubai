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
  // No Accept-Language / cookie redirects. The URL alone decides the locale,
  // so every visitor and every crawler (Googlebot, Bingbot, ChatGPT,
  // WhatsApp previews) gets the same response for the same URL. Visitors
  // pick another language with the language switcher.
  localeDetection: false,
  // No HTTP `Link: rel=alternate` header. It always listed all six locales,
  // contradicting the HTML hreflang that `buildMetadata()` narrows to the
  // locales a CMS page is really translated into. The <head> tags are the
  // single hreflang source.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
