import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listQuotes, type ListQuotesParams, type AdminQuoteListItem } from "@/lib/admin/quotes";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import type { QuoteStatus } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Quotes — Admin" };

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
  { value: "converted", label: "Converted" },
];

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  sent: "info",
  viewed: "info",
  accepted: "success",
  rejected: "danger",
  expired: "neutral",
  converted: "success",
};

interface QuotesPageProps {
  searchParams: Promise<{ q?: string; status?: string; dateFrom?: string; dateTo?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/quotes?${query}` : "/admin/quotes";
}

export default async function QuotesListPage({ searchParams }: QuotesPageProps) {
  await requirePermission(PERMISSIONS.QUOTES_READ);
  const params = await searchParams;

  const listParams: ListQuotesParams = {
    q: params.q,
    status: params.status as QuoteStatus | undefined,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page: params.page ? Number(params.page) : 1,
  };

  const result = await listQuotes(listParams);
  if (!result.success) {
    return (
      <div>
        <PageHeader title="Quotes" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const columns: DataTableColumn<AdminQuoteListItem>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => (
        <Link href={`/admin/quotes/${row.id}`} className="font-mono text-xs font-medium text-gray-900 hover:underline">
          {row.reference}
        </Link>
      ),
    },
    { key: "fullName", header: "Customer", render: (row) => row.fullName },
    { key: "date", header: "Requested", render: (row) => formatAdminDate(row.date), hideOnMobile: true },
    { key: "vehicle", header: "Vehicle", render: (row) => row.vehicleLabel, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (row) => (row.estimatedAmount ? `${row.estimatedAmount} ${row.currency}` : "—"), hideOnMobile: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge label={row.status} tone={STATUS_TONE[row.status] ?? "neutral"} /> },
    { key: "createdAt", header: "Created", render: (row) => formatAdminDateTime(row.createdAt), hideOnMobile: true },
  ];

  const { items, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader title="Quotes" subtitle={`${total} quote${total === 1 ? "" : "s"}.`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search reference, name, email, phone…" />
        <FilterDropdown paramName="status" label="Filter by status" options={STATUS_OPTIONS} allLabel="All statuses" />
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No quotes found"
        emptyDescription="Quotes submitted through the public quote form will appear here."
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
