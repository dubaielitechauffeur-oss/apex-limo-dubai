import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Per-request message loading. Namespaces are added here as later phases
 * introduce them (fleet/services/locations/blog/forms/metadata) — "common"
 * (nav/footer/CTA/misc chrome) shipped in Phase A, "home" is the first
 * Phase B addition.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const [common, home] = await Promise.all([
    import(`../messages/${locale}/common.json`).then((m) => m.default),
    import(`../messages/${locale}/home.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      common,
      home,
    },
  };
});
