import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listBlogCategories, listTags } from "@/lib/cms/blog";
import { getInitialMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { BlogPostForm } from "@/components/admin/cms/BlogPostForm";

export const metadata: Metadata = { title: "New Blog Post — Admin" };

export default async function NewBlogPostPage() {
  await requirePermission(PERMISSIONS.BLOG_CREATE);
  const [categoriesResult, tagsResult, mediaLibraryItems] = await Promise.all([listBlogCategories(), listTags(), getInitialMediaPickerItems()]);

  return (
    <div>
      <PageHeader title="New Blog Post" breadcrumbs={[{ label: "Blog", href: "/admin/blog" }, { label: "New" }]} />
      <BlogPostForm
        post={null}
        categories={categoriesResult.success ? categoriesResult.data : []}
        tags={tagsResult.success ? tagsResult.data : []}
        mediaLibraryItems={mediaLibraryItems}
      />
    </div>
  );
}
