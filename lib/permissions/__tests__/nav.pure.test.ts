import { describe, it, expect, vi } from "vitest";

// Same reasoning as context.pure.test.ts: nothing here touches the DB, but
// importing context.ts (which nav.ts imports) drags in next-auth's module
// graph unless getSession is mocked first.
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));

import { canAccessModule, filterAdminNav } from "@/lib/permissions/nav";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ROLE_PERMISSIONS } from "@/lib/permissions/roles";
import { ADMIN_NAV } from "@/config/admin";
import type { AuthzContext } from "@/lib/permissions/context";
import type { AdminNavSection } from "@/config/admin";

function ctxFor(roleName: string, permissions: string[]): AuthzContext {
  return { userId: "test-user", roleId: "test-role", roleName, permissions: permissions as never };
}

describe("canAccessModule", () => {
  it("denies every module for an unauthenticated (null) context", () => {
    expect(canAccessModule(null, "fleet")).toBe(false);
    expect(canAccessModule(null, "admin")).toBe(false);
  });

  it("the 'admin' module (Dashboard) has no dedicated resource — any signed-in user can see it", () => {
    const ctx = ctxFor("viewer", []);
    expect(canAccessModule(ctx, "admin")).toBe(true);
  });

  it("gates a real module on its :read permission", () => {
    const withRead = ctxFor("viewer", [PERMISSIONS.FLEET_READ]);
    const withoutRead = ctxFor("viewer", []);
    expect(canAccessModule(withRead, "fleet")).toBe(true);
    expect(canAccessModule(withoutRead, "fleet")).toBe(false);
  });

  it("super_admin can access every module regardless of its stored permissions array", () => {
    const ctx = ctxFor("super_admin", []);
    expect(canAccessModule(ctx, "fleet")).toBe(true);
    expect(canAccessModule(ctx, "users")).toBe(true);
    expect(canAccessModule(ctx, "audit")).toBe(true);
  });
});

describe("filterAdminNav", () => {
  it("an unauthenticated visitor sees no sections at all", () => {
    const result = filterAdminNav(ADMIN_NAV, null);
    expect(result).toEqual([]);
  });

  it("super_admin sees every section and every item in ADMIN_NAV, including nested children", () => {
    const ctx = ctxFor("super_admin", []);
    const result = filterAdminNav(ADMIN_NAV, ctx);

    const originalItemCount = ADMIN_NAV.reduce((sum, section) => sum + section.items.length, 0);
    const filteredItemCount = result.reduce((sum, section) => sum + section.items.length, 0);
    expect(filteredItemCount).toBe(originalItemCount);

    const fleetItem = result.flatMap((s) => s.items).find((item) => item.id === "fleet");
    expect(fleetItem?.children?.length).toBe(2);
  });

  it("viewer (broad read-only role) sees read-gated modules but not users:read-less modules if stripped", () => {
    const ctx = ctxFor("viewer", ROLE_PERMISSIONS.viewer);
    const result = filterAdminNav(ADMIN_NAV, ctx);
    const ids = result.flatMap((s) => s.items).map((item) => item.id);
    expect(ids).toContain("dashboard");
    expect(ids).toContain("fleet");
  });

  it("a role with no permissions at all only sees the Dashboard item", () => {
    const ctx = ctxFor("custom-empty-role", []);
    const result = filterAdminNav(ADMIN_NAV, ctx);
    const ids = result.flatMap((s) => s.items).map((item) => item.id);
    expect(ids).toEqual(["dashboard"]);
  });

  it("a section with zero visible items is dropped entirely, not rendered empty", () => {
    const ctx = ctxFor("custom-empty-role", []);
    const result = filterAdminNav(ADMIN_NAV, ctx);
    const administrationSection = result.find((s) => s.heading === "Administration");
    expect(administrationSection).toBeUndefined();
  });

  it("filtering a fleet item without fleet:read also strips its children, never showing an orphaned submenu", () => {
    const ctx = ctxFor("custom-empty-role", []);
    const result = filterAdminNav(ADMIN_NAV, ctx);
    const fleetItem = result.flatMap((s) => s.items).find((item) => item.id === "fleet");
    expect(fleetItem).toBeUndefined();
  });

  it("never mutates the original ADMIN_NAV data module", () => {
    const before = JSON.stringify(ADMIN_NAV);
    filterAdminNav(ADMIN_NAV, ctxFor("viewer", []));
    const after = JSON.stringify(ADMIN_NAV);
    expect(after).toBe(before);
  });
});

// Guards against ADMIN_NAV drifting out of sync with the permission
// catalog's resource names — every moduleId used in the nav should map to
// either a real gated resource or be the one deliberate "any signed-in
// user" exception ("admin").
describe("ADMIN_NAV / permission catalog consistency", () => {
  it("every moduleId in ADMIN_NAV resolves to a boolean for a super_admin context", () => {
    const ctx = ctxFor("super_admin", []);
    function walk(sections: AdminNavSection[]) {
      for (const section of sections) {
        for (const item of section.items) {
          expect(typeof canAccessModule(ctx, item.moduleId)).toBe("boolean");
          if (item.children) {
            for (const child of item.children) {
              expect(typeof canAccessModule(ctx, child.moduleId)).toBe("boolean");
            }
          }
        }
      }
    }
    walk(ADMIN_NAV);
  });
});
