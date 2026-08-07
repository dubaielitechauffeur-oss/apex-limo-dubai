"use server";

import { revalidatePath } from "next/cache";
import { assignUserRole, setUserActive, adminSendPasswordReset } from "@/lib/permissions/roles-admin";

/**
 * Thin Server Action wrappers around `lib/permissions/roles-admin.ts`'s
 * escalation-guarded functions. No authorization logic lives here — every
 * check (permission, self-change, super_admin grant/revoke) happens inside
 * the functions these call, exactly once, so the UI can't diverge from
 * what the backend actually enforces.
 */

export interface UserActionState {
  error?: string;
  success?: string;
}

export async function changeUserRoleAction(_prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const userId = String(formData.get("userId") ?? "");
  const roleId = String(formData.get("roleId") ?? "");

  const result = await assignUserRole(userId, roleId);
  if (!result.success) return { error: result.error };

  revalidatePath(`/admin/users/${userId}`);
  return { success: `Role updated to “${result.data.roleName.replace(/_/g, " ")}”.` };
}

export async function toggleUserActiveAction(userId: string, nextActive: boolean): Promise<UserActionState> {
  const result = await setUserActive(userId, nextActive);
  if (!result.success) return { error: result.error };

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: nextActive ? "Account enabled." : "Account disabled." };
}

export async function sendPasswordResetAction(userId: string): Promise<UserActionState> {
  const result = await adminSendPasswordReset(userId);
  if (!result.success) return { error: result.error };
  return { success: `Password reset email sent to ${result.data.email}.` };
}
