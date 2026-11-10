import { describe, it, expect } from "vitest";
import { resolvePublicSeo, collectOgImageIds } from "@/lib/public/seo-fields";
import { availableLocalesFor, narrowLocales, blockContentCopy } from "@/lib/public/translation-coverage";
import { clampDescription, localizedPath, buildMetadata } from "@/lib/seo";

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

describe("localizedPath", () => {
  it("leaves English unprefixed", () => {
    expect(localizedPath("en", "/")).toBe("/");
    expect(localizedPath("en", "/fleet")).toBe("/fleet");
  });

  it("prefixes other locales", () => {
    expect(localizedPath("ar", "/fleet/mercedes-s-class")).toBe("/ar/fleet/mercedes-s-class");
  });

  it("never emits a trailing slash for a translated homepage", () => {
    // `/ar/` 308-redirects to `/ar`, so the slashed form must never reach a
    // canonical, hreflang, sitemap or JSON-LD URL.
    for (const locale of ["ar", "ru", "zh", "fr", "de"] as const) {
      expect(localizedPath(locale, "/")).toBe(`/${locale}`);
    }
  });
});

describe("buildMetadata — untranslated locales", () => {
  const base = { title: "T", description: "D", path: "/fleet/x" } as const;

  it("noindexes (but follows) a locale the page has no translation for, with no hreflang", () => {
    const meta = buildMetadata({ ...base, locale: "ar", alternateLocales: ["en", "de"] });
    expect(meta.robots).toMatchObject({ index: false, follow: true });
    expect(meta.alternates?.languages).toBeUndefined();
    expect(meta.alternates?.canonical).toBe("https://apexchauffeurdubai.com/ar/fleet/x");
  });

  it("leaves a translated locale indexable with its hreflang cluster", () => {
    const meta = buildMetadata({ ...base, locale: "de", alternateLocales: ["en", "de"] });
    expect(meta.robots).toBeUndefined();
    expect(Object.keys(meta.alternates?.languages ?? {})).toEqual(["en", "de", "x-default"]);
  });

  it("leaves fully translated pages untouched", () => {
    expect(buildMetadata({ ...base, locale: "ar" }).robots).toBeUndefined();
  });

  it("keeps a CMS noFollow alongside the untranslated noindex", () => {
    const seo = { title: "", description: "", canonical: null, ogImageUrl: null, noIndex: false, noFollow: true };
    const meta = buildMetadata({ ...base, locale: "ar", alternateLocales: ["en"], seo });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});

describe("buildMetadata — CMS canonical override", () => {
  const seo = {
    title: "",
    description: "",
    canonical: "https://apexchauffeurdubai.com/services/airport-transfers",
    ogImageUrl: null,
    noIndex: false,
    noFollow: false,
  };

  it("applies on the default locale", () => {
    const meta = buildMetadata({ locale: "en", title: "T", description: "D", path: "/services/x", seo });
    expect(meta.alternates?.canonical).toBe(seo.canonical);
  });

  it("does not repoint translations at the English URL", () => {
    const meta = buildMetadata({ locale: "fr", title: "T", description: "D", path: "/services/x", seo });
    expect(meta.alternates?.canonical).toBe("https://apexchauffeurdubai.com/fr/services/x");
  });
});

describe("blockContentCopy", () => {
  it("counts a locale only when some block has text in it", () => {
    const content = [
      { type: "heading", text: { en: "Hello", ar: "مرحبا" } },
      { type: "paragraph", text: { en: "Body", ar: "" } },
      { type: "list", items: { en: ["a"], de: ["b"] } },
      { type: "faq", items: [{ question: { en: "Q?", fr: "Q ?" }, answer: { en: "A" } }] },
    ];
    expect(availableLocalesFor([blockContentCopy(content)])).toEqual(["en", "ar", "fr", "de"]);
  });

  it("treats an English-only body as English-only", () => {
    const content = [{ type: "paragraph", text: { en: "Only English" } }];
    const title = { en: "T", ar: "ع", ru: "Т", zh: "标", fr: "T", de: "T" };
    expect(availableLocalesFor([title, blockContentCopy(content)])).toEqual(["en"]);
  });

  it("returns nothing for non-array content", () => {
    expect(blockContentCopy(null)).toEqual({});
  });
});
