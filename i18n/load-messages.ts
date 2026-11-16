import type { Locale } from "./routing";

/**
 * Loads every message namespace for one locale.
 *
 * Shared by the per-request config (`i18n/request.ts`) and the admin Page SEO
 * editor, which shows each heading's built-in text as the "leave blank to
 * keep" default — both must see exactly the same set of namespaces. Add a
 * namespace here when a new `messages/<locale>/<name>.json` file is
 * introduced.
 */
export async function loadMessages(locale: Locale) {
  const [common, home, services, locations, fleet, blog, about, contact, faqs, metadata, legal, forms] = await Promise.all([
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
    import(`../messages/${locale}/forms.json`).then((m) => m.default),
  ]);

  return { common, home, services, locations, fleet, blog, about, contact, faqs, metadata, legal, forms };
}
