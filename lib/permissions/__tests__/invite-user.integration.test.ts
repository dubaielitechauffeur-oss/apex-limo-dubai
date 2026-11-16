import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "./fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));
vi.mock("next/headers", () => ({
  headers: async () => new Map<string, string>(),
}));

// The invitation email is the only side effect that leaves the process. The
// mock captures the link so the test can prove it really sets a password.
const sendInviteEmail = vi.fn();
vi.mock("@/lib/auth/email", () => ({
  sendInviteEmail: (...args: unknown[]) => sendInviteEmail(...args),
  sendPasswordResetEmail: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { inviteUser } from "@/lib/permissions/roles-admin";
import { hashResetToken, INVITE_TOKEN_TTL_MS } from "@/lib/auth/tokens";

const INVITE_EMAIL = "rbac-vitest-invitee@test.internal";
let users: Record<SystemRole, TestUser>;
let roleIds: Record<string, string>;

function signInAs(role: SystemRole) {
  mockGetSession.mockResolvedValue({ user: { id: users[role].id } });
}

async function removeInvitee() {
  await prisma.user.deleteMany({ where: { email: INVITE_EMAIL } });
}

beforeAll(async () => {
  users = await createTestUsers();
  const roles = await prisma.role.findMany({ select: { id: true, name: true } });
  roleIds = Object.fromEntries(roles.map((r) => [r.name, r.id]));
});

beforeEach(async () => {
  sendInviteEmail.mockReset();
  await removeInvitee();
});

afterAll(async () => {
  await removeInvitee();
  await cleanupTestUsers(users);
});

describe("inviteUser", () => {
  it("creates a password-less account and emails a single-use link", async () => {
    signInAs("super_admin");
    const result = await inviteUser({ name: "  Agency   SEO ", email: "RBAC-Vitest-Invitee@Test.Internal", roleId: roleIds.admin });
    expect(result).toMatchObject({ success: true, data: { email: INVITE_EMAIL, emailSent: true } });

    const user = await prisma.user.findUnique({
      where: { email: INVITE_EMAIL },
      include: { role: true, passwordResetTokens: true },
    });
    expect(user?.name).toBe("Agency SEO");
    expect(user?.role.name).toBe("admin");
    expect(user?.passwordHash).toBeNull();
    expect(user?.isActive).toBe(true);
    expect(user?.passwordResetTokens).toHaveLength(1);

    // The emailed link carries the raw token; only its hash is stored.
    const [to, name, roleLabel, url] = sendInviteEmail.mock.calls[0] as [string, string, string, string];
    expect(to).toBe(INVITE_EMAIL);
    expect(name).toBe("Agency SEO");
    expect(roleLabel).toBe("admin");
    const token = new URL(url).searchParams.get("token") ?? "";
    expect(new URL(url).pathname).toBe("/admin/reset-password");
    expect(hashResetToken(token)).toBe(user?.passwordResetTokens[0].tokenHash);

    const ttl = user!.passwordResetTokens[0].expiresAt.getTime() - Date.now();
    expect(ttl).toBeGreaterThan(INVITE_TOKEN_TTL_MS - 60_000);
    expect(ttl).toBeLessThanOrEqual(INVITE_TOKEN_TTL_MS);
  });

  it("is refused for every role that lacks users:create", async () => {
    for (const role of ["admin", "seo_manager", "content_manager", "viewer"] as const) {
      signInAs(role);
      const result = await inviteUser({ name: "Someone", email: INVITE_EMAIL, roleId: roleIds.viewer });
      expect(result.success, role).toBe(false);
    }
    expect(await prisma.user.count({ where: { email: INVITE_EMAIL } })).toBe(0);
    expect(sendInviteEmail).not.toHaveBeenCalled();
  });

  it("never grants super_admin by invitation", async () => {
    signInAs("super_admin");
    const result = await inviteUser({ name: "Someone", email: INVITE_EMAIL, roleId: roleIds.super_admin });
    expect(result.success).toBe(false);
    expect(await prisma.user.count({ where: { email: INVITE_EMAIL } })).toBe(0);
  });

  it("refuses an email that already has an account", async () => {
    signInAs("super_admin");
    const existing = await prisma.user.findUniqueOrThrow({ where: { id: users.viewer.id }, select: { email: true } });
    const result = await inviteUser({ name: "Dup", email: existing.email.toUpperCase(), roleId: roleIds.viewer });
    expect(result).toMatchObject({ success: false, error: expect.stringContaining("already exists") });
  });

  it("rejects a malformed email or missing name", async () => {
    signInAs("super_admin");
    expect((await inviteUser({ name: "Ok Name", email: "not-an-email", roleId: roleIds.viewer })).success).toBe(false);
    expect((await inviteUser({ name: " ", email: INVITE_EMAIL, roleId: roleIds.viewer })).success).toBe(false);
  });

  it("keeps the account and reports it when the email cannot be sent", async () => {
    signInAs("super_admin");
    sendInviteEmail.mockRejectedValueOnce(new Error("Resend down"));
    const result = await inviteUser({ name: "Agency SEO", email: INVITE_EMAIL, roleId: roleIds.seo_manager });
    expect(result).toMatchObject({ success: true, data: { emailSent: false } });
    expect(await prisma.user.count({ where: { email: INVITE_EMAIL } })).toBe(1);
  });
});
