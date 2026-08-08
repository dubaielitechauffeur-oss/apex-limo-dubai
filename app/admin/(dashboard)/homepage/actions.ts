"use server";

import { revalidatePath } from "next/cache";
import {
  createHeroSlide,
  updateHeroSlide,
  setHeroSlideStatus,
  deleteHeroSlide,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  createBrand,
  updateBrand,
  deleteBrand,
  type HeroCta,
} from "@/lib/cms/homepage";
import { readLocalizedField } from "@/lib/cms/localized";
import { revalidatePublicHomepage } from "@/lib/cms/revalidate";
import type { PublishStatus } from "@/lib/generated/prisma/client";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

function readCtas(formData: FormData): HeroCta[] {
  const ctas: HeroCta[] = [];
  for (const index of [0, 1]) {
    const href = String(formData.get(`cta_${index}_href`) ?? "").trim();
    const labelEn = String(formData.get(`cta_${index}_label_en`) ?? "").trim();
    if (!href && !labelEn) continue;
    ctas.push({ href, label: readLocalizedField(formData, `cta_${index}_label`) });
  }
  return ctas;
}

export async function createHeroSlideAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createHeroSlide({
    title: readLocalizedField(formData, "title"),
    subtitle: readLocalizedField(formData, "subtitle"),
    desktopImageId: String(formData.get("desktopImageId") ?? "") || null,
    mobileImageId: String(formData.get("mobileImageId") ?? "") || null,
    ctas: readCtas(formData),
    status: String(formData.get("status") ?? "draft") as PublishStatus,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Hero slide created." };
}

export async function updateHeroSlideAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateHeroSlide(id, {
    title: readLocalizedField(formData, "title"),
    subtitle: readLocalizedField(formData, "subtitle"),
    desktopImageId: String(formData.get("desktopImageId") ?? "") || null,
    mobileImageId: String(formData.get("mobileImageId") ?? "") || null,
    ctas: readCtas(formData),
    status: String(formData.get("status") ?? "draft") as PublishStatus,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Hero slide updated." };
}

export async function setHeroSlideStatusAction(id: string, status: PublishStatus): Promise<CmsActionState> {
  const result = await setHeroSlideStatus(id, status);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: `Status changed to ${status}.` };
}

export async function deleteHeroSlideAction(id: string): Promise<CmsActionState> {
  const result = await deleteHeroSlide(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Hero slide deleted." };
}

export async function createTestimonialAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createTestimonial(readTestimonialInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Testimonial created." };
}

export async function updateTestimonialAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateTestimonial(id, readTestimonialInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Testimonial updated." };
}

function readTestimonialInput(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    rating: Number(formData.get("rating") ?? 5) || 5,
    text: String(formData.get("text") ?? "").trim(),
    serviceUsed: String(formData.get("serviceUsed") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    source: String(formData.get("source") ?? "direct").trim(),
    avatarInitials: String(formData.get("avatarInitials") ?? "").trim(),
    profileUrl: String(formData.get("profileUrl") ?? "").trim() || null,
    isFeatured: formData.get("isFeatured") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function deleteTestimonialAction(id: string): Promise<CmsActionState> {
  const result = await deleteTestimonial(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Testimonial deleted." };
}

export async function createBrandAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createBrand({
    name: String(formData.get("name") ?? "").trim(),
    logoId: String(formData.get("logoId") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Brand created." };
}

export async function updateBrandAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateBrand(id, {
    name: String(formData.get("name") ?? "").trim(),
    logoId: String(formData.get("logoId") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Brand updated." };
}

export async function deleteBrandAction(id: string): Promise<CmsActionState> {
  const result = await deleteBrand(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/homepage");
  revalidatePublicHomepage();
  return { success: "Brand deleted." };
}
