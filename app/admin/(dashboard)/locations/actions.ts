"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createLocation,
  updateLocation,
  setLocationStatus,
  softDeleteLocation,
  restoreLocation,
  addPopularRoute,
  deletePopularRoute,
  type LocationInput,
} from "@/lib/cms/locations";
import { readLocalizedField } from "@/lib/cms/localized";
import { readSeoField } from "@/lib/cms/seo";
import type { PublishStatus } from "@/lib/generated/prisma/client";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

function readLocationInput(formData: FormData): LocationInput {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    tagline: readLocalizedField(formData, "tagline"),
    heroSubtitle: readLocalizedField(formData, "heroSubtitle"),
    shortDescription: readLocalizedField(formData, "shortDescription"),
    longDescription: readLocalizedField(formData, "longDescription"),
    isAirport: formData.get("isAirport") === "on",
    landmarks: readLocalizedField(formData, "landmarks"),
    whyChoose: readLocalizedField(formData, "whyChoose"),
    tags: readLocalizedField(formData, "tags"),
    geoLat: String(formData.get("geoLat") ?? ""),
    geoLng: String(formData.get("geoLng") ?? ""),
    heroDesktopImageId: String(formData.get("heroDesktopImageId") ?? "") || null,
    heroMobileImageId: String(formData.get("heroMobileImageId") ?? "") || null,
    seo: readSeoField(formData),
    status: String(formData.get("status") ?? "draft") as PublishStatus,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createLocationAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createLocation(readLocationInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/locations");
  redirect(`/admin/locations/${result.data.id}`);
}

export async function updateLocationAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateLocation(id, readLocationInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/locations");
  revalidatePath(`/admin/locations/${id}`);
  return { success: "Location updated." };
}

export async function setLocationStatusAction(id: string, status: PublishStatus): Promise<CmsActionState> {
  const result = await setLocationStatus(id, status);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/locations");
  revalidatePath(`/admin/locations/${id}`);
  return { success: `Status changed to ${status}.` };
}

export async function deleteLocationAction(id: string): Promise<CmsActionState> {
  const result = await softDeleteLocation(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/locations");
  return { success: "Location deleted." };
}

export async function restoreLocationAction(id: string): Promise<CmsActionState> {
  const result = await restoreLocation(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/locations");
  return { success: "Location restored." };
}

export async function addPopularRouteAction(locationId: string, from: string, to: string, duration: string): Promise<CmsActionState> {
  const result = await addPopularRoute(locationId, { from, to, duration });
  if (!result.success) return { error: result.error };
  revalidatePath(`/admin/locations/${locationId}`);
  return { success: "Route added." };
}

export async function deletePopularRouteAction(locationId: string, routeId: string): Promise<CmsActionState> {
  const result = await deletePopularRoute(routeId);
  if (!result.success) return { error: result.error };
  revalidatePath(`/admin/locations/${locationId}`);
  return { success: "Route removed." };
}
