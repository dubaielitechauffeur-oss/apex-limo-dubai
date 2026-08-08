"use server";

import { revalidatePath } from "next/cache";
import { updateGlobalSettings, type GlobalSettingsInput } from "@/lib/admin/settings";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

/** Revalidates every public route that reads `getSiteContact()` — the
 *  site-wide chrome (header/footer/floating buttons/notice modal) plus
 *  every page that independently calls it for its own contact display or
 *  JSON-LD, across all 6 locales. */
function revalidatePublicContact() {
  const routes = ["/", "/contact", "/booking", "/quote", "/services", "/privacy-policy", "/terms"];
  const locales = ["en", "ar", "ru", "zh", "fr", "de"];
  for (const route of routes) {
    for (const locale of locales) {
      revalidatePath(`/${locale}${route === "/" ? "" : route}`);
    }
  }
}

export async function updateGlobalSettingsAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const input: GlobalSettingsInput = {
    companyName: String(formData.get("companyName") ?? "").trim(),
    shortName: String(formData.get("shortName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    phoneDisplay: String(formData.get("phoneDisplay") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    notificationEmail: String(formData.get("notificationEmail") ?? "").trim(),
    defaultCurrency: String(formData.get("defaultCurrency") ?? "AED").trim(),
    timezone: String(formData.get("timezone") ?? "Asia/Dubai").trim(),
    fleetSizeDisplay: String(formData.get("fleetSizeDisplay") ?? "").trim(),
    ratingDisplay: String(formData.get("ratingDisplay") ?? "").trim(),
  };

  const result = await updateGlobalSettings(input);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/settings");
  revalidatePublicContact();
  return { success: "Settings saved — changes are live on the public site." };
}
