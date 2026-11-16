import { describe, it, expect } from "vitest";
import { routing } from "@/i18n/routing";
import { loadMessages } from "@/i18n/load-messages";
import { PAGE_SEO_CATALOG, RECORD_HEADING_SLOTS, RECORD_H1_DEFAULT_KEY } from "@/lib/seo-pages/catalog";
import {
  getMessageValue,
  withMessageValue,
  sanitizeMessageOverride,
  messagePlaceholders,
  fillPlaceholders,
} from "@/lib/seo-pages/messages";
import { resolvePublicSeo, headingOverride } from "@/lib/public/seo-fields";
import { buildMetadata, titleNamesBrand } from "@/lib/seo";
import { readSeoField, seoHeadingFieldPrefix, SEO_HEADING_KEYS_FIELD } from "@/lib/cms/seo";

/**
 * The Page SEO catalog points at message keys by name. A renamed or removed
 * message would not fail the build — the admin field would simply stop having
 * any effect. These tests are what turns that into a red CI run.
 */
describe("Page SEO catalog", () => {
  it("uses unique, URL-safe page slugs", () => {
    const slugs = PAGE_SEO_CATALOG.map((entry) => entry.page);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("has no duplicate heading key within a page", () => {
    for (const entry of PAGE_SEO_CATALOG) {
      const keys = entry.headings.map((slot) => slot.key);
      expect(new Set(keys).size, entry.page).toBe(keys.length);
    }
  });

  it("references only messages that exist in English", async () => {
    const en = await loadMessages("en");
    const missing: string[] = [];
    for (const entry of PAGE_SEO_CATALOG) {
      const keys = [
        ...(entry.meta ? [entry.meta.titleKey, entry.meta.descriptionKey] : []),
        ...(entry.h1 ? [entry.h1.messageKey] : []),
        ...entry.headings.map((slot) => slot.messageKey),
      ];
      for (const key of keys) if (getMessageValue(en, key) === undefined) missing.push(`${entry.page}: ${key}`);
    }
    for (const [type, slots] of Object.entries(RECORD_HEADING_SLOTS)) {
      for (const slot of slots) if (getMessageValue(en, slot.messageKey) === undefined) missing.push(`${type}: ${slot.messageKey}`);
    }
    for (const key of Object.values(RECORD_H1_DEFAULT_KEY)) {
      if (key && getMessageValue(en, key) === undefined) missing.push(key);
    }
    expect(missing).toEqual([]);
  });

  it("only overrides messages that exist in every locale", async () => {
    // A message-scope override is merged into the locale's message tree, and
    // can only replace a key that is already there. A key present in English
    // alone would silently do nothing on the other five languages.
    const missing: string[] = [];
    for (const locale of routing.locales) {
      const messages = await loadMessages(locale);
      for (const entry of PAGE_SEO_CATALOG) {
        const keys = [
          ...(entry.h1?.scope === "message" ? [entry.h1.messageKey] : []),
          ...entry.headings.filter((slot) => slot.scope === "message").map((slot) => slot.messageKey),
        ];
        for (const key of keys) if (getMessageValue(messages, key) === undefined) missing.push(`${locale}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("keeps the inlined record defaults in sync with messages/en", async () => {
    const en = await loadMessages("en");
    for (const slots of Object.values(RECORD_HEADING_SLOTS)) {
      for (const slot of slots) expect(slot.defaultText, slot.messageKey).toBe(getMessageValue(en, slot.messageKey));
    }
  });
});

describe("message override helpers", () => {
  const tree = { about: { values: { title: "Values", items: [{ title: "A" }, { title: "B" }] } } };

  it("replaces a nested key without mutating the source", () => {
    const next = withMessageValue(tree, "about.values.title", "Our Values");
    expect(next.about.values.title).toBe("Our Values");
    expect(tree.about.values.title).toBe("Values");
    expect(next.about.values.items).toBe(tree.about.values.items);
  });

  it("addresses array items by index", () => {
    const next = withMessageValue(tree, "about.values.items.1.title", "Beta");
    expect(next.about.values.items[1].title).toBe("Beta");
    expect(next.about.values.items[0]).toBe(tree.about.values.items[0]);
    expect(Array.isArray(next.about.values.items)).toBe(true);
    expect(tree.about.values.items[1].title).toBe("B");
  });

  it("ignores keys that are not existing string messages", () => {
    expect(withMessageValue(tree, "about.values", "x")).toBe(tree);
    expect(withMessageValue(tree, "about.nope.title", "x")).toBe(tree);
  });

  it("strips ICU syntax an editor could type by accident", () => {
    expect(sanitizeMessageOverride("Fleet <b>VIP</b> {2026}", "Fleet")).toBe("Fleet bVIP/b");
    expect(sanitizeMessageOverride("  Many   spaces ", "x")).toBe("Many spaces");
  });

  it("keeps placeholders the original message uses, and only those", () => {
    expect(sanitizeMessageOverride("Why {name} rocks {other}", "Why Choose {name}")).toBe("Why rocks".replace("Why", "Why {name}"));
    expect(messagePlaceholders("{a} and {b} and {a}")).toEqual(["a", "b"]);
  });

  it("neutralises an apostrophe that would start an ICU quote", () => {
    expect(sanitizeMessageOverride("Apex'{name}", "x {name}")).toBe("Apex’{name}");
  });

  it("fills placeholders in plain per-page overrides", () => {
    expect(fillPlaceholders("About {name} in {city}", { name: "S-Class" })).toBe("About S-Class in {city}");
  });
});

describe("H1 and heading overrides", () => {
  const stored = {
    title: { en: "T", ar: "" },
    description: { en: "D", ar: "" },
    h1: { en: "English H1", ar: "" },
    headings: { faq: { en: "Questions about {name}", ar: "" }, empty: { en: " ", ar: "" } },
  };

  it("never falls back to English for a heading", () => {
    expect(resolvePublicSeo(stored, "en")?.h1).toBe("English H1");
    expect(resolvePublicSeo(stored, "ar")?.h1).toBe("");
    expect(resolvePublicSeo(stored, "ar")?.headings).toEqual({});
  });

  it("keeps the English title fallback for records, drops it when strict", () => {
    expect(resolvePublicSeo(stored, "ar")?.title).toBe("T");
    expect(resolvePublicSeo(stored, "ar", undefined, { strictLocale: true })).toBeNull();
  });

  it("treats a row with only an H1 as an override", () => {
    expect(resolvePublicSeo({ h1: { en: "Only" } }, "en")?.h1).toBe("Only");
  });

  it("resolves a slot to the override, filling placeholders, else the fallback", () => {
    const seo = resolvePublicSeo(stored, "en");
    expect(headingOverride(seo, "faq", "Default", { name: "DXB" })).toBe("Questions about DXB");
    expect(headingOverride(seo, "empty", "Default")).toBe("Default");
    expect(headingOverride(seo, "missing", "Default")).toBe("Default");
    expect(headingOverride(null, "faq", "Default")).toBe("Default");
  });
});

describe("buildMetadata — editor titles and the brand suffix", () => {
  const base = { canonical: null, ogImageUrl: null, noIndex: false, noFollow: false, description: "" };

  it("uses a title that already names the brand exactly as typed", () => {
    const meta = buildMetadata({
      locale: "en",
      title: "Template",
      description: "D",
      path: "/about",
      seo: { ...base, title: "About Apex Chauffeur Dubai | Apex Chauffeur" },
    });
    expect(meta.title).toEqual({ absolute: "About Apex Chauffeur Dubai | Apex Chauffeur" });
  });

  it("leaves a title without the brand to the site-wide suffix template", () => {
    const meta = buildMetadata({ locale: "en", title: "Template", description: "D", path: "/x", seo: { ...base, title: "Airport Transfers" } });
    expect(meta.title).toBe("Airport Transfers");
  });

  it("does not make template titles absolute", () => {
    expect(buildMetadata({ locale: "en", title: "Apex Fleet", description: "D", path: "/x" }).title).toBe("Apex Fleet");
  });

  it("recognises the brand in other scripts", () => {
    expect(titleNamesBrand("خدمة | أبيكس ليمو")).toBe(true);
    expect(titleNamesBrand("Chauffeur Dubai")).toBe(false);
  });
});

describe("readSeoField — H1 and headings", () => {
  const form = (entries: Record<string, string | string[]>) => {
    const fd = new FormData();
    for (const [key, value] of Object.entries(entries)) {
      for (const v of Array.isArray(value) ? value : [value]) fd.append(key, v);
    }
    return fd;
  };

  it("reads the H1 and only the heading slots the form declared", () => {
    const seo = readSeoField(
      form({
        seo_h1_en: "  Main   heading ",
        [SEO_HEADING_KEYS_FIELD]: ["faq", "about"],
        [`${seoHeadingFieldPrefix("faq")}_en`]: "FAQ heading",
        [`${seoHeadingFieldPrefix("about")}_en`]: "",
        [`${seoHeadingFieldPrefix("sneaky")}_en`]: "ignored",
      })
    );
    expect(seo.h1?.en).toBe("Main heading");
    expect(seo.headings).toEqual({ faq: expect.objectContaining({ en: "FAQ heading" }) });
  });

  it("preserves stored headings when the form has no heading fields", () => {
    const existing = { ...readSeoField(form({})), h1: { en: "Keep" } as never, headings: { faq: { en: "Keep" } as never } };
    const seo = readSeoField(form({ seo_title_en: "T" }), existing);
    expect(seo.h1).toEqual({ en: "Keep" });
    expect(seo.headings).toEqual({ faq: { en: "Keep" } });
  });
});
