"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createFaqCategory,
  updateFaqCategory,
  deleteFaqCategory,
  createFaq,
  updateFaq,
  deleteFaq,
  type FaqInput,
  type FaqParentType,
} from "@/lib/cms/faq";
import { readLocalizedField } from "@/lib/cms/localized";
import { revalidatePublicFaqs } from "@/lib/cms/revalidate";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

function readFaqInput(formData: FormData): FaqInput {
  const parentType = (String(formData.get("parentType") ?? "general") as FaqParentType);
  return {
    question: readLocalizedField(formData, "question"),
    answer: readLocalizedField(formData, "answer"),
    categoryId: String(formData.get("categoryId") ?? "") || null,
    parentType,
    vehicleId: String(formData.get("vehicleId") ?? "") || null,
    serviceId: String(formData.get("serviceId") ?? "") || null,
    locationId: String(formData.get("locationId") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createFaqAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createFaq(readFaqInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/faq");
  revalidatePublicFaqs();
  redirect(`/admin/faq/${result.data.id}`);
}

export async function updateFaqAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateFaq(id, readFaqInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/faq");
  revalidatePath(`/admin/faq/${id}`);
  revalidatePublicFaqs();
  return { success: "FAQ updated." };
}

export async function deleteFaqAction(id: string): Promise<CmsActionState> {
  const result = await deleteFaq(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/faq");
  revalidatePublicFaqs();
  return { success: "FAQ deleted." };
}

export async function createFaqCategoryAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createFaqCategory({
    key: String(formData.get("key") ?? "").trim(),
    name: readLocalizedField(formData, "name"),
    showChip: formData.get("showChip") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/faq");
  revalidatePublicFaqs();
  return { success: "Category created." };
}

export async function updateFaqCategoryAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateFaqCategory(id, {
    key: String(formData.get("key") ?? "").trim(),
    name: readLocalizedField(formData, "name"),
    showChip: formData.get("showChip") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/faq");
  revalidatePublicFaqs();
  return { success: "Category updated." };
}

export async function deleteFaqCategoryAction(id: string): Promise<CmsActionState> {
  const result = await deleteFaqCategory(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/faq");
  revalidatePublicFaqs();
  return { success: "Category deleted." };
}
