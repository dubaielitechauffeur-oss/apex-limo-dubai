import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Per-request message loading. Namespaces are added here as later phases
 * introduce them (home/fleet/services/locations/blog/faqs/forms/metadata) —
 * Phase A only ships "common" (nav/footer/CTA/misc chrome).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const common = (await import(`../messages/${locale}/common.json`)).default;

  return {
    locale,
    messages: {
      common,
    },
  };
});
