import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db";
import { SYSTEM_ROLES, ROLE_PERMISSIONS } from "@/lib/permissions/roles";
import { ALL_PERMISSIONS } from "@/lib/permissions/catalog";

/**
 * Verifies the ACTUAL seeded database matches lib/permissions/roles.ts —
 * catches the case where someone edits the seed data (or the catalog) and
 * forgets to re-run `npm run db:seed`, or the two drift apart some other
 * way. Requires a real Postgres instance with the seed already applied
 * (`npm run db:seed`).
 */
describe("seeded roles match the RBAC catalog (integration)", () => {
  it.each(SYSTEM_ROLES)("role %s exists in the database as a system role", async (roleName) => {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    expect(role).not.toBeNull();
    expect(role?.isSystem).toBe(true);
  });

  it.each(SYSTEM_ROLES)("role %s's database permissions exactly match ROLE_PERMISSIONS", async (roleName) => {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    const expected = [...ROLE_PERMISSIONS[roleName]].sort();
    const actual = [...role.permissions].sort();
    expect(actual).toEqual(expected);
  });

  it("every permission granted to any seeded role is a declared catalog member", async () => {
    const roles = await prisma.role.findMany({ where: { name: { in: [...SYSTEM_ROLES] } } });
    for (const role of roles) {
      for (const permission of role.permissions) {
        expect(ALL_PERMISSIONS).toContain(permission);
      }
    }
  });

  it("admin has strictly fewer permissions than super_admin (below it, not equal)", async () => {
    const [admin, superAdmin] = await Promise.all([
      prisma.role.findUniqueOrThrow({ where: { name: "admin" } }),
      prisma.role.findUniqueOrThrow({ where: { name: "super_admin" } }),
    ]);
    expect(admin.permissions.length).toBeLessThan(superAdmin.permissions.length);
    // And admin's grants are a subset of super_admin's — "broad but below".
    for (const permission of admin.permissions) {
      expect(superAdmin.permissions).toContain(permission);
    }
  });

  it("only super_admin holds the user-management write permissions", async () => {
    const roles = await prisma.role.findMany({ where: { name: { in: [...SYSTEM_ROLES] } } });
    const writePerms = ["users:create", "users:update", "users:delete"];
    for (const role of roles) {
      if (role.name === "super_admin") continue;
      for (const perm of writePerms) {
        expect(role.permissions).not.toContain(perm);
      }
    }
  });
});
