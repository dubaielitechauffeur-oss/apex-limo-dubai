import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listLocations, type ListLocationsParams, type LocationListItem } from "@/lib/cms/locations";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PublishStatusBadge } from "@/components/admin/cms/PublishStatusControls";
import { formatAdminDate } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Locations — Admin" };

interface LocationsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/locations?${query}` : "/admin/locations";
}

export default async function LocationsListPage({ searchParams }: LocationsPageProps) {
  await requirePermission(PERMISSIONS.LOCATIONS_READ);
  const params = await searchParams;

  const listParams: ListLocationsParams = { q: params.q, status: params.status as ListLocationsParams["status"], page: params.page ? Number(params.page) : 1 };
  const result = await listLocations(listParams);
  if (!result.success) {
    return (
      <div>
        <PageHeader title="Locations" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const columns: DataTableColumn<LocationListItem>[] = [
    { key: "name", header: "Name", render: (row) => <Link href={`/admin/locations/${row.id}`} className="font-medium text-gray-900 hover:underline">{row.name}</Link> },
    { key: "slug", header: "Slug", render: (row) => <code className="font-mono text-xs text-gray-500">{row.slug}</code>, hideOnMobile: true },
    { key: "type", header: "Type", render: (row) => (row.isAirport ? <StatusBadge label="Airport" tone="info" /> : "—"), hideOnMobile: true },
    { key: "status", header: "Status", render: (row) => <PublishStatusBadge status={row.status} /> },
    { key: "updatedAt", header: "Updated", render: (row) => formatAdminDate(row.updatedAt), hideOnMobile: true },
  ];

  const { items, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle={`${total} location${total === 1 ? "" : "s"}.`}
        actions={<Link href="/admin/locations/new" className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">New Location</Link>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search name or slug…" />
        <FilterDropdown paramName="status" label="Filter by status" options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }, { label: "Archived", value: "archived" }]} allLabel="All statuses" />
      </div>

      <DataTable columns={columns} rows={items} rowKey={(row) => row.id} emptyTitle="No locations found" emptyDescription="Create your first location to get started." />

      <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={pageSize} buildHref={(nextPage) => buildHref({ q: params.q, status: params.status }, nextPage)} />
    </div>
  );
}
