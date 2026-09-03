"use server";

import { revalidatePath } from "next/cache";
import { updateVehicleRates, type VehicleRatesInput } from "@/lib/cms/fleet";
import { revalidatePublicFleet } from "@/lib/cms/revalidate";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

export async function updateVehicleRatesAction(id: string, rates: VehicleRatesInput): Promise<CmsActionState> {
  const result = await updateVehicleRates(id, rates);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/pricing");
  // Rates are read on the homepage carousel, fleet listing/category pages,
  // and this vehicle's own detail page — all three were never invalidated
  // before, so a rate change here only ever showed up after the 5-minute
  // ISR window (or not at all on the homepage, which had no revalidate
  // export at all — see revalidatePublicFleet's own doc comment).
  revalidatePublicFleet(result.data.slug);
  return { success: "Rates updated." };
}
