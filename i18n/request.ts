import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";
import { loadMessages } from "./load-messages";
import { getMessageOverrides } from "@/lib/public/page-seo";
import { getMessageValue, sanitizeMessageOverride, withMessageValue } from "@/lib/seo-pages/messages";

/**
 * Per-request message loading. Namespaces are added here as later phases
 * introduce them (fleet/locations/blog/forms) — "common" (nav/footer/CTA/
 * misc chrome) shipped in Phase A; "home", "services", "about", "contact",
 * "faqs", "metadata" are Phase B additions.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  let messages = await loadMessages(locale as Locale);

  // Headings edited in the admin "Page SEO" screens (H1/H2/H3 of pages that
  // are built from these message files). Each saved heading replaces exactly
  // one message for this locale; with nothing saved this is a no-op and the
  // imported JSON is returned untouched. `withMessageValue` copies along the
  // path instead of mutating, because the JSON modules are shared singletons.
  for (const [key, value] of await getMessageOverrides(locale as Locale)) {
    const safe = sanitizeMessageOverride(value, getMessageValue(messages, key));
    if (safe) messages = withMessageValue(messages, key, safe);
  }

  return { locale, messages };
});
