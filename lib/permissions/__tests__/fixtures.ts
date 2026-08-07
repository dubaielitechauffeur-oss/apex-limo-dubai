import { prisma } from "@/lib/db";
import { SYSTEM_ROLES, type SystemRole } from "@/lib/permissions/roles";

/**
 * Test fixtures for the RBAC integration suite — real Postgres rows, not
 * mocks, for everything except "who is currently signed in" (each test
 * file mocks `@/lib/auth/session`'s `getSession` for that one boundary; see
 * guard.integration.test.ts for why). Exercising real Prisma queries
 * against the real seeded `Role` rows is the point: these tests would not
 * catch a seed/catalog drift bug if the permission data itself were faked.
 */

export interface TestUser {
  id: string;
  roleName: SystemRole;
}

const TEST_EMAIL_PREFIX = "rbac-vitest-";

export async function createTestUsers(): Promise<Record<SystemRole, TestUser>> {
  const roles = await prisma.role.findMany({ where: { name: { in: [...SYSTEM_ROLES] } } });
  const roleByName = new Map(roles.map((r) => [r.name, r]));

  const result = {} as Record<SystemRole, TestUser>;
  for (const roleName of SYSTEM_ROLES) {
    const role = roleByName.get(roleName);
    if (!role) {
      throw new Error(`Seeded role "${roleName}" not found — run \`npm run db:seed\` before the test suite.`);
    }
    const user = await prisma.user.upsert({
      where: { email: `${TEST_EMAIL_PREFIX}${roleName}@test.internal` },
      update: { roleId: role.id, isActive: true, deletedAt: null },
      create: {
        email: `${TEST_EMAIL_PREFIX}${roleName}@test.internal`,
        name: `RBAC Test (${roleName})`,
        roleId: role.id,
      },
    });
    result[roleName] = { id: user.id, roleName };
  }
  return result;
}

export async function cleanupTestUsers(users: Record<SystemRole, TestUser>): Promise<void> {
  const ids = Object.values(users).map((u) => u.id);
  await prisma.auditLog.deleteMany({ where: { OR: [{ userId: { in: ids } }, { entityId: { in: ids } }] } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
