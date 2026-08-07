import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listHeroSlides, listTestimonials, listBrands } from "@/lib/cms/homepage";
import { getInitialMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { HeroSlideManager } from "@/components/admin/cms/HeroSlideManager";
import { TestimonialManager } from "@/components/admin/cms/TestimonialManager";
import { BrandManager } from "@/components/admin/cms/BrandManager";

export const metadata: Metadata = { title: "Homepage — Admin" };

export default async function HomepageContentPage() {
  await requirePermission(PERMISSIONS.HOMEPAGE_READ);

  const [heroResult, testimonialsResult, brandsResult, mediaLibraryItems] = await Promise.all([
    listHeroSlides(),
    listTestimonials(),
    listBrands(),
    getInitialMediaPickerItems(),
  ]);

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
