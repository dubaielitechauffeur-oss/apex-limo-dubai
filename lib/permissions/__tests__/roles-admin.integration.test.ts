import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "./fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

import { prisma } from "@/lib/db";
import { listRoles, listPermissionCatalog, assignUserRole } from "@/lib/permissions/roles-admin";
import { PERMISSIONS } from "@/lib/permissions/catalog";

let users: Record<SystemRole, TestUser>;
/** A hypothetical *non-system* role granted users:update without being
 *  super_admin — simulates a future role-permission edit gone wrong, to
 *  prove the super_admin grant/revoke guard doesn't rely on the
 *  users:update permission check alone (defense in depth). */
let misconfiguredRole: { id: string };
let misconfiguredUser: { id: string };

beforeAll(async () => {
  users = await createTestUsers();

  const role = await prisma.role.create({
    data: {
      name: "rbac-vitest-misconfigured-role",
      description: "Test-only role with users:update but not super_admin",
      permissions: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE],
      isSystem: false,
    },
  });
  misconfiguredRole = role;
  const user = await prisma.user.create({
    data: { email: "rbac-vitest-misconfigured@test.internal", name: "Misconfigured Role Test User", roleId: role.id },
  });
  misconfiguredUser = { id: user.id };
});

afterAll(async () => {
  await cleanupTestUsers(users);
  await prisma.auditLog.deleteMany({
    where: { OR: [{ userId: misconfiguredUser.id }, { entityId: misconfiguredUser.id }] },
  });
  await prisma.user.delete({ where: { id: misconfiguredUser.id } });
  await prisma.role.delete({ where: { id: misconfiguredRole.id } });
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

async function unauthorizedAccessCount(userId: string): Promise<number> {
  return prisma.auditLog.count({ where: { action: "unauthorized_access", userId } });
}

describe("listRoles / listPermissionCatalog — permission-gated read access", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await listRoles();
    expect(result.success).toBe(false);
  });

  it("viewer holds users:read and can list roles", async () => {
    mockSessionFor(users.viewer);
    const result = await listRoles();
    expect(result.success).toBe(true);
    if (result.success) {
      const names = result.data.map((r) => r.name);
      expect(names).toContain("super_admin");
      expect(names).toContain("viewer");
    }
  });

  it("returns the full permission catalog grouped by resource", async () => {
    mockSessionFor(users.super_admin);
    const result = await listPermissionCatalog();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe(53);
      expect(result.data.every((p) => typeof p.resource === "string")).toBe(true);
    }
  });
});

describe("assignUserRole — role changes", () => {
  it("super_admin can change another user's role, and it is audit-logged", async () => {
    mockSessionFor(users.super_admin);

    const before = await prisma.auditLog.count({ where: { action: "update", entityType: "user", entityId: users.viewer.id } });

    const seoRole = await prisma.role.findUniqueOrThrow({ where: { name: "seo_manager" } });
    const result = await assignUserRole(users.viewer.id, seoRole.id);
    expect(result.success).toBe(true);

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: users.viewer.id } });
    expect(updated.roleId).toBe(seoRole.id);

    const after = await prisma.auditLog.count({ where: { action: "update", entityType: "user", entityId: users.viewer.id } });
    expect(after).toBe(before + 1);

    // Restore fixture state for any other test relying on users.viewer
    // actually holding the viewer role.
    const viewerRole = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
    await prisma.user.update({ where: { id: users.viewer.id }, data: { roleId: viewerRole.id } });
  });

  it("is a no-op (still success) when assigning the role the user already has", async () => {
    mockSessionFor(users.super_admin);
    const viewerRole = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
    const result = await assignUserRole(users.viewer.id, viewerRole.id);
    expect(result.success).toBe(true);
  });

  it("fails cleanly for a nonexistent target user or role", async () => {
    mockSessionFor(users.super_admin);
    const viewerRole = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
    const result = await assignUserRole("nonexistent-user-id", viewerRole.id);
    expect(result.success).toBe(false);
  });
});

describe("assignUserRole — privilege escalation prevention", () => {
  it("denies a user without users:update entirely (e.g. content_manager)", async () => {
    mockSessionFor(users.content_manager);
    const before = await unauthorizedAccessCount(users.content_manager.id);

    const viewerRole = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
    const result = await assignUserRole(users.booking_manager.id, viewerRole.id);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permission/i);
    expect(await unauthorizedAccessCount(users.content_manager.id)).toBe(before + 1);
  });

  it("denies self-role-change even for super_admin", async () => {
    mockSessionFor(users.super_admin);
    const before = await unauthorizedAccessCount(users.super_admin.id);

    const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "admin" } });
    const result = await assignUserRole(users.super_admin.id, adminRole.id);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/own role/i);
    expect(await unauthorizedAccessCount(users.super_admin.id)).toBe(before + 1);

    // Confirm nothing actually changed.
    const stillSuperAdmin = await prisma.user.findUniqueOrThrow({ where: { id: users.super_admin.id } });
    expect(stillSuperAdmin.roleId).not.toBe(adminRole.id);
  });

  it("blocks a non-super-admin from GRANTING the super_admin role, even with users:update (defense in depth)", async () => {
    mockSessionFor(misconfiguredUser);
    const before = await unauthorizedAccessCount(misconfiguredUser.id);

    const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "super_admin" } });
    const result = await assignUserRole(users.viewer.id, superAdminRole.id);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/only a super_admin/i);
    expect(await unauthorizedAccessCount(misconfiguredUser.id)).toBe(before + 1);

    const stillViewer = await prisma.user.findUniqueOrThrow({ where: { id: users.viewer.id } });
    expect(stillViewer.roleId).not.toBe(superAdminRole.id);
  });

  it("blocks a non-super-admin from REVOKING another user's super_admin role", async () => {
    // Temporarily promote a throwaway target to super_admin via a direct
    // DB write (bypassing assignUserRole, which is exactly what's under
    // test) so there's a super_admin to attempt to demote.
    const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "super_admin" } });
    const target = await prisma.user.create({
      data: { email: "rbac-vitest-target-superadmin@test.internal", name: "Target", roleId: superAdminRole.id },
    });

    try {
      mockSessionFor(misconfiguredUser);
      const viewerRole = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
      const result = await assignUserRole(target.id, viewerRole.id);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toMatch(/only a super_admin/i);

      const stillSuperAdmin = await prisma.user.findUniqueOrThrow({ where: { id: target.id } });
      expect(stillSuperAdmin.roleId).toBe(superAdminRole.id);
    } finally {
      await prisma.auditLog.deleteMany({ where: { OR: [{ userId: target.id }, { entityId: target.id }] } });
      await prisma.user.delete({ where: { id: target.id } });
    }
  });
});
