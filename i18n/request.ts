import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

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

  const [common, home, services, locations, fleet, blog, about, contact, faqs, metadata, legal] = await Promise.all([
    import(`../messages/${locale}/common.json`).then((m) => m.default),
    import(`../messages/${locale}/home.json`).then((m) => m.default),
    import(`../messages/${locale}/services.json`).then((m) => m.default),
    import(`../messages/${locale}/locations.json`).then((m) => m.default),
    import(`../messages/${locale}/fleet.json`).then((m) => m.default),
    import(`../messages/${locale}/blog.json`).then((m) => m.default),
    import(`../messages/${locale}/about.json`).then((m) => m.default),
    import(`../messages/${locale}/contact.json`).then((m) => m.default),
    import(`../messages/${locale}/faqs.json`).then((m) => m.default),
    import(`../messages/${locale}/metadata.json`).then((m) => m.default),
    import(`../messages/${locale}/legal.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      common,
      home,
      services,
      locations,
      fleet,
      blog,
      about,
      contact,
      faqs,
      metadata,
      legal,
    },
  };
});
