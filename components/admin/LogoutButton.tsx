"use client";

import { logoutAction } from "@/lib/auth/actions";

/** `className` lets call sites in different visual contexts (dark public
 *  auth chrome vs. the light admin dashboard shell) restyle the trigger
 *  without duplicating the `logoutAction` form itself. */
export default function LogoutButton({ className = "btn-outline h-9 px-4 py-0 text-xs" }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={className}>
        Sign Out
      </button>
    </form>
  );
}
