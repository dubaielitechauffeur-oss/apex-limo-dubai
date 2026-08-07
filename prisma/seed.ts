import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hashPassword } from "../lib/auth/password";
import { SYSTEM_ROLES, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from "../lib/permissions/roles";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Sourced from lib/permissions/roles.ts (Phase 4 RBAC) — the single source
// of truth for role→permission grants, so the seeded database and the
// application's authorization catalog can never drift apart. Values are
// unchanged from the original Phase 2B/2C seed; only the literals moved.
const ROLES = SYSTEM_ROLES.map((name) => ({
  name,
  description: ROLE_DESCRIPTIONS[name],
  isSystem: true,
  permissions: ROLE_PERMISSIONS[name],
}));

async function main() {
  console.log("Seeding database...\n");

  // ── Roles ──────────────────────────────────────────────────────────────
  console.log("Creating roles...");
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
      },
      create: role,
    });
    console.log(`  + ${role.name} (${role.permissions.length} permissions)`);
  }

  // ── FAQ Categories ─────────────────────────────────────────────────────
  console.log("\nCreating FAQ categories...");
  const faqCategories = [
    { key: "booking", showChip: true, sortOrder: 0 },
    { key: "airport-transfers", showChip: true, sortOrder: 1 },
    { key: "pricing", showChip: true, sortOrder: 2 },
    { key: "fleet", showChip: true, sortOrder: 3 },
    { key: "corporate-travel", showChip: true, sortOrder: 4 },
    { key: "wedding-chauffeurs", showChip: true, sortOrder: 5 },
    { key: "vip-transportation", showChip: true, sortOrder: 6 },
    { key: "locations", showChip: true, sortOrder: 7 },
    { key: "safety", showChip: false, sortOrder: 8 },
    { key: "general-questions", showChip: false, sortOrder: 9 },
  ];

  for (const cat of faqCategories) {
    await prisma.faqCategory.upsert({
      where: { key: cat.key },
      update: {
        showChip: cat.showChip,
        sortOrder: cat.sortOrder,
      },
      create: {
        key: cat.key,
        name: { en: cat.key.replace(/-/g, " "), ar: "", ru: "", zh: "", fr: "", de: "" },
        showChip: cat.showChip,
        sortOrder: cat.sortOrder,
      },
    });
    console.log(`  + ${cat.key}`);
  }

  // ── Vehicle Categories ─────────────────────────────────────────────────
  console.log("\nCreating vehicle categories...");
  const vehicleCategories = [
    {
      slug: "sedan",
      name: { en: "Sedan", ar: "سيدان", ru: "Седан", zh: "轿车", fr: "Berline", de: "Limousine" },
      sortOrder: 0,
    },
    {
      slug: "suv",
      name: { en: "SUV", ar: "دفع رباعي", ru: "Внедорожник", zh: "越野车", fr: "SUV", de: "SUV" },
      sortOrder: 1,
    },
    {
      slug: "van",
      name: { en: "Van", ar: "فان", ru: "Микроавтобус", zh: "面包车", fr: "Van", de: "Van" },
      sortOrder: 2,
    },
    {
      slug: "ultra-luxury",
      name: { en: "Ultra-Luxury", ar: "فاخرة للغاية", ru: "Ультра-люкс", zh: "超豪华", fr: "Ultra-Luxe", de: "Ultra-Luxus" },
      sortOrder: 3,
    },
  ];

  for (const cat of vehicleCategories) {
    await prisma.vehicleCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: cat,
    });
    console.log(`  + ${cat.slug}`);
  }

  // ── Admin User (bootstrap) ────────────────────────────────────────────
  // Optional — only runs when both env vars are set, so seeding a fresh
  // environment never silently creates a default/guessable admin account.
  // Re-running seed does not touch the password of an already-created
  // account (`update: {}`), so this is safe to leave in .env long-term
  // without it clobbering a since-rotated password on every `db:seed`.
  console.log("\nCreating initial admin user...");
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (adminEmail && adminPassword) {
    const superAdminRole = await prisma.role.findUnique({ where: { name: "super_admin" } });
    if (!superAdminRole) {
      throw new Error("super_admin role must be seeded before the admin user.");
    }

    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: process.env.ADMIN_SEED_NAME ?? "Administrator",
        roleId: superAdminRole.id,
        passwordHash,
        emailVerified: new Date(),
      },
    });
    console.log(`  + ${adminEmail}`);
  } else {
    console.log("  (skipped — set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD to bootstrap an admin user)");
  }

  console.log("\nSeed complete!");
  console.log(`   Roles: ${ROLES.length}`);
  console.log(`   FAQ Categories: ${faqCategories.length}`);
  console.log(`   Vehicle Categories: ${vehicleCategories.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
