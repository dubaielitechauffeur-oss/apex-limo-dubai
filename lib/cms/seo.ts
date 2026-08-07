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
});

export function emptySeoMeta(): SeoMeta {
  return {
    title: emptyLocalizedText(),
    description: emptyLocalizedText(),
    ogImageId: null,
    canonical: null,
    noIndex: false,
    noFollow: false,
  };
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

  return {
    title,
    description,
    keywords: existing?.keywords,
    structuredData: existing?.structuredData,
    ogImageId,
    canonical,
    noIndex: formData.get("seo_noIndex") === "on",
    noFollow: formData.get("seo_noFollow") === "on",
  };
}
