import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import { getGlobalSettings, updateGlobalSettings, updateDefaultSeo, type GlobalSettingsInput } from "@/lib/admin/settings";
import { emptySeoMeta } from "@/lib/cms/seo";
import type { GlobalSettings, Prisma } from "@/lib/generated/prisma/client";

let users: Record<SystemRole, TestUser>;
/** GlobalSettings is a single-row table — snapshot whatever exists before
 *  this suite runs and restore it afterward, so these tests never leave
 *  the dev database's real settings row (or its absence) altered. */
let originalRow: GlobalSettings | null;

beforeAll(async () => {
  users = await createTestUsers();
  originalRow = await prisma.globalSettings.findFirst();
});

/** Explicit field list (not a blind spread) — Prisma's JSON input types
 *  (`InputJsonValue`) reject the plain `null` that a `Json` column's
 *  *output* type (`JsonValue`) allows, so `{ ...row }` doesn't type-check
 *  against `create`/`update` data without this cast. */
function toSettingsData(row: GlobalSettings): Prisma.GlobalSettingsUncheckedCreateInput {
  return {
    companyName: row.companyName,
    shortName: row.shortName,
    phone: row.phone,
    phoneDisplay: row.phoneDisplay,
    whatsapp: row.whatsapp,
    email: row.email,
    address: row.address as Prisma.InputJsonValue,
    defaultCurrency: row.defaultCurrency,
    timezone: row.timezone,
    fleetSizeDisplay: row.fleetSizeDisplay,
    ratingDisplay: row.ratingDisplay,
    socialLinks: row.socialLinks as Prisma.InputJsonValue,
    businessHours: row.businessHours as Prisma.InputJsonValue | undefined,
    footer: row.footer as Prisma.InputJsonValue,
    defaultSeo: row.defaultSeo as Prisma.InputJsonValue,
    logoId: row.logoId,
    faviconId: row.faviconId,
    notificationEmail: row.notificationEmail,
    whatsappGreeting: row.whatsappGreeting as Prisma.InputJsonValue | undefined,
  };
}

afterEach(async () => {
  // Restore to the pre-suite snapshot after every test — several tests
  // intentionally create/mutate the singleton row.
  const current = await prisma.globalSettings.findFirst();
  if (originalRow) {
    const data = toSettingsData(originalRow);
    if (current) {
      await prisma.globalSettings.update({ where: { id: current.id }, data });
    } else {
      await prisma.globalSettings.create({ data });
    }
  } else if (current) {
    await prisma.globalSettings.delete({ where: { id: current.id } });
  }
});

afterAll(async () => {
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

function fixtureInput(overrides?: Partial<GlobalSettingsInput>): GlobalSettingsInput {
  return {
    companyName: "Vitest Limo Co",
    shortName: "Vitest Limo",
    phone: "+971500000000",
    phoneDisplay: "+971 50 000 0000",
    whatsapp: "+971500000000",
    email: "vitest@example.com",
    notificationEmail: "ops-vitest@example.com",
    defaultCurrency: "AED",
    timezone: "Asia/Dubai",
    fleetSizeDisplay: "20+",
    ratingDisplay: "4.9",
    ...overrides,
  };
}

describe("getGlobalSettings — permission gating", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await getGlobalSettings();
    expect(result.success).toBe(false);
  });

  it("content_manager lacks settings:read and is denied", async () => {
    mockSessionFor(users.content_manager);
    const result = await getGlobalSettings();
    expect(result.success).toBe(false);
  });

  it("viewer can read settings", async () => {
    mockSessionFor(users.viewer);
    const result = await getGlobalSettings();
    expect(result.success).toBe(true);
  });
});

describe("updateGlobalSettings — permission gating, validation, and persistence", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await updateGlobalSettings(fixtureInput());
    expect(result.success).toBe(false);
  });

  it("seo_manager has settings:update and is allowed through the gate", async () => {
    mockSessionFor(users.seo_manager);
    const result = await updateGlobalSettings(fixtureInput());
    expect(result.success).toBe(true);
  });

  it("fleet_manager lacks settings:update and is denied", async () => {
    mockSessionFor(users.fleet_manager);
    const result = await updateGlobalSettings(fixtureInput());
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone format", async () => {
    mockSessionFor(users.super_admin);
    const result = await updateGlobalSettings(fixtureInput({ phone: "not-a-phone" }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", async () => {
    mockSessionFor(users.super_admin);
    const result = await updateGlobalSettings(fixtureInput({ email: "not-an-email" }));
    expect(result.success).toBe(false);
  });

  it("rejects a blank company name", async () => {
    mockSessionFor(users.super_admin);
    const result = await updateGlobalSettings(fixtureInput({ companyName: "  " }));
    expect(result.success).toBe(false);
  });

  it("creates the row on first save when none exists, and updates it on the next save", async () => {
    await prisma.globalSettings.deleteMany({});
    mockSessionFor(users.super_admin);

    const createResult = await updateGlobalSettings(fixtureInput({ companyName: "First Save Co" }));
    expect(createResult.success).toBe(true);
    const created = await prisma.globalSettings.findFirst();
    expect(created?.companyName).toBe("First Save Co");
    expect(created?.phone).toBe("+971500000000");

    const updateResult = await updateGlobalSettings(fixtureInput({ companyName: "Second Save Co" }));
    expect(updateResult.success).toBe(true);
    const rows = await prisma.globalSettings.findMany({});
    expect(rows).toHaveLength(1);
    expect(rows[0]?.companyName).toBe("Second Save Co");
  });

  it("writes a settings_change audit log entry", async () => {
    mockSessionFor(users.super_admin);
    const before = await prisma.auditLog.count({ where: { action: "settings_change", entityType: "global_settings" } });
    await updateGlobalSettings(fixtureInput());
    expect(await prisma.auditLog.count({ where: { action: "settings_change", entityType: "global_settings" } })).toBe(before + 1);
  });
});

describe("updateDefaultSeo — permission gating, validation, and persistence", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await updateDefaultSeo(emptySeoMeta());
    expect(result.success).toBe(false);
  });

  it("seo_manager has seo:update and is allowed", async () => {
    mockSessionFor(users.seo_manager);
    const seo = { ...emptySeoMeta(), title: { en: "Vitest Default Title", ar: "", ru: "", zh: "", fr: "", de: "" } };
    const result = await updateDefaultSeo(seo);
    expect(result.success).toBe(true);

    const row = await prisma.globalSettings.findFirst();
    expect((row?.defaultSeo as { title?: { en?: string } } | null)?.title?.en).toBe("Vitest Default Title");
  });

  it("fleet_manager lacks seo:update and is denied", async () => {
    mockSessionFor(users.fleet_manager);
    const result = await updateDefaultSeo(emptySeoMeta());
    expect(result.success).toBe(false);
  });

  it("creates the row on first save when none exists, with placeholder contact fields", async () => {
    await prisma.globalSettings.deleteMany({});
    mockSessionFor(users.super_admin);

    const seo = { ...emptySeoMeta(), title: { en: "First SEO Save", ar: "", ru: "", zh: "", fr: "", de: "" } };
    const result = await updateDefaultSeo(seo);
    expect(result.success).toBe(true);

    const row = await prisma.globalSettings.findFirst();
    expect(row).not.toBeNull();
    expect((row?.defaultSeo as { title?: { en?: string } } | null)?.title?.en).toBe("First SEO Save");
  });

  it("does not clobber phone/whatsapp/email already saved via updateGlobalSettings", async () => {
    mockSessionFor(users.super_admin);
    await updateGlobalSettings(fixtureInput({ phone: "+971511111111" }));

    const seo = { ...emptySeoMeta(), title: { en: "Non-clobbering SEO", ar: "", ru: "", zh: "", fr: "", de: "" } };
    await updateDefaultSeo(seo);

    const row = await prisma.globalSettings.findFirst();
    expect(row?.phone).toBe("+971511111111");
  });

  it("writes a settings_change audit log entry", async () => {
    mockSessionFor(users.super_admin);
    const before = await prisma.auditLog.count({ where: { action: "settings_change", entityType: "global_settings" } });
    await updateDefaultSeo(emptySeoMeta());
    expect(await prisma.auditLog.count({ where: { action: "settings_change", entityType: "global_settings" } })).toBe(before + 1);
  });
});
