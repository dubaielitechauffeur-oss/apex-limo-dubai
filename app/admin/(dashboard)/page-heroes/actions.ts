"use server";

import { updatePageHero } from "@/lib/cms/page-heroes";
import { readLocalizedField } from "@/lib/cms/localized";
import { revalidatePublicServices, revalidatePublicLocations } from "@/lib/cms/revalidate";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

/**
 * Each page hero belongs to exactly one public route, so only that route is
 * revalidated — a services banner change should not bust the locations page.
 */
const REVALIDATE_BY_PAGE: Record<string, () => void> = {
  services: () => revalidatePublicServices(),
  locations: () => revalidatePublicLocations(),
};

export async function updatePageHeroAction(
  _prev: CmsActionState,
  formData: FormData
): Promise<CmsActionState> {
  const page = String(formData.get("page") ?? "");

  const result = await updatePageHero(page, {
    desktopImageId: String(formData.get("desktopImageId") ?? "") || null,
    mobileImageId: String(formData.get("mobileImageId") ?? "") || null,
    imageAlt: readLocalizedField(formData, "imageAlt"),
  });

  if (!result.success) return { error: result.error };

  REVALIDATE_BY_PAGE[page]?.();
  return { success: "Hero image saved." };
}
