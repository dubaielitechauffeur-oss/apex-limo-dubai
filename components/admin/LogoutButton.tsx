"use client";

import { logoutAction } from "@/lib/auth/actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="btn-outline h-9 px-4 py-0 text-xs">
        Sign Out
      </button>
    </form>
  );
}
