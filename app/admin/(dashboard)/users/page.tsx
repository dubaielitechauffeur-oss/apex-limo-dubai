import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listUsers, type ListUsersParams } from "@/lib/admin/users";
import { listRoles } from "@/lib/permissions/roles-admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { formatAdminDateTime } from "@/lib/admin/format";
import type { AdminUserListItem } from "@/lib/admin/users";

export const metadata: Metadata = { title: "Users & Roles — Admin" };

interface UsersPageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
}

function buildHref(base: string, params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.role) search.set("role", params.role);
  if (params.status) search.set("status", params.status);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

export default async function UsersListPage({ searchParams }: UsersPageProps) {
  await requirePermission(PERMISSIONS.USERS_READ);

  const params = await searchParams;
  const listParams: ListUsersParams = {
    q: params.q,
    roleId: params.role,
    status: params.status === "active" || params.status === "inactive" ? params.status : undefined,
    page: params.page ? Number(params.page) : 1,
  };

  const [usersResult, rolesResult] = await Promise.all([listUsers(listParams), listRoles()]);

  if (!usersResult.success) {
    return (
      <div>
        <PageHeader title="Users & Roles" />
        <ErrorState description={usersResult.error} />
      </div>
    );
  }

  const roleOptions = rolesResult.success
    ? rolesResult.data.map((role) => ({ label: role.name.replace(/_/g, " "), value: role.id }))
    : [];

  const columns: DataTableColumn<AdminUserListItem>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link href={`/admin/users/${row.id}`} className="font-medium text-gray-900 hover:underline">
          {row.name}
        </Link>
      ),
    },
    { key: "email", header: "Email", render: (row) => row.email, hideOnMobile: true },
    {
      key: "role",
      header: "Role",
      render: (row) => <span className="capitalize">{row.roleName.replace(/_/g, " ")}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge label={row.isActive ? "Active" : "Disabled"} tone={row.isActive ? "success" : "neutral"} />,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => formatAdminDateTime(row.createdAt),
      hideOnMobile: true,
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      render: (row) => (row.lastLoginAt ? formatAdminDateTime(row.lastLoginAt) : "Never"),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Link href={`/admin/users/${row.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          View
        </Link>
      ),
    },
  ];

  const { users, total, page, pageSize, totalPages } = usersResult.data;

  return (
    <div>
      <PageHeader title="Users & Roles" subtitle={`${total} user${total === 1 ? "" : "s"} across the admin panel.`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search by name or email…" />
        <FilterDropdown paramName="role" label="Filter by role" options={roleOptions} allLabel="All roles" />
        <FilterDropdown
          paramName="status"
          label="Filter by status"
          options={[
            { label: "Active", value: "active" },
            { label: "Disabled", value: "inactive" },
          ]}
          allLabel="All statuses"
        />
      </div>

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(row) => row.id}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        buildHref={(nextPage) => buildHref("/admin/users", { q: params.q, role: params.role, status: params.status }, nextPage)}
      />
    </div>
  );
}
