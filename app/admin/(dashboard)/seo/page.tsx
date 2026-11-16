import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getGlobalSettings } from "@/lib/admin/settings";
import { getInitialMediaPickerItems, ensureMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { emptySeoMeta, type SeoMeta } from "@/lib/cms/seo";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DefaultSeoForm } from "@/components/admin/seo/DefaultSeoForm";
import { PageSeoList } from "@/components/admin/seo/PageSeoList";
import { listPageSeo } from "@/lib/cms/page-seo";

export const metadata: Metadata = { title: "SEO Manager — Admin" };

export default async function SeoPage() {
  await requirePermission(PERMISSIONS.SEO_READ);
  const [settingsResult, initialMediaLibraryItems, pagesResult] = await Promise.all([
    getGlobalSettings(),
    getInitialMediaPickerItems(),
    listPageSeo(),
  ]);

  const seo = (settingsResult.success ? (settingsResult.data?.defaultSeo as unknown as SeoMeta | null) : null) ?? emptySeoMeta();
  // Resolve the currently-selected OG image so it stays selected in the picker
  // even when the underlying asset was uploaded earlier than the newest 24.
  const mediaLibraryItems = await ensureMediaPickerItems(initialMediaLibraryItems, [seo.ogImageId]);

  return (
    <div>
      <PageHeader
        title="SEO Manager"
        subtitle="Meta title, meta description, H1 and section headings (H2/H3) for every page of the site."
      />

      <section>
        <h2 className="text-base font-semibold text-gray-900">Page SEO</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">
          Pick a page to edit its meta title, meta description, H1 and section headings. Anything left blank keeps
          the built-in text.
        </p>
        {pagesResult.success ? (
          <PageSeoList items={pagesResult.data} />
        ) : (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{pagesResult.error}</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-gray-900">Site-wide defaults</h2>
        <div className="mt-4 max-w-4xl">
          <DefaultSeoForm seo={seo} mediaLibraryItems={mediaLibraryItems} />
        </div>
      </section>
    </div>
  );
}
