import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listVehicles, listVehicleCategories, type ListVehiclesParams, type VehicleListItem } from "@/lib/cms/fleet";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { PublishStatusBadge } from "@/components/admin/cms/PublishStatusControls";
import { formatAdminDate } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Vehicles — Admin" };

interface VehiclesPageProps {
  searchParams: Promise<{ q?: string; status?: string; categoryId?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/fleet/vehicles?${query}` : "/admin/fleet/vehicles";
}

export default async function VehiclesListPage({ searchParams }: VehiclesPageProps) {
  await requirePermission(PERMISSIONS.FLEET_READ);
  const params = await searchParams;

  const listParams: ListVehiclesParams = {
    q: params.q,
    status: params.status as ListVehiclesParams["status"],
    categoryId: params.categoryId,
    page: params.page ? Number(params.page) : 1,
  };

  const [result, categoriesResult] = await Promise.all([listVehicles(listParams), listVehicleCategories()]);
  if (!result.success) {
    return (
      <div>
        <PageHeader title="Vehicles" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const categories = categoriesResult.success ? categoriesResult.data : [];

  const columns: DataTableColumn<VehicleListItem>[] = [
    {
      key: "thumbnail",
      header: "",
      render: (row) => (
        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
          {row.primaryImageUrl ? (
            <Image src={row.primaryImageUrl} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <ImageOff className="absolute inset-0 m-auto h-4 w-4 text-gray-300" aria-hidden="true" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Vehicle",
      render: (row) => (
        <Link href={`/admin/fleet/vehicles/${row.id}`} className="font-medium text-gray-900 hover:underline">
          {row.brand} {row.model}
        </Link>
      ),
    },
    { key: "categoryName", header: "Category", render: (row) => row.categoryName, hideOnMobile: true },
    { key: "passengers", header: "Pax", render: (row) => row.passengers, hideOnMobile: true },
    { key: "luggage", header: "Luggage", render: (row) => row.luggage, hideOnMobile: true },
    { key: "status", header: "Status", render: (row) => <PublishStatusBadge status={row.status} /> },
    { key: "featured", header: "Featured", render: (row) => (row.isFeatured ? "★" : ""), hideOnMobile: true },
    { key: "updatedAt", header: "Updated", render: (row) => formatAdminDate(row.updatedAt), hideOnMobile: true },
  ];

  const { items, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle={`${total} vehicle${total === 1 ? "" : "s"}.`}
        actions={
          <Link href="/admin/fleet/vehicles/new" className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
            New Vehicle
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search name, slug, brand, or model…" />
        <FilterDropdown
          paramName="status"
          label="Filter by status"
          options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }, { label: "Archived", value: "archived" }]}
          allLabel="All statuses"
        />
        <FilterDropdown
          paramName="categoryId"
          label="Filter by category"
          options={categories.map((c) => ({ label: c.name.en, value: c.id }))}
          allLabel="All categories"
        />
      </div>

      <DataTable columns={columns} rows={items} rowKey={(row) => row.id} emptyTitle="No vehicles found" emptyDescription="Create your first vehicle to get started." />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        buildHref={(nextPage) => buildHref({ q: params.q, status: params.status, categoryId: params.categoryId }, nextPage)}
      />
    </div>
  );
}
