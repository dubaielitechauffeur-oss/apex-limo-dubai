import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listHeroSlides, listTestimonials, listBrands } from "@/lib/cms/homepage";
import { getInitialMediaPickerItems, ensureMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { HeroSlideManager } from "@/components/admin/cms/HeroSlideManager";
import { TestimonialManager } from "@/components/admin/cms/TestimonialManager";
import { BrandManager } from "@/components/admin/cms/BrandManager";

export const metadata: Metadata = { title: "Homepage — Admin" };

export default async function HomepageContentPage() {
  await requirePermission(PERMISSIONS.HOMEPAGE_READ);

  const [heroResult, testimonialsResult, brandsResult, initialMediaLibraryItems] = await Promise.all([
    listHeroSlides(),
    listTestimonials(),
    listBrands(),
    getInitialMediaPickerItems(),
  ]);

  // Resolve every hero slide's desktop+mobile images and every brand's logo
  // in the picker even when they fall outside the newest-24 default page.
  const referencedIds: (string | null)[] = [];
  if (heroResult.success) {
    for (const slide of heroResult.data) {
      referencedIds.push(slide.desktopImageId, slide.mobileImageId);
    }
  }
  if (brandsResult.success) {
    for (const brand of brandsResult.data) referencedIds.push(brand.logoId);
  }
  const mediaLibraryItems = await ensureMediaPickerItems(initialMediaLibraryItems, referencedIds);

  return (
    <div>
      <PageHeader title="Homepage" subtitle="Manage the hero carousel, testimonials, and brand logos shown on the public homepage." />

      <div className="space-y-6">
        <HeroSlideManager slides={heroResult.success ? heroResult.data : []} mediaLibraryItems={mediaLibraryItems} />
        <TestimonialManager testimonials={testimonialsResult.success ? testimonialsResult.data : []} />
        <BrandManager brands={brandsResult.success ? brandsResult.data : []} mediaLibraryItems={mediaLibraryItems} />
      </div>
    </div>
  );
}
