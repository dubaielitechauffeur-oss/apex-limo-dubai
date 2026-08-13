"use server";

import { getAuthzContext, isSuperAdmin } from "@/lib/permissions/context";
import { headers } from "next/headers";

/**
 * Triggers the one-time fleet import defined in
 * `app/api/admin/migrate/route.ts`. Restricted to super_admin only —
 * both here and inside the API route itself (defense in depth). The
 * secret used to be a hardcoded literal shipped in the client bundle;
 * it is now server-side only.
 */
export async function runMigrationAction(): Promise<{ success: true; message: string } | { success: false; error: string }> {
  const ctx = await getAuthzContext();
  if (!isSuperAdmin(ctx)) {
    return { success: false, error: "Only super_admin can run migrations." };
  }

  const secret = process.env.MIGRATE_SECRET;
  if (!secret) {
    return { success: false, error: "MIGRATE_SECRET is not configured in the environment." };
  }

  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("host");
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
    const origin = host ? `${protocol}://${host}` : "";

    const res = await fetch(`${origin}/api/admin/migrate`, {
      method: "POST",
      headers: { "x-migrate-secret": secret, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error ?? "Migration failed." };
    }
    return {
      success: true,
      message: (data.message ?? "Done.") + (data.errors?.length ? "\nErrors: " + data.errors.join(", ") : ""),
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
