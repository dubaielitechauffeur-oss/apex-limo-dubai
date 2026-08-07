import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";

export type LocalizedText = Record<Locale, string>;

/** Every locale key present, English required non-empty, the rest may be
 *  filled in later as translations land — matches how `MediaItem.alt` is
 *  already seeded in lib/media/items.ts (Phase 6) rather than inventing a
 *  stricter "all 6 required" rule this project has never enforced. */
export const localizedTextSchema = z
  .object(Object.fromEntries(routing.locales.map((locale) => [locale, z.string()])) as Record<Locale, z.ZodString>)
  .refine((value) => value[routing.defaultLocale].trim().length > 0, {
    message: "English content is required.",
  });

export const localizedOptionalTextSchema = z.object(
  Object.fromEntries(routing.locales.map((locale) => [locale, z.string()])) as Record<Locale, z.ZodString>
);

export function emptyLocalizedText(seed?: string): LocalizedText {
  const value = {} as LocalizedText;
  for (const locale of routing.locales) {
    value[locale] = locale === routing.defaultLocale ? (seed ?? "") : "";
  }
  return value;
}

/** Reads `<prefix>_<locale>` fields off a submitted FormData into a
 *  LocalizedText object — the same convention `MediaEditForm`/
 *  `updateMediaMetadataAction` established in Phase 6. */
export function readLocalizedField(formData: FormData, prefix: string): LocalizedText {
  const value = {} as LocalizedText;
  for (const locale of routing.locales) {
    value[locale] = String(formData.get(`${prefix}_${locale}`) ?? "");
  }
  return value;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "Arabic",
  ru: "Russian",
  zh: "Chinese",
  fr: "French",
  de: "German",
};
