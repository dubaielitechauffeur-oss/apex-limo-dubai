"use server";

import { revalidatePath } from "next/cache";
import { updateVehicleRates, type VehicleRatesInput } from "@/lib/cms/fleet";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

export async function updateVehicleRatesAction(id: string, rates: VehicleRatesInput): Promise<CmsActionState> {
  const result = await updateVehicleRates(id, rates);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/pricing");
  return { success: "Rates updated." };
}
