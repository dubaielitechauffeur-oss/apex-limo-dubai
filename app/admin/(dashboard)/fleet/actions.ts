"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createVehicle,
  updateVehicle,
  setVehicleStatus,
  softDeleteVehicle,
  restoreVehicle,
  createVehicleCategory,
  updateVehicleCategory,
  deleteVehicleCategory,
  type VehicleInput,
} from "@/lib/cms/fleet";
import { createFaq, updateFaq, deleteFaq } from "@/lib/cms/faq";
import { readLocalizedField } from "@/lib/cms/localized";
import { readSeoField } from "@/lib/cms/seo";
import { revalidatePublicFleet } from "@/lib/cms/revalidate";
import type { PublishStatus } from "@/lib/generated/prisma/client";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

function readVehicleInput(formData: FormData): VehicleInput {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? ""),
    isElectric: formData.get("isElectric") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isPlaceholder: formData.get("isPlaceholder") === "on",
    tagline: readLocalizedField(formData, "tagline"),
    description: readLocalizedField(formData, "description"),
    longDescription: readLocalizedField(formData, "longDescription"),
    idealFor: readLocalizedField(formData, "idealFor"),
    features: readLocalizedField(formData, "features"),
    whyChoose: readLocalizedField(formData, "whyChoose"),
    badge: readLocalizedField(formData, "badge"),
    passengers: Number(formData.get("passengers") ?? 1) || 1,
    luggage: Number(formData.get("luggage") ?? 0) || 0,
    rates: {
      tenHours: Number(formData.get("rates_tenHours") ?? 0) || 0,
      fiveHours: Number(formData.get("rates_fiveHours") ?? 0) || 0,
      oneHour: Number(formData.get("rates_oneHour") ?? 0) || 0,
      airport: Number(formData.get("rates_airport") ?? 0) || 0,
      extraHour: Number(formData.get("rates_extraHour") ?? 0) || 0,
      additionalCity: Number(formData.get("rates_additionalCity") ?? 0) || 0,
    },
    imageIds: formData.getAll("imageIds").map(String),
    // Client sends one mobileImageIds entry per imageIds entry, in the
    // same order — empty string when the admin didn't choose a mobile
    // variant for that slot.
    mobileImageIds: formData.getAll("mobileImageIds").map((v) => {
      const s = String(v).trim();
      return s === "" ? null : s;
    }),
    seo: readSeoField(formData),
    status: String(formData.get("status") ?? "draft") as PublishStatus,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createVehicleAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const input = readVehicleInput(formData);
  const result = await createVehicle(input);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/fleet/vehicles");
  revalidatePublicFleet(input.slug);
  redirect(`/admin/fleet/vehicles/${result.data.id}`);
}

export async function updateVehicleAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const input = readVehicleInput(formData);
  const result = await updateVehicle(id, input);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/fleet/vehicles");
  revalidatePath(`/admin/fleet/vehicles/${id}`);
  revalidatePublicFleet(input.slug);
  return { success: "Vehicle updated." };
}

export async function setVehicleStatusAction(id: string, status: PublishStatus): Promise<CmsActionState> {
  const result = await setVehicleStatus(id, status);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/fleet/vehicles");
  revalidatePath(`/admin/fleet/vehicles/${id}`);
  revalidatePublicFleet();
  return { success: `Status changed to ${status}.` };
}

export async function deleteVehicleAction(id: string): Promise<CmsActionState> {
  const result = await softDeleteVehicle(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/fleet/vehicles");
  revalidatePublicFleet();
  return { success: "Vehicle deleted." };
}

export async function restoreVehicleAction(id: string): Promise<CmsActionState> {
  const result = await restoreVehicle(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/fleet/vehicles");
  revalidatePublicFleet();
  return { success: "Vehicle restored." };
}

export async function createVehicleCategoryAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createVehicleCategory({
    slug: String(formData.get("slug") ?? "").trim(),
    name: readLocalizedField(formData, "name"),
    description: readLocalizedField(formData, "description"),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/fleet/categories");
  revalidatePublicFleet();
  return { success: "Category created." };
}

export async function updateVehicleCategoryAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateVehicleCategory(id, {
    slug: String(formData.get("slug") ?? "").trim(),
    name: readLocalizedField(formData, "name"),
    description: readLocalizedField(formData, "description"),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/fleet/categories");
  revalidatePublicFleet();
  return { success: "Category updated." };
}

export async function deleteVehicleCategoryAction(id: string): Promise<CmsActionState> {
  const result = await deleteVehicleCategory(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/fleet/categories");
  revalidatePublicFleet();
  return { success: "Category deleted." };
}

// ── Inline FAQ management on the vehicle detail page ─────────────────────

export async function addVehicleFaqAction(
  vehicleId: string,
  _prev: CmsActionState,
  formData: FormData
): Promise<CmsActionState> {
  const question = readLocalizedField(formData, "question");
  const answer = readLocalizedField(formData, "answer");
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const result = await createFaq({
    question,
    answer,
    categoryId: null,
    parentType: "vehicle",
    vehicleId,
    serviceId: null,
    locationId: null,
    sortOrder,
  });
  if (!result.success) return { error: result.error };
  revalidatePath(`/admin/fleet/vehicles/${vehicleId}`);
  revalidatePublicFleet();
  return { success: "FAQ added." };
}

export async function updateVehicleFaqAction(
  vehicleId: string,
  faqId: string,
  _prev: CmsActionState,
  formData: FormData
): Promise<CmsActionState> {
  const question = readLocalizedField(formData, "question");
  const answer = readLocalizedField(formData, "answer");
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const result = await updateFaq(faqId, {
    question,
    answer,
    categoryId: null,
    parentType: "vehicle",
    vehicleId,
    serviceId: null,
    locationId: null,
    sortOrder,
  });
  if (!result.success) return { error: result.error };
  revalidatePath(`/admin/fleet/vehicles/${vehicleId}`);
  revalidatePublicFleet();
  return { success: "FAQ updated." };
}

export async function deleteVehicleFaqAction(vehicleId: string, faqId: string): Promise<CmsActionState> {
  const result = await deleteFaq(faqId);
  if (!result.success) return { error: result.error };
  revalidatePath(`/admin/fleet/vehicles/${vehicleId}`);
  revalidatePublicFleet();
  return { success: "FAQ deleted." };
}
