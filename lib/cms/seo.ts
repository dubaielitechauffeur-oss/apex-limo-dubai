import { z } from "zod";
import { routing } from "@/i18n/routing";
import { localizedOptionalTextSchema, emptyLocalizedText, type LocalizedText } from "./localized";

/**
 * Mirrors DATABASE_ARCHITECTURE.md §9's embedded SEO JSON shape exactly
 * (`{title, description, keywords, ogImageId, canonical, noIndex, noFollow,
 * structuredData}`) — every content model's `seo` column stores this same
 * shape. `keywords` and `structuredData` aren't exposed in the admin form
 * this phase (low-value editing surface relative to the rest of the CMS);
 * they're preserved as-is on update rather than dropped.
 */
export interface SeoMeta {
  title: LocalizedText;
  description: LocalizedText;
  keywords?: Record<string, string[]>;
  ogImageId: string | null;
  canonical: string | null;
  noIndex: boolean;
  noFollow: boolean;
  structuredData?: unknown;
  /** Page H1 override. Blank keeps the page's built-in heading. */
  h1?: LocalizedText;
  /** Section heading (H2/H3) overrides, keyed by the slot keys declared in
   *  `lib/seo-pages/catalog.ts`. A missing or blank entry keeps the default. */
  headings?: Record<string, LocalizedText>;
}

export const seoMetaSchema = z.object({
  title: localizedOptionalTextSchema,
  description: localizedOptionalTextSchema,
  keywords: z.record(z.string(), z.array(z.string())).optional(),
  ogImageId: z.string().nullable(),
  canonical: z.string().nullable(),
  noIndex: z.boolean(),
  noFollow: z.boolean(),
  structuredData: z.unknown().optional(),
  h1: localizedOptionalTextSchema.optional(),
  headings: z.record(z.string().max(120), localizedOptionalTextSchema).optional(),
});

export function emptySeoMeta(): SeoMeta {
  return {
    title: emptyLocalizedText(),
    description: emptyLocalizedText(),
    ogImageId: null,
    canonical: null,
    noIndex: false,
    noFollow: false,
    h1: emptyLocalizedText(),
    headings: {},
  };
}

/** Name of the hidden form field that lists which heading slots a form
 *  rendered — `readSeoField` reads exactly those and nothing else. */
export const SEO_HEADING_KEYS_FIELD = "seo_heading_keys";

/** Form field prefix for one heading slot (`<prefix>_<locale>` per locale). */
export function seoHeadingFieldPrefix(key: string): string {
  return `seo_heading__${key}`;
}

/** Reads the SEO subform's fields off a submitted FormData, preserving
 *  whatever `keywords`/`structuredData` the row already had (not editable
 *  in this phase's form). */
export function readSeoField(formData: FormData, existing?: SeoMeta | null): SeoMeta {
  const title = {} as LocalizedText;
  const description = {} as LocalizedText;
  for (const locale of routing.locales) {
    title[locale] = String(formData.get(`seo_title_${locale}`) ?? "");
    description[locale] = String(formData.get(`seo_description_${locale}`) ?? "");
  }
  const ogImageId = String(formData.get("seo_ogImageId") ?? "") || null;
  const canonical = String(formData.get("seo_canonical") ?? "").trim() || null;

  // H1 and section headings. A form that predates these fields (or simply
  // does not render them) submits none of the inputs, in which case whatever
  // the row already stored is preserved rather than wiped.
  const hasH1 = routing.locales.some((locale) => formData.has(`seo_h1_${locale}`));
  const h1 = hasH1 ? readTrimmedLocalized(formData, "seo_h1") : existing?.h1;

  const headingKeys = formData.getAll(SEO_HEADING_KEYS_FIELD).map(String).filter(Boolean);
  let headings = existing?.headings;
  if (formData.has(SEO_HEADING_KEYS_FIELD)) {
    headings = {};
    for (const key of headingKeys) {
      const value = readTrimmedLocalized(formData, seoHeadingFieldPrefix(key));
      if (Object.values(value).some(Boolean)) headings[key] = value;
    }
  }

  return {
    title,
    description,
    keywords: existing?.keywords,
    structuredData: existing?.structuredData,
    ogImageId,
    canonical,
    noIndex: formData.get("seo_noIndex") === "on",
    noFollow: formData.get("seo_noFollow") === "on",
    ...(h1 ? { h1 } : {}),
    ...(headings ? { headings } : {}),
  };
}

function readTrimmedLocalized(formData: FormData, prefix: string): LocalizedText {
  const value = {} as LocalizedText;
  for (const locale of routing.locales) {
    value[locale] = String(formData.get(`${prefix}_${locale}`) ?? "").replace(/\s+/g, " ").trim();
  }
  return value;
}
