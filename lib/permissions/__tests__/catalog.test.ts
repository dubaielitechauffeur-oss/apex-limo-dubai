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

  it("totals 60 permissions — matches super_admin's fully-granted set", () => {
    // Regression guard. 53 from Phase 2B + 4 faq:* (Phase 7) + 3 contacts:*
    // (Phase 12, when the ContactSubmission admin module was wired up).
    expect(ALL_PERMISSIONS.length).toBe(60);
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
