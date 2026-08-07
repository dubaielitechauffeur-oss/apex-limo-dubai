import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "./fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

/**
 * Mocks exactly the two boundaries that can't run outside a live Next.js
 * request: `getSession` (Auth.js's session decode, which needs the request
 * AsyncLocalStorage context Phase 3 already tested end-to-end with a real
 * browser) and `redirect` (throws a Next-internal signal only meaningful
 * inside a real render). Everything else — Prisma lookups, permission
 * resolution, escalation guards, audit writes — runs for real against the
 * local Postgres instance and the actual seeded roles, so these tests
 * would catch a genuine regression in the NEW Phase 4 logic, not just in
 * the mocks.
 */
const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

// vi.mock calls above are hoisted by Vitest's transform to run before these
// (static) imports resolve, so guard.ts/api-guard.ts see the mocked modules.
import { requirePermission, requireAnyPermission, requireAllPermissions, requireRole } from "@/lib/permissions/guard";
import { requireApiPermission } from "@/lib/permissions/api-guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";

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

describe("requirePermission (page / Server Action / data-access level)", () => {
  it("unauthenticated access — redirects to /admin/login", async () => {
    mockSessionFor(null);
    await expect(requirePermission(PERMISSIONS.FLEET_READ)).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("super_admin access — passes for a permission not even in its own stored array shape check", async () => {
    mockSessionFor(users.super_admin);
    const ctx = await requirePermission(PERMISSIONS.USERS_DELETE);
    expect(ctx.roleName).toBe("super_admin");
  });

  it("admin access — passes for granted, redirected for super_admin-only", async () => {
    mockSessionFor(users.admin);
    await expect(requirePermission(PERMISSIONS.FLEET_UPDATE)).resolves.toMatchObject({ roleName: "admin" });

    mockSessionFor(users.admin);
    await expect(requirePermission(PERMISSIONS.USERS_UPDATE)).rejects.toThrow("REDIRECT:/admin/forbidden");
  });

  it("fleet_manager restrictions — fleet:update passes, bookings:update is forbidden", async () => {
    mockSessionFor(users.fleet_manager);
    await expect(requirePermission(PERMISSIONS.FLEET_UPDATE)).resolves.toBeTruthy();

    mockSessionFor(users.fleet_manager);
    await expect(requirePermission(PERMISSIONS.BOOKINGS_UPDATE)).rejects.toThrow("REDIRECT:/admin/forbidden");
  });

  it("booking_manager restrictions — bookings:create passes, fleet:update is forbidden", async () => {
    mockSessionFor(users.booking_manager);
    await expect(requirePermission(PERMISSIONS.BOOKINGS_CREATE)).resolves.toBeTruthy();

    mockSessionFor(users.booking_manager);
    await expect(requirePermission(PERMISSIONS.FLEET_UPDATE)).rejects.toThrow("REDIRECT:/admin/forbidden");
  });

  it("content_manager restrictions — blog:publish passes, users:read is forbidden", async () => {
    mockSessionFor(users.content_manager);
    await expect(requirePermission(PERMISSIONS.BLOG_PUBLISH)).resolves.toBeTruthy();

    mockSessionFor(users.content_manager);
    await expect(requirePermission(PERMISSIONS.USERS_READ)).rejects.toThrow("REDIRECT:/admin/forbidden");
  });

  it("seo_manager restrictions — seo:update passes, blog:delete is forbidden", async () => {
    mockSessionFor(users.seo_manager);
    await expect(requirePermission(PERMISSIONS.SEO_UPDATE)).resolves.toBeTruthy();

    mockSessionFor(users.seo_manager);
    await expect(requirePermission(PERMISSIONS.BLOG_DELETE)).rejects.toThrow("REDIRECT:/admin/forbidden");
  });

  it("viewer restrictions — fleet:read passes, every write is forbidden", async () => {
    mockSessionFor(users.viewer);
    await expect(requirePermission(PERMISSIONS.FLEET_READ)).resolves.toBeTruthy();

    mockSessionFor(users.viewer);
    await expect(requirePermission(PERMISSIONS.FLEET_CREATE)).rejects.toThrow("REDIRECT:/admin/forbidden");
  });
});

describe("requireAnyPermission / requireAllPermissions", () => {
  it("requireAnyPermission passes when at least one listed permission matches", async () => {
    mockSessionFor(users.booking_manager);
    await expect(
      requireAnyPermission([PERMISSIONS.FLEET_UPDATE, PERMISSIONS.BOOKINGS_READ])
    ).resolves.toBeTruthy();
  });

  it("requireAnyPermission is forbidden when none match", async () => {
    mockSessionFor(users.viewer);
    await expect(
      requireAnyPermission([PERMISSIONS.FLEET_CREATE, PERMISSIONS.FLEET_DELETE])
    ).rejects.toThrow("REDIRECT:/admin/forbidden");
  });

  it("requireAllPermissions is forbidden if even one is missing", async () => {
    mockSessionFor(users.booking_manager);
    await expect(
      requireAllPermissions([PERMISSIONS.BOOKINGS_READ, PERMISSIONS.FLEET_UPDATE])
    ).rejects.toThrow("REDIRECT:/admin/forbidden");
  });

  it("requireAllPermissions passes when every permission matches", async () => {
    mockSessionFor(users.booking_manager);
    await expect(
      requireAllPermissions([PERMISSIONS.BOOKINGS_READ, PERMISSIONS.BOOKINGS_CREATE])
    ).resolves.toBeTruthy();
  });
});

describe("requireRole (true role-level escape hatch)", () => {
  it("passes for the exact role", async () => {
    mockSessionFor(users.super_admin);
    await expect(requireRole("super_admin")).resolves.toBeTruthy();
  });

  it("redirects for a different role, even a more-privileged-sounding check", async () => {
    mockSessionFor(users.admin);
    await expect(requireRole("super_admin")).rejects.toThrow("REDIRECT:/admin/forbidden");
  });
});

describe("requireApiPermission (Route Handler / API level)", () => {
  it("unauthenticated request — 401", async () => {
    mockSessionFor(null);
    const result = await requireApiPermission(PERMISSIONS.FLEET_READ);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(401);
    }
  });

  it("authenticated but lacking the permission — 403", async () => {
    mockSessionFor(users.viewer);
    const result = await requireApiPermission(PERMISSIONS.FLEET_DELETE);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(403);
    }
  });

  it("authenticated and authorized — returns the context, no response", async () => {
    mockSessionFor(users.fleet_manager);
    const result = await requireApiPermission(PERMISSIONS.FLEET_DELETE);
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.ctx.roleName).toBe("fleet_manager");
    }
  });

  it("direct URL/API access with a valid session but insufficient role is never granted client-side trust — the permission is re-resolved from the DB every call", async () => {
    // Simulates an attempted horizontal/vertical escalation: a viewer
    // session hitting an endpoint gated on a write permission gets a real
    // 403 computed from their actual DB-stored role, not anything the
    // request itself claimed.
    mockSessionFor(users.viewer);
    const result = await requireApiPermission(PERMISSIONS.USERS_DELETE);
    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.response.status).toBe(403);
  });
});
