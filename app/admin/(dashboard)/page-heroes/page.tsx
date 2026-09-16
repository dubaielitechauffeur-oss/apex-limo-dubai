import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listPageHeroes } from "@/lib/cms/page-heroes";
import { getInitialMediaPickerItems, ensureMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { PageHeroManager } from "@/components/admin/cms/PageHeroManager";

export const metadata: Metadata = { title: "Page Heroes — Admin" };

export default async function PageHeroesPage() {
  await requirePermission(PERMISSIONS.HOMEPAGE_READ);

  const [heroesResult, initialMediaLibraryItems] = await Promise.all([
    listPageHeroes(),
    getInitialMediaPickerItems(),
  ]);
  const heroes = heroesResult.success ? heroesResult.data : [];

  // Resolve each page's saved images in the picker even when they fall
  // outside the newest-24 default page of the media library.
  const referencedIds: (string | null)[] = [];
  for (const hero of heroes) referencedIds.push(hero.desktopImageId, hero.mobileImageId);
  const mediaLibraryItems = await ensureMediaPickerItems(initialMediaLibraryItems, referencedIds);

  return (
    <div>
      <PageHeader
        title="Page Heroes"
        subtitle="Banner images for pages that aren't a single content record — set a desktop and a mobile version of each. Service and location pages keep their hero on the service or location itself."
      />

      {!heroesResult.success ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{heroesResult.error}</p>
      ) : (
        <div className="space-y-6">
          {heroes.map((hero) => (
            <PageHeroManager key={hero.page} hero={hero} mediaLibraryItems={mediaLibraryItems} />
          ))}
        </div>
      )}
    </div>
  );
}
