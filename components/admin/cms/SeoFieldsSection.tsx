import { LocalizedField } from "./LocalizedField";
import { MediaPickerField } from "./MediaPickerField";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import type { SeoMeta } from "@/lib/cms/seo";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";

/** Shared SEO subform every content-type's create/edit form embeds —
 *  mirrors DATABASE_ARCHITECTURE.md §9's embedded SEO JSON shape. */
export function SeoFieldsSection({
  seo,
  ogImage,
  mediaLibraryItems,
}: {
  seo: SeoMeta;
  ogImage: MediaPickerResult | null;
  mediaLibraryItems: MediaPickerResult[];
}) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900">SEO</h2>

      <LocalizedField prefix="seo_title" label="Meta title" value={seo.title} />
      <LocalizedField prefix="seo_description" label="Meta description" value={seo.description} multiline />

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
  );
}
