import { MediaPickerField } from "./MediaPickerField";
import { SeoTextField } from "./SeoTextField";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { SEO_HEADING_KEYS_FIELD, seoHeadingFieldPrefix, type SeoMeta } from "@/lib/cms/seo";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";
import type { HeadingSlot } from "@/lib/seo-pages/catalog";
import type { Locale } from "@/i18n/routing";

/** What a search result shows before cutting off. Guidance, not validation. */
export const META_TITLE_LIMIT = 60;
export const META_DESCRIPTION_LIMIT = 158;

type LocaleDefaults = Partial<Record<Locale, string>>;

export interface SeoFieldDefaults {
  title?: LocaleDefaults;
  description?: LocaleDefaults;
  h1?: LocaleDefaults;
  /** Keyed by heading slot key. */
  headings?: Record<string, LocaleDefaults>;
}

/**
 * Shared SEO subform every content type's create/edit form embeds, and the
 * body of the Page SEO editor — mirrors the embedded `SeoMeta` JSON shape.
 *
 * `showH1` / `headingSlots` are opt-in so the site-wide Default SEO form,
 * which has no page of its own, keeps showing only the meta fields.
 */
export function SeoFieldsSection({
  seo,
  ogImage,
  mediaLibraryItems,
  showMeta = true,
  showH1 = false,
  h1Hint,
  headingSlots = [],
  defaults,
}: {
  seo: SeoMeta;
  ogImage: MediaPickerResult | null;
  mediaLibraryItems: MediaPickerResult[];
  showMeta?: boolean;
  showH1?: boolean;
  h1Hint?: string;
  headingSlots?: readonly HeadingSlot[];
  defaults?: SeoFieldDefaults;
}) {
  return (
    <div className="space-y-6">
      {showMeta ? (
        <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Search result (meta tags)</h2>
            <p className="mt-1 text-xs text-gray-500">
              Leave a field blank to keep the text shown in grey. A title that already contains “Apex” is used
              exactly as typed; otherwise “| Apex Limo &amp; Chauffeur Dubai” is added after it.
            </p>
          </div>

          <SeoTextField
            prefix="seo_title"
            label="Meta title"
            value={seo.title}
            defaults={defaults?.title}
            limit={META_TITLE_LIMIT}
          />
          <SeoTextField
            prefix="seo_description"
            label="Meta description"
            value={seo.description}
            defaults={defaults?.description}
            limit={META_DESCRIPTION_LIMIT}
            multiline
          />

          <MediaPickerField name="seo_ogImageId" label="Social share image (OG)" initial={ogImage} initialItems={mediaLibraryItems} />

          <FormField id="seo_canonical" label="Canonical URL" hint="Leave blank unless this page duplicates another URL.">
            <input id="seo_canonical" name="seo_canonical" defaultValue={seo.canonical ?? ""} className={ADMIN_INPUT_CLASSES} />
          </FormField>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="seo_noIndex" defaultChecked={seo.noIndex} className="h-4 w-4 rounded border-gray-300" />
              No-index (hide from search engines)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="seo_noFollow" defaultChecked={seo.noFollow} className="h-4 w-4 rounded border-gray-300" />
              No-follow (don&apos;t crawl links on this page)
            </label>
          </div>
        </div>
      ) : null}

      {showH1 || headingSlots.length > 0 ? (
        <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Headings on the page</h2>
            <p className="mt-1 text-xs text-gray-500">
              Leave a heading blank to keep the text shown in grey. Each language is separate: a heading typed in
              English only changes the English page.
            </p>
          </div>

          {showH1 ? (
            <SeoTextField
              prefix="seo_h1"
              label="Main heading"
              badge="H1"
              value={seo.h1}
              defaults={defaults?.h1}
              hint={h1Hint}
            />
          ) : null}

          {headingSlots.map((slot) => (
            <div key={slot.key}>
              <input type="hidden" name={SEO_HEADING_KEYS_FIELD} value={slot.key} />
              <SeoTextField
                prefix={seoHeadingFieldPrefix(slot.key)}
                label={defaults?.headings?.[slot.key]?.en || slot.defaultText || slot.key}
                badge={`H${slot.level}`}
                value={seo.headings?.[slot.key]}
                defaults={defaults?.headings?.[slot.key] ?? (slot.defaultText ? { en: slot.defaultText } : undefined)}
                hint={slot.note}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
