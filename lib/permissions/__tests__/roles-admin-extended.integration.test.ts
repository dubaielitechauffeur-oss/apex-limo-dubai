import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "./fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

// `adminSendPasswordReset` calls `next/headers`' `headers()` to resolve the
// request origin for the reset link — only meaningful inside a real Next.js
// request. Mocked the same way guard.integration.test.ts mocks
// `next/navigation`'s `redirect`, so the escalation-guard logic (the part
// this suite actually verifies) can run outside a live request.
vi.mock("next/headers", () => ({
  headers: async () => new Map<string, string>(),
}));

import { prisma } from "@/lib/db";
import { setUserActive, adminSendPasswordReset } from "@/lib/permissions/roles-admin";
import { PERMISSIONS } from "@/lib/permissions/catalog";

let users: Record<SystemRole, TestUser>;
/** Same defense-in-depth fixture pattern as roles-admin.integration.test.ts
 *  — a non-system role holding `users:update` without being super_admin,
 *  to prove the super_admin-target restriction on `setUserActive` doesn't
 *  rely on the `users:update` check alone. */
let misconfiguredRole: { id: string };
let misconfiguredUser: { id: string };

beforeAll(async () => {
  users = await createTestUsers();

  const role = await prisma.role.create({
    data: {
      name: "rbac-vitest-misconfigured-role-2",
      description: "Test-only role with users:update but not super_admin",
      permissions: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE],
      isSystem: false,
    },
  });
  misconfiguredRole = role;
  const user = await prisma.user.create({
    data: { email: "rbac-vitest-misconfigured-2@test.internal", name: "Misconfigured Role Test User 2", roleId: role.id },
  });
  misconfiguredUser = { id: user.id };
});

afterAll(async () => {
  await cleanupTestUsers(users);
  await prisma.auditLog.deleteMany({
    where: { OR: [{ userId: misconfiguredUser.id }, { entityId: misconfiguredUser.id }] },
  });
  await prisma.passwordResetToken.deleteMany({ where: { userId: misconfiguredUser.id } });
  await prisma.user.delete({ where: { id: misconfiguredUser.id } });
  await prisma.role.delete({ where: { id: misconfiguredRole.id } });
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

async function unauthorizedAccessCount(userId: string): Promise<number> {
  return prisma.auditLog.count({ where: { action: "unauthorized_access", userId } });
}

describe("setUserActive", () => {
  afterAll(async () => {
    // Leave the fixture user active for any other suite that reuses it.
    mockSessionFor(users.super_admin);
    await setUserActive(users.content_manager.id, true);
  });

  it("is denied without users:update", async () => {
    mockSessionFor(users.viewer);
    const before = await unauthorizedAccessCount(users.viewer.id);
    const result = await setUserActive(users.booking_manager.id, false);
    expect(result.success).toBe(false);
    expect(await unauthorizedAccessCount(users.viewer.id)).toBe(before + 1);
  });

  it("denies self-deactivation, even for super_admin", async () => {
    mockSessionFor(users.super_admin);
    const result = await setUserActive(users.super_admin.id, false);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/own account status/i);

    const stillActive = await prisma.user.findUniqueOrThrow({ where: { id: users.super_admin.id } });
    expect(stillActive.isActive).toBe(true);
  });

  it("super_admin can disable and re-enable another user's account, audit-logged each time", async () => {
    mockSessionFor(users.super_admin);

    const disableResult = await setUserActive(users.content_manager.id, false);
    expect(disableResult.success).toBe(true);
    const afterDisable = await prisma.user.findUniqueOrThrow({ where: { id: users.content_manager.id } });
    expect(afterDisable.isActive).toBe(false);

    const enableResult = await setUserActive(users.content_manager.id, true);
    expect(enableResult.success).toBe(true);
    const afterEnable = await prisma.user.findUniqueOrThrow({ where: { id: users.content_manager.id } });
    expect(afterEnable.isActive).toBe(true);

    const auditCount = await prisma.auditLog.count({
      where: { action: "update", entityType: "user", entityId: users.content_manager.id },
    });
    expect(auditCount).toBeGreaterThanOrEqual(2);
  });

  it("is a no-op success when the account is already in the requested state", async () => {
    mockSessionFor(users.super_admin);
    const result = await setUserActive(users.viewer.id, true); // fixture users are created active
    expect(result.success).toBe(true);
  });

  it("blocks a non-super-admin (even with users:update) from deactivating a super_admin account", async () => {
    const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "super_admin" } });
    const target = await prisma.user.create({
      data: { email: "rbac-vitest-target-superadmin-2@test.internal", name: "Target 2", roleId: superAdminRole.id },
    });

    try {
      mockSessionFor(misconfiguredUser);
      const before = await unauthorizedAccessCount(misconfiguredUser.id);
      const result = await setUserActive(target.id, false);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toMatch(/only a super_admin/i);
      expect(await unauthorizedAccessCount(misconfiguredUser.id)).toBe(before + 1);

      const stillActive = await prisma.user.findUniqueOrThrow({ where: { id: target.id } });
      expect(stillActive.isActive).toBe(true);
    } finally {
      await prisma.auditLog.deleteMany({ where: { OR: [{ userId: target.id }, { entityId: target.id }] } });
      await prisma.user.delete({ where: { id: target.id } });
    }
  });

  it("fails cleanly for a nonexistent target user", async () => {
    mockSessionFor(users.super_admin);
    const result = await setUserActive("nonexistent-user-id", false);
    expect(result.success).toBe(false);
  });
});

describe("adminSendPasswordReset", () => {
  it("is denied without users:update", async () => {
    mockSessionFor(users.viewer);
    const result = await adminSendPasswordReset(users.booking_manager.id);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permission/i);
  });

  it("refuses to target the caller's own account", async () => {
    mockSessionFor(users.super_admin);
    const result = await adminSendPasswordReset(users.super_admin.id);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/change password/i);
  });

  it("refuses to send a reset link to an inactive account", async () => {
    mockSessionFor(users.super_admin);
    await setUserActive(users.content_manager.id, false);

    try {
      const result = await adminSendPasswordReset(users.content_manager.id);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toMatch(/inactive/i);
    } finally {
      await setUserActive(users.content_manager.id, true);
    }
  });

  it("fails cleanly for a nonexistent target user", async () => {
    mockSessionFor(users.super_admin);
    const result = await adminSendPasswordReset("nonexistent-user-id");
    expect(result.success).toBe(false);
  });

  it("never throws even when email delivery is unavailable — resolves to a typed error instead", async () => {
    mockSessionFor(users.super_admin);
    await expect(adminSendPasswordReset(users.viewer.id)).resolves.toMatchObject({ success: expect.any(Boolean) });
  });
});
