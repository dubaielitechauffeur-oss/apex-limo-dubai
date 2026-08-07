import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listBlogPosts, listBlogCategories, listTags, type ListBlogPostsParams, type BlogPostListItem } from "@/lib/cms/blog";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { PublishStatusBadge } from "@/components/admin/cms/PublishStatusControls";
import { BlogTaxonomyManager } from "@/components/admin/cms/BlogTaxonomyManager";
import { formatAdminDate } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Blog — Admin" };

interface BlogPageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/blog?${query}` : "/admin/blog";
}

export default async function BlogListPage({ searchParams }: BlogPageProps) {
  await requirePermission(PERMISSIONS.BLOG_READ);
  const params = await searchParams;

  const listParams: ListBlogPostsParams = { q: params.q, status: params.status as ListBlogPostsParams["status"], categoryId: params.category, page: params.page ? Number(params.page) : 1 };
  const [result, categoriesResult, tagsResult] = await Promise.all([listBlogPosts(listParams), listBlogCategories(), listTags()]);

  if (!result.success) {
    return (
      <div>
        <PageHeader title="Blog" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const columns: DataTableColumn<BlogPostListItem>[] = [
    { key: "title", header: "Title", render: (row) => <Link href={`/admin/blog/${row.id}`} className="font-medium text-gray-900 hover:underline">{row.title}</Link> },
    { key: "category", header: "Category", render: (row) => row.categoryName ?? "—", hideOnMobile: true },
    { key: "status", header: "Status", render: (row) => <PublishStatusBadge status={row.status} /> },
    { key: "updatedAt", header: "Updated", render: (row) => formatAdminDate(row.updatedAt), hideOnMobile: true },
  ];

  const { items, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle={`${total} post${total === 1 ? "" : "s"}.`}
        actions={<Link href="/admin/blog/new" className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">New Post</Link>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <BlogTaxonomyManager categories={categoriesResult.success ? categoriesResult.data : []} tags={tagsResult.success ? tagsResult.data : []} />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SearchInput placeholder="Search title…" />
            <FilterDropdown paramName="status" label="Filter by status" options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }, { label: "Archived", value: "archived" }]} allLabel="All statuses" />
          </div>
          <DataTable columns={columns} rows={items} rowKey={(row) => row.id} emptyTitle="No blog posts found" emptyDescription="Create your first post to get started." />
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={pageSize} buildHref={(nextPage) => buildHref({ q: params.q, status: params.status, category: params.category }, nextPage)} />
        </div>
      </div>
    </div>
  );
}
