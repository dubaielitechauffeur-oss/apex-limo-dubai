import { NextResponse } from "next/server";
import { getAuthzContext, hasPermission, isSuperAdmin, type AuthzContext } from "./context";
import { logUnauthorizedAccess } from "./audit";
import type { Permission } from "./catalog";

/**
 * The "API" level from RBAC.md's five-level model — for Route Handlers
 * (`app/**\/route.ts`), where the correct failure mode is a JSON response
 * with the right HTTP status, not a browser redirect. `requirePermission`
 * (guard.ts) is for pages/Server Actions/data functions instead.
 *
 * Discriminated-union return rather than throwing: a route handler awaits
 * this, narrows on `authorized`, and returns `result.response` directly on
 * the `false` branch — no try/catch boilerplate, and the 401-vs-403
 * distinction the task requires is explicit at the call site instead of
 * hidden inside a thrown error's shape.
 */
export type ApiAuthzResult =
  | { authorized: true; ctx: AuthzContext }
  | { authorized: false; response: NextResponse };

export async function requireApiPermission(permission: Permission): Promise<ApiAuthzResult> {
  const ctx = await getAuthzContext();

  if (!ctx) {
    // No session at all — 401, not 403: the client isn't authenticated,
    // full stop, independent of what it was trying to do.
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasPermission(ctx, permission)) {
    // Authenticated but lacking the specific permission — 403. Logged as a
    // potential unauthorized-access/privilege-escalation attempt; no
    // sensitive detail (like the exact permission string) goes in the
    // response body, only in the server-side audit row.
    await logUnauthorizedAccess(ctx, permission, "missing_permission");
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { authorized: true, ctx };
}

/** Same shape as `requireApiPermission`, for endpoints a handful of
 *  different roles may call for different reasons. */
export async function requireAnyApiPermission(permissions: Permission[]): Promise<ApiAuthzResult> {
  const ctx = await getAuthzContext();

  if (!ctx) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (isSuperAdmin(ctx) || permissions.some((p) => hasPermission(ctx, p))) {
    return { authorized: true, ctx };
  }

  await logUnauthorizedAccess(ctx, permissions[0], "missing_any_of_permissions");
  return {
    authorized: false,
    response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
  };
}
