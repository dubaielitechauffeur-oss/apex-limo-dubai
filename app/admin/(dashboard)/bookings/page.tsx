import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listBookings, type ListBookingsParams, type AdminBookingListItem } from "@/lib/admin/bookings";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import type { BookingStatus } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Bookings — Admin" };

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  in_progress: "info",
  completed: "success",
  cancelled: "danger",
  no_show: "danger",
};

interface BookingsPageProps {
  searchParams: Promise<{ q?: string; status?: string; dateFrom?: string; dateTo?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/bookings?${query}` : "/admin/bookings";
}

export default async function BookingsListPage({ searchParams }: BookingsPageProps) {
  await requirePermission(PERMISSIONS.BOOKINGS_READ);
  const params = await searchParams;

  const listParams: ListBookingsParams = {
    q: params.q,
    status: params.status as BookingStatus | undefined,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page: params.page ? Number(params.page) : 1,
  };

  const result = await listBookings(listParams);
  if (!result.success) {
    return (
      <div>
        <PageHeader title="Bookings" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const columns: DataTableColumn<AdminBookingListItem>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => (
        <Link href={`/admin/bookings/${row.id}`} className="font-mono text-xs font-medium text-gray-900 hover:underline">
          {row.reference}
        </Link>
      ),
    },
    { key: "fullName", header: "Customer", render: (row) => row.fullName },
    {
      key: "date",
      header: "Pickup",
      render: (row) => (
        <span>
          {formatAdminDate(row.date)} {row.time}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "route",
      header: "Route",
      render: (row) => (
        <span className="text-xs text-gray-600">
          {row.pickupLocation} → {row.dropoffLocation}
        </span>
      ),
      hideOnMobile: true,
    },
    { key: "vehicle", header: "Vehicle", render: (row) => row.vehicleLabel, hideOnMobile: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge label={row.status.replace(/_/g, " ")} tone={STATUS_TONE[row.status] ?? "neutral"} /> },
    { key: "createdAt", header: "Created", render: (row) => formatAdminDateTime(row.createdAt), hideOnMobile: true },
  ];

  const { items, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader title="Bookings" subtitle={`${total} booking${total === 1 ? "" : "s"}.`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search reference, name, email, phone…" />
        <FilterDropdown paramName="status" label="Filter by status" options={STATUS_OPTIONS} allLabel="All statuses" />
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No bookings found"
        emptyDescription="Bookings submitted through the public booking form will appear here."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        buildHref={(nextPage) => buildHref({ q: params.q, status: params.status, dateFrom: params.dateFrom, dateTo: params.dateTo }, nextPage)}
      />
    </div>
  );
}
