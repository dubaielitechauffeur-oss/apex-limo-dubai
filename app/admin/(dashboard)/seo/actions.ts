"use server";

import { revalidatePath } from "next/cache";
import { updateDefaultSeo, getGlobalSettings } from "@/lib/admin/settings";
import { revalidateAllPublicContent } from "@/lib/cms/revalidate";
import { readSeoField, type SeoMeta } from "@/lib/cms/seo";
import { updatePageSeo } from "@/lib/cms/page-seo";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

export async function updateDefaultSeoAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const settingsResult = await getGlobalSettings();
  const existing = settingsResult.success ? (settingsResult.data?.defaultSeo as unknown as SeoMeta | null) : null;
  const input = readSeoField(formData, existing);

  const result = await updateDefaultSeo(input);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/seo");
  // These defaults are the fallback title/description/OG image for every
  // public page, so a change here has to reach all of them — not just the
  // admin screen it was edited on.
  revalidateAllPublicContent();
  return { success: "Default SEO settings updated." };
}

/**
 * Saves one Page SEO entry (meta tags, H1 and section headings of a page
 * that is not a CMS record).
 *
 * Revalidates the whole public tree rather than one path: a heading here can
 * be a shared section or a template used by every service, location or
 * vehicle page, and `revalidatePath` on the locale layout is the one call
 * that reaches all of them, including the legal pages.
 */
export async function updatePageSeoAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const page = String(formData.get("page") ?? "");
  const input = readSeoField(formData);

  const result = await updatePageSeo(page, input);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/seo");
  revalidatePath(`/admin/seo/pages/${page}`);
  revalidatePath("/[locale]", "layout");
  revalidateAllPublicContent();
  return { success: "Page SEO saved. The live page updates within a few seconds." };
}
