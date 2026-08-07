"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createService,
  updateService,
  setServiceStatus,
  softDeleteService,
  restoreService,
  type ServiceInput,
} from "@/lib/cms/services";
import { readLocalizedField } from "@/lib/cms/localized";
import { readSeoField } from "@/lib/cms/seo";
import type { PublishStatus } from "@/lib/generated/prisma/client";

export interface CmsActionState {
  error?: string;
  success?: string;
}

function readServiceInput(formData: FormData): ServiceInput {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    name: readLocalizedField(formData, "name"),
    tagline: readLocalizedField(formData, "tagline"),
    heroSubtitle: readLocalizedField(formData, "heroSubtitle"),
    shortDescription: readLocalizedField(formData, "shortDescription"),
    longDescription: readLocalizedField(formData, "longDescription"),
    benefits: readLocalizedField(formData, "benefits"),
    whyChoose: readLocalizedField(formData, "whyChoose"),
    tags: readLocalizedField(formData, "tags"),
    ratingMetricValue: String(formData.get("ratingMetricValue") ?? ""),
    ratingMetricLabel: readLocalizedField(formData, "ratingMetricLabel"),
    imageId: String(formData.get("imageId") ?? "") || null,
    seo: readSeoField(formData),
    status: (String(formData.get("status") ?? "draft") as PublishStatus),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createServiceAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createService(readServiceInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/services");
  redirect(`/admin/services/${result.data.id}`);
}

export async function updateServiceAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateService(id, readServiceInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  return { success: "Service updated." };
}

export async function setServiceStatusAction(id: string, status: PublishStatus): Promise<CmsActionState> {
  const result = await setServiceStatus(id, status);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  return { success: `Status changed to ${status}.` };
}

export async function deleteServiceAction(id: string): Promise<CmsActionState> {
  const result = await softDeleteService(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/services");
  return { success: "Service deleted." };
}

export async function restoreServiceAction(id: string): Promise<CmsActionState> {
  const result = await restoreService(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/services");
  return { success: "Service restored." };
}
