import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getGlobalSettings } from "@/lib/admin/settings";
import { getInitialMediaPickerItems, ensureMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { emptySeoMeta, type SeoMeta } from "@/lib/cms/seo";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DefaultSeoForm } from "@/components/admin/seo/DefaultSeoForm";

export const metadata: Metadata = { title: "SEO Manager — Admin" };

export default async function SeoPage() {
  await requirePermission(PERMISSIONS.SEO_READ);
  const [settingsResult, initialMediaLibraryItems] = await Promise.all([
    getGlobalSettings(),
    getInitialMediaPickerItems(),
  ]);

  const seo = (settingsResult.success ? (settingsResult.data?.defaultSeo as unknown as SeoMeta | null) : null) ?? emptySeoMeta();
  // Resolve the currently-selected OG image so it stays selected in the picker
  // even when the underlying asset was uploaded earlier than the newest 24.
  const mediaLibraryItems = await ensureMediaPickerItems(initialMediaLibraryItems, [seo.ogImageId]);

  return (
    <div>
      <PageHeader
        title="SEO Manager"
        subtitle="Site-wide default meta title, description, and social share image. Per-page SEO (Fleet, Services, Locations, Blog…) is edited from each of those modules and always takes priority over these defaults."
      />
      <DefaultSeoForm seo={seo} mediaLibraryItems={mediaLibraryItems} />
    </div>
  );
}
