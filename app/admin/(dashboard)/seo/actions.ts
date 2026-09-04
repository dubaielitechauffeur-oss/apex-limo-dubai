"use server";

import { revalidatePath } from "next/cache";
import { updateDefaultSeo, getGlobalSettings } from "@/lib/admin/settings";
import { revalidateAllPublicContent } from "@/lib/cms/revalidate";
import { readSeoField, type SeoMeta } from "@/lib/cms/seo";
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
