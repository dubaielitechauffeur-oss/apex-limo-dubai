import { describe, it, expect } from "vitest";
import { requiresAnalyticsConsent } from "@/lib/consent";

/**
 * Guards the analytics-consent gate. GA4 previously loaded unconditionally on
 * every page in every locale with no consent mechanism anywhere in the
 * codebase, while the site deliberately ships French and German locales.
 */
describe("requiresAnalyticsConsent", () => {
  it("requires consent across the EEA", () => {
    for (const country of ["DE", "FR", "IE", "IT", "ES", "PL", "NL", "SE", "AT", "PT"]) {
      expect(requiresAnalyticsConsent(country)).toBe(true);
    }
  });

  it("requires consent for the EEA non-EU members, the UK and Switzerland", () => {
    for (const country of ["IS", "LI", "NO", "GB", "CH"]) {
      expect(requiresAnalyticsConsent(country)).toBe(true);
    }
  });

  it("does not require consent outside those jurisdictions", () => {
    // The site's own market, plus its other main source geographies.
    for (const country of ["AE", "SA", "US", "IN", "CN", "RU", "AU"]) {
      expect(requiresAnalyticsConsent(country)).toBe(false);
    }
  });

  it("is case-insensitive, since header casing is not guaranteed", () => {
    expect(requiresAnalyticsConsent("de")).toBe(true);
    expect(requiresAnalyticsConsent("gb")).toBe(true);
    expect(requiresAnalyticsConsent("ae")).toBe(false);
  });

  it("FAILS CLOSED when the geo header is absent", () => {
    // No header means local development or a host that provides no geo. For a
    // privacy control the only defensible default is to ask.
    expect(requiresAnalyticsConsent(null)).toBe(true);
    expect(requiresAnalyticsConsent(undefined)).toBe(true);
    expect(requiresAnalyticsConsent("")).toBe(true);
  });

  it("is decided by geography, not by the visitor's language", () => {
    // A German speaker browsing from Dubai is not covered by GDPR; an English
    // speaker in Ireland is. The locale must never drive this.
    expect(requiresAnalyticsConsent("AE")).toBe(false);
    expect(requiresAnalyticsConsent("IE")).toBe(true);
  });
});
