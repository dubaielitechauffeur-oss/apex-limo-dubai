import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listFaqs, listFaqCategories, type ListFaqsParams, type FaqListItem } from "@/lib/cms/faq";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { FaqCategoryManager } from "@/components/admin/cms/FaqCategoryManager";

export const metadata: Metadata = { title: "FAQs — Admin" };

interface FaqPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/faq?${query}` : "/admin/faq";
}

const PARENT_LABEL: Record<string, string> = { general: "General", vehicle: "Vehicle", service: "Service", location: "Location" };

export default async function FaqListPage({ searchParams }: FaqPageProps) {
  await requirePermission(PERMISSIONS.FAQ_READ);
  const params = await searchParams;

  const listParams: ListFaqsParams = { q: params.q, categoryId: params.category, page: params.page ? Number(params.page) : 1 };
  const [result, categoriesResult] = await Promise.all([listFaqs(listParams), listFaqCategories()]);

  if (!result.success) {
    return (
      <div>
        <PageHeader title="FAQs" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const categories = categoriesResult.success ? categoriesResult.data : [];

  const columns: DataTableColumn<FaqListItem>[] = [
    { key: "question", header: "Question", render: (row) => <Link href={`/admin/faq/${row.id}`} className="font-medium text-gray-900 hover:underline">{row.question}</Link> },
    { key: "category", header: "Category", render: (row) => row.categoryName ?? "—", hideOnMobile: true },
    { key: "scope", header: "Scope", render: (row) => <StatusBadge label={row.parentLabel ? `${PARENT_LABEL[row.parentType]}: ${row.parentLabel}` : PARENT_LABEL[row.parentType]} tone={row.parentType === "general" ? "neutral" : "info"} /> },
    { key: "sortOrder", header: "Order", render: (row) => row.sortOrder, hideOnMobile: true },
  ];

  const { items, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader
        title="FAQs"
        subtitle={`${total} FAQ${total === 1 ? "" : "s"}.`}
        actions={<Link href="/admin/faq/new" className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">New FAQ</Link>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <FaqCategoryManager categories={categories} />
        </div>

        <div>
          <div className="mb-4">
            <SearchInput placeholder="Search question…" />
          </div>
          <DataTable columns={columns} rows={items} rowKey={(row) => row.id} emptyTitle="No FAQs found" emptyDescription="Create your first FAQ to get started." />
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={pageSize} buildHref={(nextPage) => buildHref({ q: params.q, category: params.category }, nextPage)} />
        </div>
      </div>
    </div>
  );
}
