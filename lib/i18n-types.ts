import type { Locale } from "@/i18n/routing";

/**
 * A value with one translation per supported locale. Content data files
 * (fleet/services/locations/blog) use this for locale-variant text fields;
 * locale-invariant fields (slugs, images, numbers) stay plain.
 */
export type Localized<T = string> = Record<Locale, T>;
