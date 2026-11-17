"use server";

import { revalidatePath } from "next/cache";
import { updateGlobalSettings, type GlobalSettingsInput } from "@/lib/admin/settings";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import { revalidateEntireSite } from "@/lib/cms/revalidate";

export type { CmsActionState };

/** Revalidates every public page. `getSiteContact()` feeds the site-wide
 *  chrome (header, footer, floating WhatsApp/phone buttons, notice modal)
 *  and the LocalBusiness JSON-LD in the locale layout, so a new phone number
 *  shows on every page — fleet, blog, locations and vehicle pages included,
 *  which the old seven-route list missed (they kept the old number until the
 *  24-hour ISR timer ran out). Settings change a few times a year, and pages
 *  re-render lazily on their next request, so the cost is negligible. */
function revalidatePublicContact() {
  revalidateEntireSite();
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
