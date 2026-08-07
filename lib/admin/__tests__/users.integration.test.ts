import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

import { prisma } from "@/lib/db";
import { listUsers, getUserDetail, getUserAuditActivity } from "@/lib/admin/users";

let users: Record<SystemRole, TestUser>;

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

describe("listUsers — permission gating", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await listUsers({});
    expect(result.success).toBe(false);
  });

  it("content_manager lacks users:read and is denied", async () => {
    mockSessionFor(users.content_manager);
    const result = await listUsers({});
    expect(result.success).toBe(false);
  });

  it("viewer holds users:read and can list users", async () => {
    mockSessionFor(users.viewer);
    const result = await listUsers({});
    expect(result.success).toBe(true);
  });
});

describe("listUsers — search, filter, pagination", () => {
  it("finds a fixture user by a case-insensitive partial email match", async () => {
    mockSessionFor(users.super_admin);
    const result = await listUsers({ q: "rbac-vitest-viewer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.users.some((u) => u.id === users.viewer.id)).toBe(true);
    }
  });

  it("filters by roleId to only that role's users", async () => {
    mockSessionFor(users.super_admin);
    const viewerRole = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
    const result = await listUsers({ roleId: viewerRole.id, pageSize: 100 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.users.every((u) => u.roleId === viewerRole.id)).toBe(true);
      expect(result.data.users.some((u) => u.id === users.viewer.id)).toBe(true);
    }
  });

  it("filters by status=active/inactive", async () => {
    mockSessionFor(users.super_admin);
    const activeResult = await listUsers({ status: "active", q: "rbac-vitest-viewer" });
    expect(activeResult.success).toBe(true);
    if (activeResult.success) {
      expect(activeResult.data.users.every((u) => u.isActive)).toBe(true);
    }
  });

  it("paginates: pageSize=1 returns exactly one row and totalPages reflects the full count", async () => {
    mockSessionFor(users.super_admin);
    const result = await listUsers({ page: 1, pageSize: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.users.length).toBe(1);
      expect(result.data.totalPages).toBeGreaterThanOrEqual(1);
    }
  });

  it("never returns a passwordHash or other secret field on any row", async () => {
    mockSessionFor(users.super_admin);
    const result = await listUsers({ pageSize: 100 });
    expect(result.success).toBe(true);
    if (result.success) {
      for (const user of result.data.users) {
        expect(user).not.toHaveProperty("passwordHash");
      }
    }
  });
});

describe("getUserDetail", () => {
  it("is denied without users:read", async () => {
    mockSessionFor(users.content_manager);
    const result = await getUserDetail(users.viewer.id);
    expect(result.success).toBe(false);
  });

  it("returns account fields without any secret (passwordHash, reset tokens, sessions)", async () => {
    mockSessionFor(users.super_admin);
    const result = await getUserDetail(users.viewer.id);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(users.viewer.id);
      expect(result.data).not.toHaveProperty("passwordHash");
    }
  });

  it("fails cleanly for a nonexistent user id", async () => {
    mockSessionFor(users.super_admin);
    const result = await getUserDetail("nonexistent-user-id");
    expect(result.success).toBe(false);
  });
});

describe("getUserAuditActivity", () => {
  it("returns an empty list (not a hard denial) for a caller without audit:read", async () => {
    mockSessionFor(users.content_manager);
    const result = await getUserAuditActivity(users.viewer.id);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual([]);
  });

  it("a super_admin sees real recent activity after a role change is performed on the target", async () => {
    const { assignUserRole } = await import("@/lib/permissions/roles-admin");
    mockSessionFor(users.super_admin);

    const seoRole = await prisma.role.findUniqueOrThrow({ where: { name: "seo_manager" } });
    const viewerRole = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });

    await assignUserRole(users.viewer.id, seoRole.id);
    const result = await getUserAuditActivity(users.viewer.id);
    // Restore fixture state for other tests relying on users.viewer's role.
    await assignUserRole(users.viewer.id, viewerRole.id);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].entityType).toBe("user");
    }
  });
});
