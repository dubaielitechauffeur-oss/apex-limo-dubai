"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  createTag,
  deleteTag,
  createBlogPost,
  updateBlogPost,
  setBlogPostStatus,
  softDeleteBlogPost,
  restoreBlogPost,
  type BlogPostInput,
} from "@/lib/cms/blog";
import { readLocalizedField } from "@/lib/cms/localized";
import { readSeoField } from "@/lib/cms/seo";
import type { PublishStatus } from "@/lib/generated/prisma/client";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

function readBlogPostInput(formData: FormData): BlogPostInput {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    title: readLocalizedField(formData, "title"),
    excerpt: readLocalizedField(formData, "excerpt"),
    content: readLocalizedField(formData, "content"),
    authorName: String(formData.get("authorName") ?? "").trim(),
    authorTitle: readLocalizedField(formData, "authorTitle"),
    authorEmail: String(formData.get("authorEmail") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? "") || null,
    featuredImageId: String(formData.get("featuredImageId") ?? "") || null,
    tagIds: formData.getAll("tagIds").map(String),
    readingTimeMinutes: Number(formData.get("readingTimeMinutes") ?? 5) || 5,
    seo: readSeoField(formData),
    status: String(formData.get("status") ?? "draft") as PublishStatus,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createBlogPostAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createBlogPost(readBlogPostInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${result.data.id}`);
}

export async function updateBlogPostAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateBlogPost(id, readBlogPostInput(formData));
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  return { success: "Blog post updated." };
}

export async function setBlogPostStatusAction(id: string, status: PublishStatus): Promise<CmsActionState> {
  const result = await setBlogPostStatus(id, status);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  return { success: `Status changed to ${status}.` };
}

export async function deleteBlogPostAction(id: string): Promise<CmsActionState> {
  const result = await softDeleteBlogPost(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  return { success: "Blog post deleted." };
}

export async function restoreBlogPostAction(id: string): Promise<CmsActionState> {
  const result = await restoreBlogPost(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  return { success: "Blog post restored." };
}

export async function createBlogCategoryAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createBlogCategory({ slug: String(formData.get("slug") ?? "").trim(), name: readLocalizedField(formData, "name"), sortOrder: Number(formData.get("sortOrder") ?? 0) || 0 });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  return { success: "Category created." };
}

export async function updateBlogCategoryAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await updateBlogCategory(id, { slug: String(formData.get("slug") ?? "").trim(), name: readLocalizedField(formData, "name"), sortOrder: Number(formData.get("sortOrder") ?? 0) || 0 });
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  return { success: "Category updated." };
}

export async function deleteBlogCategoryAction(id: string): Promise<CmsActionState> {
  const result = await deleteBlogCategory(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  return { success: "Category deleted." };
}

export async function createTagAction(name: string): Promise<CmsActionState> {
  const result = await createTag(name);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  return { success: "Tag created." };
}

export async function deleteTagAction(id: string): Promise<CmsActionState> {
  const result = await deleteTag(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/blog");
  return { success: "Tag deleted." };
}
