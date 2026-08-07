import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

import { prisma } from "@/lib/db";
import { listAuditLogs } from "@/lib/admin/audit";
import { assignUserRole } from "@/lib/permissions/roles-admin";

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

describe("listAuditLogs — permission gating", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await listAuditLogs({});
    expect(result.success).toBe(false);
  });

  it("content_manager lacks audit:read and is denied", async () => {
    mockSessionFor(users.content_manager);
    const result = await listAuditLogs({});
    expect(result.success).toBe(false);
  });

  it("super_admin can read the audit log", async () => {
    mockSessionFor(users.super_admin);
    const result = await listAuditLogs({});
    expect(result.success).toBe(true);
  });
});

describe("listAuditLogs — filtering", () => {
  it("filters by action=update and finds a real role-change entry", async () => {
    mockSessionFor(users.super_admin);

    const seoRole = await prisma.role.findUniqueOrThrow({ where: { name: "seo_manager" } });
    const viewerRole = await prisma.role.findUniqueOrThrow({ where: { name: "viewer" } });
    await assignUserRole(users.viewer.id, seoRole.id);
    await assignUserRole(users.viewer.id, viewerRole.id);

    const result = await listAuditLogs({ action: "update", entityType: "user", q: users.viewer.id });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entries.length).toBeGreaterThan(0);
      expect(result.data.entries.every((entry) => entry.action === "update")).toBe(true);
    }
  });

  it("an unrecognized action filter value is ignored rather than throwing", async () => {
    mockSessionFor(users.super_admin);
    await expect(listAuditLogs({ action: "not-a-real-action" })).resolves.toMatchObject({ success: true });
  });

  it("a future date range (from tomorrow) returns zero results", async () => {
    mockSessionFor(users.super_admin);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const result = await listAuditLogs({ from: tomorrow });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.entries.length).toBe(0);
  });

  it("paginates consistently", async () => {
    mockSessionFor(users.super_admin);
    const result = await listAuditLogs({ page: 1, pageSize: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entries.length).toBeLessThanOrEqual(1);
      expect(result.data.page).toBe(1);
    }
  });
});
