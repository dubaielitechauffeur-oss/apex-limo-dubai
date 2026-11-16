"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { inviteUserAction, type UserActionState } from "@/app/admin/(dashboard)/users/[id]/actions";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";

export interface InviteRoleOption {
  id: string;
  name: string;
  label: string;
  description: string;
}

const initialState: UserActionState = {};

/** What an invitee can never do, whichever role is chosen here. */
const ALWAYS_BLOCKED =
  "Whichever role you choose, this person cannot add or remove users, change anyone's role, or change another user's email or password. Only a Super Admin can.";

export function InviteUserForm({ roles }: { roles: InviteRoleOption[] }) {
  const [state, formAction, isPending] = useActionState(inviteUserAction, initialState);
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      showToast(state.success, "success");
      formRef.current?.reset();
      router.refresh();
    } else if (state.error) {
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <FormField id="name" label="Name" required>
          <input id="name" name="name" required maxLength={100} autoComplete="off" className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <FormField
          id="email"
          label="Email address"
          required
          hint="The invitation goes to this address, and it becomes their sign-in email."
        >
          <input id="email" name="email" type="email" required maxLength={254} autoComplete="off" className={ADMIN_INPUT_CLASSES} />
        </FormField>
      </div>

      <fieldset className="rounded-lg border border-gray-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-gray-900">Access level</legend>
        <div className="mt-2 space-y-2">
          {roles.map((role) => (
            <label
              key={role.id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                roleId === role.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="roleId"
                value={role.id}
                checked={roleId === role.id}
                onChange={() => setRoleId(role.id)}
                className="mt-1 h-4 w-4 border-gray-300"
              />
              <span>
                <span className="block text-sm font-medium capitalize text-gray-900">{role.label}</span>
                <span className="block text-xs text-gray-500">{role.description}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">{ALWAYS_BLOCKED}</p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending || !roleId}
          className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Send invitation"}
        </button>
        <span className="text-xs text-gray-500">You can disable the account or change the role at any time.</span>
      </div>
    </form>
  );
}
