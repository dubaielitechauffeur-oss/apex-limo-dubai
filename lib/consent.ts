/**
 * Where analytics consent is legally required before cookies may be set.
 *
 * The site ships French and German locales and markets to European travellers,
 * so GDPR/ePrivacy applies to a real share of its traffic — but Google
 * Analytics was previously injected unconditionally on every page, in every
 * locale, with no consent mechanism of any kind in the codebase. Since March
 * 2024 Google additionally requires Consent Mode v2 signals for EEA traffic,
 * without which that traffic's data is discarded or modelled regardless.
 *
 * The list is the EEA (EU 27 + Iceland, Liechtenstein, Norway) plus the UK
 * (UK GDPR/PECR) and Switzerland (revFADP). Kept as data rather than a
 * regex/heuristic so adding or removing a jurisdiction is a one-line edit with
 * an obvious diff.
 */
const CONSENT_REQUIRED_COUNTRIES: ReadonlySet<string> = new Set([
  // EU 27
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // EEA non-EU
  "IS", "LI", "NO",
  // UK GDPR / PECR
  "GB",
  // Swiss revFADP
  "CH",
]);

/**
 * True when this visitor must opt in before analytics storage is allowed.
 *
 * `country` comes from the edge/CDN geo header, which is absent in local
 * development and on any host that doesn't provide one. An unknown origin is
 * treated as REQUIRING consent — failing closed is the only defensible
 * default for a privacy control, and it also means the banner is exercised in
 * development instead of silently never rendering.
 */
export function requiresAnalyticsConsent(country: string | null | undefined): boolean {
  if (!country) return true;
  return CONSENT_REQUIRED_COUNTRIES.has(country.toUpperCase());
}

/** Key used for the stored decision. Versioned so a future change to what we
 *  ask for can invalidate old answers rather than silently inheriting them. */
export const CONSENT_STORAGE_KEY = "apex-analytics-consent-v1";

export type ConsentDecision = "granted" | "denied";
