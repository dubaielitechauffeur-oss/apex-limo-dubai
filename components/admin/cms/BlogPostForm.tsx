"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBlogPostAction, updateBlogPostAction } from "@/app/admin/(dashboard)/blog/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { MediaPickerField } from "@/components/admin/cms/MediaPickerField";
import { SlugField } from "@/components/admin/cms/SlugField";
import { SeoFieldsSection } from "@/components/admin/cms/SeoFieldsSection";
import { PublishStatusSelect } from "@/components/admin/cms/PublishStatusControls";
import { FormField, SelectField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { emptySeoMeta } from "@/lib/cms/seo";
import { emptyLocalizedText } from "@/lib/cms/localized";
import type { BlogPostDetail, BlogCategoryItem, TagItem } from "@/lib/cms/blog";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";

const initialState: CmsActionState = {};

export function BlogPostForm({
  post,
  categories,
  tags,
  mediaLibraryItems,
}: {
  post: BlogPostDetail | null;
  categories: BlogCategoryItem[];
  tags: TagItem[];
  mediaLibraryItems: MediaPickerResult[];
}) {
  const action = post ? updateBlogPostAction : createBlogPostAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      showToast(state.success, "success");
      router.refresh();
    } else if (state.error) {
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const featuredImage = post?.featuredImageId ? (mediaLibraryItems.find((m) => m.id === post.featuredImageId) ?? null) : null;
  const seo = post?.seo ?? emptySeoMeta();
  const ogImage = seo.ogImageId ? (mediaLibraryItems.find((m) => m.id === seo.ogImageId) ?? null) : null;
  const selectedTagIds = new Set(post?.tagIds ?? []);

  return (
    <form action={formAction} className="space-y-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <LocalizedField prefix="title" label="Title" value={post?.title} required />
        <SlugField defaultValue={post?.slug} sourceFieldId="title_en" />
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <LocalizedField prefix="excerpt" label="Excerpt" value={post?.excerpt} multiline />
        <LocalizedField prefix="content" label="Content" value={post?.content} multiline hint="Separate paragraphs with a blank line. Renders as paragraph blocks (see CMS.md for headings/lists/FAQ block support)." />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <FormField id="authorName" label="Author name" required>
          <input id="authorName" name="authorName" required defaultValue={post?.authorName} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <FormField id="authorEmail" label="Author email" hint="Optional — used for structured data only, never displayed.">
          <input id="authorEmail" name="authorEmail" type="email" defaultValue={post?.authorEmail} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <div className="sm:col-span-2">
          <LocalizedField prefix="authorTitle" label="Author title" value={post?.authorTitle ?? emptyLocalizedText()} hint='E.g. "Founder" or "Content Lead".' />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <MediaPickerField name="featuredImageId" label="Featured image" initial={featuredImage} initialItems={mediaLibraryItems} />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <FormField id="categoryId" label="Category">
          <SelectField id="categoryId" defaultValue={post?.categoryId ?? ""}>
            <option value="">— None —</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name.en || cat.slug}</option>)}
          </SelectField>
        </FormField>
        <FormField id="readingTimeMinutes" label="Reading time (minutes)">
          <input id="readingTimeMinutes" name="readingTimeMinutes" type="number" min={1} defaultValue={post?.readingTimeMinutes ?? 5} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <div className="sm:col-span-2">
          <span className="block text-sm font-medium text-gray-700">Tags</span>
          <div className="mt-2 flex flex-wrap gap-3">
            {tags.length === 0 ? <p className="text-sm text-gray-400">No tags yet — add some from the sidebar.</p> : null}
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 text-sm text-gray-700">
                <input type="checkbox" name="tagIds" value={tag.id} defaultChecked={selectedTagIds.has(tag.id)} className="h-4 w-4 rounded border-gray-300" />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      <SeoFieldsSection seo={seo} ogImage={ogImage} mediaLibraryItems={mediaLibraryItems} />

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <PublishStatusSelect defaultValue={post?.status ?? "draft"} />
        <FormField id="sortOrder" label="Sort order">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={post?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
      </div>

      <button type="submit" disabled={isPending} className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
        {isPending ? "Saving…" : post ? "Save changes" : "Create post"}
      </button>
    </form>
  );
}
