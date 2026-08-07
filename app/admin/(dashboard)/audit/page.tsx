import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listAuditLogs, listAuditEntityTypes, type ListAuditParams } from "@/lib/admin/audit";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DateRangeFilter } from "@/components/admin/audit/DateRangeFilter";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge, type StatusTone } from "@/components/admin/ui/StatusBadge";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { AuditChanges } from "@/components/admin/audit/AuditChanges";
import { formatAdminDateTime } from "@/lib/admin/format";
import type { AdminAuditEntry } from "@/lib/admin/audit";

export const metadata: Metadata = { title: "Audit Log — Admin" };

const ACTION_OPTIONS = [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "archive",
  "restore",
  "login",
  "logout",
  "settings_change",
  "unauthorized_access",
].map((action) => ({ label: action.replace(/_/g, " "), value: action }));

const ACTION_TONE: Record<string, StatusTone> = {
  create: "success",
  update: "info",
  delete: "danger",
  unauthorized_access: "danger",
  login: "success",
  logout: "neutral",
  publish: "success",
  unpublish: "warning",
  archive: "warning",
  restore: "info",
  settings_change: "info",
};

interface AuditPageProps {
  searchParams: Promise<{ q?: string; action?: string; entityType?: string; from?: string; to?: string; page?: string }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/audit?${query}` : "/admin/audit";
}

export default async function AuditLogPage({ searchParams }: AuditPageProps) {
  await requirePermission(PERMISSIONS.AUDIT_READ);

  const params = await searchParams;
  const listParams: ListAuditParams = {
    q: params.q,
    action: params.action,
    entityType: params.entityType,
    from: params.from,
    to: params.to,
    page: params.page ? Number(params.page) : 1,
  };

  const [result, entityTypes] = await Promise.all([listAuditLogs(listParams), listAuditEntityTypes()]);

  if (!result.success) {
    return (
      <div>
        <PageHeader title="Audit Log" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const columns: DataTableColumn<AdminAuditEntry>[] = [
    { key: "createdAt", header: "Timestamp", render: (row) => formatAdminDateTime(row.createdAt) },
    { key: "userName", header: "User", render: (row) => row.userName },
    {
      key: "action",
      header: "Action",
      render: (row) => <StatusBadge label={row.action.replace(/_/g, " ")} tone={ACTION_TONE[row.action] ?? "neutral"} />,
    },
    { key: "entityType", header: "Entity", render: (row) => <span className="capitalize">{row.entityType}</span>, hideOnMobile: true },
    {
      key: "entityId",
      header: "Entity ID",
      render: (row) => <code className="font-mono text-xs text-gray-500">{row.entityId}</code>,
      hideOnMobile: true,
    },
    { key: "changes", header: "Details", render: (row) => <AuditChanges changes={row.changes} />, hideOnMobile: true },
    { key: "ipAddress", header: "IP", render: (row) => row.ipAddress ?? "—", hideOnMobile: true },
  ];

  const { entries, total, page, pageSize, totalPages } = result.data;

  return (
    <div>
      <PageHeader title="Audit Log" subtitle={`${total} recorded event${total === 1 ? "" : "s"}.`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search by user or entity ID…" />
        <FilterDropdown paramName="action" label="Filter by action" options={ACTION_OPTIONS} allLabel="All actions" />
        <FilterDropdown
          paramName="entityType"
          label="Filter by entity"
          options={entityTypes.map((type) => ({ label: type, value: type }))}
          allLabel="All entities"
        />
        <DateRangeFilter />
      </div>

      <DataTable
        columns={columns}
        rows={entries}
        rowKey={(row) => row.id}
        emptyTitle="No audit events found"
        emptyDescription="Try adjusting your search, filters, or date range."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        buildHref={(nextPage) => buildHref(params, nextPage)}
      />
    </div>
  );
}
