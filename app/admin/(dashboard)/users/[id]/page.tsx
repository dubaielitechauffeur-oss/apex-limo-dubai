import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getUserDetail, getUserAuditActivity } from "@/lib/admin/users";
import { listRolesWithPermissions, listPermissionCatalog } from "@/lib/permissions/roles-admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { formatAdminDateTime } from "@/lib/admin/format";
import { RoleChangeForm } from "@/components/admin/users/RoleChangeForm";
import { UserStatusToggle } from "@/components/admin/users/UserStatusToggle";
import { SendPasswordResetButton } from "@/components/admin/users/SendPasswordResetButton";

export const metadata: Metadata = { title: "User Details — Admin" };

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.USERS_READ);
  const { id } = await params;

  const [detailResult, activityResult] = await Promise.all([getUserDetail(id), getUserAuditActivity(id)]);

  if (!detailResult.success) {
    if (detailResult.error === "User not found.") notFound();
    return (
      <div>
        <PageHeader title="User Details" breadcrumbs={[{ label: "Users & Roles", href: "/admin/users" }, { label: "Details" }]} />
        <ErrorState description={detailResult.error} />
      </div>
    );
  }

  const user = detailResult.data;
  const canManage = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.USERS_UPDATE);
  const isSelf = ctx.userId === user.id;

  let roleSection = null;
  if (canManage) {
    const [rolesResult, catalogResult] = await Promise.all([listRolesWithPermissions(), listPermissionCatalog()]);
    if (rolesResult.success && catalogResult.success) {
      roleSection = isSelf ? (
        <p className="text-sm text-gray-500">You cannot change your own role — ask another administrator.</p>
      ) : (
        <RoleChangeForm userId={user.id} currentRoleId={user.roleId} roles={rolesResult.data} catalog={catalogResult.data} />
      );
    }
  }

  return (
    <div>
      <PageHeader
        title={user.name}
        subtitle={user.email}
        breadcrumbs={[{ label: "Users & Roles", href: "/admin/users" }, { label: user.name }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Account Information</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoField label="Name" value={user.name} />
              <InfoField label="Email" value={user.email} />
              <InfoField label="Role" value={<span className="capitalize">{user.roleName.replace(/_/g, " ")}</span>} />
              <InfoField label="Status" value={<StatusBadge label={user.isActive ? "Active" : "Disabled"} tone={user.isActive ? "success" : "neutral"} />} />
              <InfoField label="Created" value={formatAdminDateTime(user.createdAt)} />
              <InfoField label="Last updated" value={formatAdminDateTime(user.updatedAt)} />
              <InfoField label="Last login" value={user.lastLoginAt ? formatAdminDateTime(user.lastLoginAt) : "Never"} />
              <InfoField label="Email verified" value={user.emailVerified ? formatAdminDateTime(user.emailVerified) : "Not verified"} />
            </dl>
          </section>

          {canManage ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Change Role</h2>
              <div className="mt-4">{roleSection}</div>
            </section>
          ) : null}

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            <div className="mt-4">
              {!activityResult.success || activityResult.data.length === 0 ? (
                <EmptyState title="No recorded activity" description="Nothing has been logged for this account yet." />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {activityResult.data.map((entry) => (
                    <li key={entry.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium capitalize text-gray-900">
                          {entry.action.replace(/_/g, " ")} · {entry.entityType}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">{formatAdminDateTime(entry.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">by {entry.userName}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {canManage && !isSelf ? (
          <div className="space-y-3">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Account Actions</h2>
              <div className="mt-4 flex flex-col gap-2">
                <UserStatusToggle userId={user.id} isActive={user.isActive} />
                <SendPasswordResetButton userId={user.id} email={user.email} />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}
