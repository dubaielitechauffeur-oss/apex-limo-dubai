import { describe, it, expect, vi } from "vitest";

// None of these tests call getAuthzContext (the only function in
// context.ts that touches this module) — this mock exists purely so
// importing context.ts doesn't eagerly load next-auth's full module graph,
// which pulls in `next/server` in a way Vitest's Node-ESM resolver (unlike
// Next.js's own bundler) can't resolve without a live Next.js build.
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));

import { hasPermission, isSuperAdmin, hasSystemRole, type AuthzContext } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ROLE_PERMISSIONS, SYSTEM_ROLES, type SystemRole } from "@/lib/permissions/roles";

function ctxFor(roleName: string, permissions: string[]): AuthzContext {
  return { userId: "test-user", roleId: "test-role", roleName, permissions: permissions as never };
}

describe("hasPermission / isSuperAdmin — pure, no DB", () => {
  it("returns false for a null context (unauthenticated)", () => {
    expect(hasPermission(null, PERMISSIONS.FLEET_READ)).toBe(false);
    expect(isSuperAdmin(null)).toBe(false);
  });

  it("super_admin passes even with an EMPTY permissions array", () => {
    // The whole point of the "automatic future-module access" design:
    // isSuperAdmin() is checked on the role name alone, never on the
    // stored array — so a permission introduced by a module that doesn't
    // exist yet already works for super_admin today, with nothing to add
    // to any database row.
    const ctx = ctxFor("super_admin", []);
    expect(isSuperAdmin(ctx)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.USERS_DELETE)).toBe(true);
    expect(hasPermission(ctx, "some_future_module:some_future_action" as never)).toBe(true);
  });

  it("admin is NOT unrestricted — only grants in its array pass", () => {
    const ctx = ctxFor("admin", ROLE_PERMISSIONS.admin);
    expect(isSuperAdmin(ctx)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.FLEET_UPDATE)).toBe(true);
    // admin's seeded set deliberately excludes user management writes.
    expect(hasPermission(ctx, PERMISSIONS.USERS_CREATE)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.USERS_UPDATE)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.USERS_DELETE)).toBe(false);
  });

  it("a permission outside the catalog entirely is denied for a non-super-admin role", () => {
    const ctx = ctxFor("viewer", ROLE_PERMISSIONS.viewer);
    expect(hasPermission(ctx, "nonexistent:action" as never)).toBe(false);
  });

  it.each(SYSTEM_ROLES)("hasSystemRole is true for %s", (roleName: SystemRole) => {
    const ctx = ctxFor(roleName, ROLE_PERMISSIONS[roleName]);
    expect(hasSystemRole(ctx)).toBe(true);
  });

  it("hasSystemRole is false for a custom (non-system) role", () => {
    const ctx = ctxFor("some-future-custom-role", []);
    expect(hasSystemRole(ctx)).toBe(false);
  });

  describe("each role only passes for what it was seeded with", () => {
    it.each(SYSTEM_ROLES)("%s grants exactly its own seeded permission set", (roleName: SystemRole) => {
      const granted = ROLE_PERMISSIONS[roleName];
      const ctx = ctxFor(roleName, granted);
      for (const permission of granted) {
        expect(hasPermission(ctx, permission)).toBe(true);
      }
    });

    it("fleet_manager is denied bookings:update (read-only there)", () => {
      const ctx = ctxFor("fleet_manager", ROLE_PERMISSIONS.fleet_manager);
      expect(hasPermission(ctx, PERMISSIONS.BOOKINGS_READ)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.BOOKINGS_UPDATE)).toBe(false);
    });

    it("booking_manager is denied fleet:update (read-only there)", () => {
      const ctx = ctxFor("booking_manager", ROLE_PERMISSIONS.booking_manager);
      expect(hasPermission(ctx, PERMISSIONS.FLEET_READ)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.FLEET_UPDATE)).toBe(false);
    });

    it("content_manager is denied every users:* and bookings:* permission", () => {
      const ctx = ctxFor("content_manager", ROLE_PERMISSIONS.content_manager);
      expect(hasPermission(ctx, PERMISSIONS.USERS_READ)).toBe(false);
      expect(hasPermission(ctx, PERMISSIONS.BOOKINGS_READ)).toBe(false);
    });

    it("seo_manager is denied blog:delete (read/update only there)", () => {
      const ctx = ctxFor("seo_manager", ROLE_PERMISSIONS.seo_manager);
      expect(hasPermission(ctx, PERMISSIONS.BLOG_UPDATE)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.BLOG_DELETE)).toBe(false);
    });

    it("viewer is denied every mutating permission", () => {
      const ctx = ctxFor("viewer", ROLE_PERMISSIONS.viewer);
      expect(hasPermission(ctx, PERMISSIONS.FLEET_READ)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.FLEET_CREATE)).toBe(false);
      expect(hasPermission(ctx, PERMISSIONS.FLEET_UPDATE)).toBe(false);
      expect(hasPermission(ctx, PERMISSIONS.FLEET_DELETE)).toBe(false);
    });
  });
});
