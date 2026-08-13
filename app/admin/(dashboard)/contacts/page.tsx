import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listContacts, type ListContactsParams, type AdminContactListItem } from "@/lib/admin/contacts";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { formatAdminDateTime } from "@/lib/admin/format";
import type { ContactSubmissionStatus } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Contact Submissions — Admin" };

const STATUS_OPTIONS = [
  { value: "new_submission", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const STATUS_LABEL: Record<ContactSubmissionStatus, string> = {
  new_submission: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

const STATUS_TONE: Record<ContactSubmissionStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  new_submission: "warning",
  read: "info",
  replied: "success",
  archived: "neutral",
};

interface ContactsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/contacts?${query}` : "/admin/contacts";
}

export default async function ContactsListPage({ searchParams }: ContactsPageProps) {
  await requirePermission(PERMISSIONS.CONTACTS_READ);
  const params = await searchParams;

  const listParams: ListContactsParams = {
    q: params.q,
    status: params.status as ContactSubmissionStatus | undefined,
    page: params.page ? Number(params.page) : 1,
  };

  const result = await listContacts(listParams);
  if (!result.success) {
    return (
      <div>
        <PageHeader title="Contact Submissions" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const columns: DataTableColumn<AdminContactListItem>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => (
        <Link href={`/admin/contacts/${row.id}`} className="font-mono text-xs font-medium text-gray-900 hover:underline">
          {row.reference}
        </Link>
      ),
    },
    { key: "fullName", header: "Name", render: (row) => row.fullName },
    { key: "email", header: "Email", render: (row) => <span className="text-xs text-gray-700">{row.email}</span>, hideOnMobile: true },
    { key: "subject", header: "Subject", render: (row) => <span className="text-sm text-gray-800">{row.subject}</span> },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge label={STATUS_LABEL[row.status]} tone={STATUS_TONE[row.status]} />,
    },
    { key: "createdAt", header: "Received", render: (row) => formatAdminDateTime(row.createdAt), hideOnMobile: true },
  ];

  const { items, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader title="Contact Submissions" subtitle={`${total} submission${total === 1 ? "" : "s"}.`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search reference, name, email, subject…" />
        <FilterDropdown paramName="status" label="Filter by status" options={STATUS_OPTIONS} allLabel="All statuses" />
      </div>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No contact submissions"
        emptyDescription="Messages submitted through the public contact form will appear here."
      />

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
