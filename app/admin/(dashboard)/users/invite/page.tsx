import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listRoles } from "@/lib/permissions/roles-admin";
import { ROLE_DESCRIPTIONS, isSystemRoleName } from "@/lib/permissions/roles";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { InviteUserForm, type InviteRoleOption } from "@/components/admin/users/InviteUserForm";

export const metadata: Metadata = { title: "Invite User — Admin" };

/** Most access first, so the list reads from "can do almost everything" down
 *  to "can only look". Super Admin is not offered — see `inviteUser`. */
const ROLE_ORDER = ["admin", "agency", "content_manager", "seo_manager", "fleet_manager", "booking_manager", "viewer"];

export default async function InviteUserPage() {
  await requirePermission(PERMISSIONS.USERS_CREATE);
  const rolesResult = await listRoles();

  const breadcrumbs = [{ label: "Users & Roles", href: "/admin/users" }, { label: "Invite user" }];

  if (!rolesResult.success) {
    return (
      <div>
        <PageHeader title="Invite user" breadcrumbs={breadcrumbs} />
        <ErrorState description={rolesResult.error} />
      </div>
    );
  }

  const roles: InviteRoleOption[] = rolesResult.data
    .filter((role) => role.name !== "super_admin")
    .sort((a, b) => {
      const ai = ROLE_ORDER.indexOf(a.name);
      const bi = ROLE_ORDER.indexOf(b.name);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map((role) => ({
      id: role.id,
      name: role.name,
      label: role.name.replace(/_/g, " "),
      description: isSystemRoleName(role.name) ? ROLE_DESCRIPTIONS[role.name] : (role.description ?? ""),
    }));

  return (
    <div>
      <PageHeader
        title="Invite user"
        subtitle="Give someone access by email. They receive a link and choose their own password."
        breadcrumbs={breadcrumbs}
      />
      <div className="max-w-2xl">
        <InviteUserForm roles={roles} />
      </div>
    </div>
  );
}
