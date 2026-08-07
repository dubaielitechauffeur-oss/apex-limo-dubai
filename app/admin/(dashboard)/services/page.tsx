import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listServices, type ListServicesParams, type ServiceListItem } from "@/lib/cms/services";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { PublishStatusBadge } from "@/components/admin/cms/PublishStatusControls";
import { formatAdminDate } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Services — Admin" };

interface ServicesPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/services?${query}` : "/admin/services";
}

export default async function ServicesListPage({ searchParams }: ServicesPageProps) {
  await requirePermission(PERMISSIONS.SERVICES_READ);
  const params = await searchParams;

  const listParams: ListServicesParams = {
    q: params.q,
    status: params.status as ListServicesParams["status"],
    page: params.page ? Number(params.page) : 1,
  };

  const result = await listServices(listParams);
  if (!result.success) {
    return (
      <div>
        <PageHeader title="Services" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const columns: DataTableColumn<ServiceListItem>[] = [
    { key: "name", header: "Name", render: (row) => <Link href={`/admin/services/${row.id}`} className="font-medium text-gray-900 hover:underline">{row.name}</Link> },
    { key: "slug", header: "Slug", render: (row) => <code className="font-mono text-xs text-gray-500">{row.slug}</code>, hideOnMobile: true },
    { key: "status", header: "Status", render: (row) => <PublishStatusBadge status={row.status} /> },
    { key: "sortOrder", header: "Order", render: (row) => row.sortOrder, hideOnMobile: true },
    { key: "updatedAt", header: "Updated", render: (row) => formatAdminDate(row.updatedAt), hideOnMobile: true },
  ];

  const { items, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle={`${total} service${total === 1 ? "" : "s"}.`}
        actions={
          <Link href="/admin/services/new" className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
            New Service
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search name or slug…" />
        <FilterDropdown
          paramName="status"
          label="Filter by status"
          options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }, { label: "Archived", value: "archived" }]}
          allLabel="All statuses"
        />
      </div>

      <DataTable columns={columns} rows={items} rowKey={(row) => row.id} emptyTitle="No services found" emptyDescription="Create your first service to get started." />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        buildHref={(nextPage) => buildHref({ q: params.q, status: params.status }, nextPage)}
      />
    </div>
  );
}
