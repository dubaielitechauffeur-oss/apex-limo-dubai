import { describe, it, expect } from "vitest";
import { PERMISSIONS, ALL_PERMISSIONS, RESOURCES, isValidPermission, permissionResource } from "@/lib/permissions/catalog";

describe("permission catalog", () => {
  it("every declared permission follows the resource:action shape", () => {
    for (const permission of ALL_PERMISSIONS) {
      expect(permission).toMatch(/^[a-z]+:[a-z]+$/);
    }
  });

  it("every permission's resource segment is a known resource", () => {
    for (const permission of ALL_PERMISSIONS) {
      expect(RESOURCES).toContain(permissionResource(permission));
    }
  });

  it("has no duplicate permission strings", () => {
    const unique = new Set(ALL_PERMISSIONS);
    expect(unique.size).toBe(ALL_PERMISSIONS.length);
  });

  it("totals 53 permissions — matches super_admin's fully-granted set", () => {
    // Regression guard: super_admin's DB row (seeded from every constant
    // in this catalog) has always reported "53 permissions" since Phase
    // 2B. If this count ever changes, either a permission was added/
    // removed here, or something drifted — worth a second look either way.
    expect(ALL_PERMISSIONS.length).toBe(53);
  });

  it("isValidPermission accepts catalog members and rejects unknown strings", () => {
    expect(isValidPermission(PERMISSIONS.FLEET_READ)).toBe(true);
    expect(isValidPermission("fleet:read")).toBe(true);
    expect(isValidPermission("not-a-real-permission")).toBe(false);
    expect(isValidPermission("fleet:teleport")).toBe(false);
  });

  it("permissionResource extracts the resource segment", () => {
    expect(permissionResource(PERMISSIONS.BOOKINGS_DELETE)).toBe("bookings");
    expect(permissionResource(PERMISSIONS.AUDIT_READ)).toBe("audit");
  });
});
