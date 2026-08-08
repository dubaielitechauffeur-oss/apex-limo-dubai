"use server";

import { revalidatePath } from "next/cache";
import { updateDefaultSeo, getGlobalSettings } from "@/lib/admin/settings";
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
  return { success: "Default SEO settings updated." };
}
