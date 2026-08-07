import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getBlogPost, listBlogCategories, listTags } from "@/lib/cms/blog";
import { getInitialMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { setBlogPostStatusAction, deleteBlogPostAction, restoreBlogPostAction } from "@/app/admin/(dashboard)/blog/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { BlogPostForm } from "@/components/admin/cms/BlogPostForm";
import { PublishActions } from "@/components/admin/cms/PublishActions";

export const metadata: Metadata = { title: "Edit Blog Post — Admin" };

interface BlogPostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPostDetailPage({ params }: BlogPostDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.BLOG_READ);
  const { id } = await params;

  const [result, categoriesResult, tagsResult, mediaLibraryItems] = await Promise.all([
    getBlogPost(id),
    listBlogCategories(),
    listTags(),
    getInitialMediaPickerItems(),
  ]);

  if (!result.success) {
    if (result.error === "Blog post not found.") notFound();
    return (
      <div>
        <PageHeader title="Blog Post" breadcrumbs={[{ label: "Blog", href: "/admin/blog" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const post = result.data;
  const canManage = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.BLOG_UPDATE);
  const canPublish = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.BLOG_PUBLISH);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.BLOG_DELETE);

  return (
    <div>
      <PageHeader title={post.title.en || post.slug} breadcrumbs={[{ label: "Blog", href: "/admin/blog" }, { label: post.title.en || post.slug }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {canManage ? (
            <BlogPostForm post={post} categories={categoriesResult.success ? categoriesResult.data : []} tags={tagsResult.success ? tagsResult.data : []} mediaLibraryItems={mediaLibraryItems} />
          ) : (
            <ErrorState title="Read-only" description="You do not have permission to edit blog posts." />
          )}
        </div>

        {canPublish || canDelete ? (
          <div>
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
              <div className="mt-4">
                <PublishActions
                  status={post.status}
                  listHref="/admin/blog"
                  onSetStatus={setBlogPostStatusAction.bind(null, id)}
                  onDelete={deleteBlogPostAction.bind(null, id)}
                  onRestore={restoreBlogPostAction.bind(null, id)}
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
