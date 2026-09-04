import { describe, it, expect } from "vitest";
import { resolvePublicSeo, collectOgImageIds } from "@/lib/public/seo-fields";
import { availableLocalesFor, narrowLocales } from "@/lib/public/translation-coverage";
import { clampDescription } from "@/lib/seo";

/**
 * Guards the SEO Manager → public metadata pipeline.
 *
 * Before this existed, the `seo` JSON column was written by the admin panel
 * for services, locations and vehicles and read by nobody: custom titles,
 * canonicals and OG images never shipped, and `noIndex` was a safety control
 * that reported success and did nothing.
 */
describe("resolvePublicSeo", () => {
  const og = new Map([["media-1", "https://cdn.example.com/og.jpg"]]);

  it("returns null when nothing is configured, so callers keep the page template", () => {
    expect(resolvePublicSeo(null, "en")).toBeNull();
    expect(resolvePublicSeo({}, "en")).toBeNull();
    expect(
      resolvePublicSeo({ title: { en: "" }, description: { en: "" }, noIndex: false }, "en")
    ).toBeNull();
  });

  it("resolves the requested locale, falling back to English", () => {
    const value = { title: { en: "English title", de: "Deutscher Titel" } };
    expect(resolvePublicSeo(value, "de")?.title).toBe("Deutscher Titel");
    expect(resolvePublicSeo(value, "ar")?.title).toBe("English title");
  });

  it("carries noIndex and noFollow through as real booleans", () => {
    const seo = resolvePublicSeo({ noIndex: true, noFollow: true }, "en");
    expect(seo?.noIndex).toBe(true);
    expect(seo?.noFollow).toBe(true);
  });

  it("treats a non-true noIndex as false rather than truthy", () => {
    // Guards against a string "false" from a form ever reading as noindex.
    expect(resolvePublicSeo({ noIndex: "false", title: { en: "t" } }, "en")?.noIndex).toBe(false);
  });

  it("resolves an OG image id through the batched media map", () => {
    expect(resolvePublicSeo({ ogImageId: "media-1" }, "en", og)?.ogImageUrl).toBe(
      "https://cdn.example.com/og.jpg"
    );
  });

  it("degrades to no OG override when the media row is gone", () => {
    // A soft-deleted image must not emit a dead URL into Open Graph tags.
    expect(resolvePublicSeo({ ogImageId: "deleted", title: { en: "t" } }, "en", og)?.ogImageUrl).toBeNull();
  });

  it("trims a blank canonical to null so the page keeps its self-referencing one", () => {
    expect(resolvePublicSeo({ canonical: "   ", title: { en: "t" } }, "en")?.canonical).toBeNull();
    expect(resolvePublicSeo({ canonical: " https://x.test/a " }, "en")?.canonical).toBe("https://x.test/a");
  });
});

describe("collectOgImageIds", () => {
  it("deduplicates ids across rows for a single batched lookup", () => {
    const ids = collectOgImageIds([
      { seo: { ogImageId: "a" } },
      { seo: { ogImageId: "a" } },
      { seo: { ogImageId: "b" } },
      { seo: {} },
      { seo: null },
      {},
    ]);
    expect(ids.sort()).toEqual(["a", "b"]);
  });
});

/**
 * Guards the hreflang/sitemap translation gate. The CMS requires only English,
 * and the reader falls back to English for a missing locale — so without this
 * an English-only row still advertised six translated URLs.
 */
describe("availableLocalesFor", () => {
  const full = (v: string) => ({ en: v, ar: v, ru: v, zh: v, fr: v, de: v });

  it("returns every locale when all required fields are translated", () => {
    expect(availableLocalesFor([full("x"), full("y")]).sort()).toEqual(
      ["ar", "de", "en", "fr", "ru", "zh"].sort()
    );
  });

  it("returns English alone for an English-only row", () => {
    const partial = { en: "only english", ar: "", ru: "", zh: "", fr: "", de: "" };
    expect(availableLocalesFor([partial])).toEqual(["en"]);
  });

  it("requires EVERY field, not just one — a translated title over English body does not count", () => {
    const title = full("translated");
    const body = { en: "body", ar: "", ru: "", zh: "", fr: "", de: "" };
    expect(availableLocalesFor([title, body])).toEqual(["en"]);
  });

  it("treats whitespace-only copy as untranslated", () => {
    expect(availableLocalesFor([{ en: "x", de: "   ", ar: "", ru: "", zh: "", fr: "" }])).toEqual(["en"]);
  });

  it("handles array fields, requiring at least one non-empty entry", () => {
    const arrays = { en: ["a"], de: ["b"], ar: [], ru: [""], zh: [], fr: [] };
    expect(availableLocalesFor([arrays]).sort()).toEqual(["de", "en"]);
  });

  it("always includes the default locale, even for a malformed row", () => {
    expect(availableLocalesFor([{ de: "only german" }])).toContain("en");
  });
});

describe("narrowLocales", () => {
  it("returns undefined for a fully translated row so callers skip the narrowing", () => {
    expect(narrowLocales(["en", "ar", "ru", "zh", "fr", "de"])).toBeUndefined();
    expect(narrowLocales(undefined)).toBeUndefined();
  });

  it("passes a partial list through", () => {
    expect(narrowLocales(["en"])).toEqual(["en"]);
  });
});

/**
 * Every page type was shipping a meta description past Google's ~160-character
 * render limit (166–231), so the tail — usually the call to action — was never
 * seen by a searcher.
 */
describe("clampDescription", () => {
  it("leaves a description within budget untouched", () => {
    const short = "Luxury chauffeur service in Dubai.";
    expect(clampDescription(short)).toBe(short);
  });

  it("clamps an over-length description below the limit", () => {
    const long = "Book the Mercedes-Benz S-Class with a professional chauffeur in Dubai. ".repeat(5);
    const out = clampDescription(long);
    expect(out.length).toBeLessThanOrEqual(158);
    expect(out.endsWith("…")).toBe(true);
  });

  it("cuts on a word boundary for space-separated scripts", () => {
    const long = "word ".repeat(80);
    const out = clampDescription(long);
    expect(out).not.toMatch(/wor…$/);
  });

  it("still clamps a script with no spaces (Chinese)", () => {
    const zh = "迪拜豪华专属司机服务".repeat(40);
    const out = clampDescription(zh);
    expect(out.length).toBeLessThanOrEqual(158);
    expect(out.endsWith("…")).toBe(true);
  });

  it("does not leave dangling punctuation before the ellipsis", () => {
    const out = clampDescription("Dubai chauffeur service, ".repeat(20));
    expect(out).not.toMatch(/[,\s]…$/);
  });
});
