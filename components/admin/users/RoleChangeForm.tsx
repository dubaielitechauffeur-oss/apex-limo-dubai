"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { changeUserRoleAction, type UserActionState } from "@/app/admin/(dashboard)/users/[id]/actions";
import { SelectField } from "@/components/admin/ui/FormField";
import { PermissionView, type CatalogEntry } from "@/components/admin/users/PermissionView";
import { useToast } from "@/components/admin/ui/Toast";
import type { RoleWithPermissions } from "@/lib/permissions/roles-admin";

const initialState: UserActionState = {};

export function RoleChangeForm({
  userId,
  currentRoleId,
  roles,
  catalog,
}: {
  userId: string;
  currentRoleId: string;
  roles: RoleWithPermissions[];
  catalog: CatalogEntry[];
}) {
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
  const [state, formAction, isPending] = useActionState(changeUserRoleAction, initialState);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast(state.success, "success");
      router.refresh();
    } else if (state.error) {
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />
      <div className="max-w-sm">
        <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <div className="mt-1.5">
          <SelectField id="roleId" value={selectedRoleId} onChange={setSelectedRoleId}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name.replace(/_/g, " ")} ({role.permissionCount} permissions)
              </option>
            ))}
          </SelectField>
        </div>
        {selectedRole ? <p className="mt-1.5 text-xs text-gray-500">{selectedRole.description}</p> : null}
      </div>

      {selectedRole ? (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {selectedRoleId === currentRoleId ? "Current permissions" : "This role would grant"}
          </h3>
          <PermissionView catalog={catalog} granted={selectedRole.permissions} />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || selectedRoleId === currentRoleId}
        className="rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Updating…" : "Update role"}
      </button>
    </form>
  );
}
