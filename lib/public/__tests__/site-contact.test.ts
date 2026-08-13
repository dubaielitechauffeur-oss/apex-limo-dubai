import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGlobalSettings } = vi.hoisted(() => ({
  mockGlobalSettings: { findFirst: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  prisma: { globalSettings: mockGlobalSettings },
}));

import { getSiteContact } from "@/lib/public/site-contact";
import { SITE } from "@/lib/constants";

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * DB-first read of GlobalSettings, with fallback to `lib/constants.ts`'s
 * `SITE` on empty/missing data or database failure. Restores the admin
 * Settings module's control over site-wide phone/WhatsApp/email while
 * keeping the public site rock-solid when the database is unavailable.
 */
describe("getSiteContact — DB-first with static fallback", () => {
  const staticContact = {
    phone: SITE.phone,
    phoneDisplay: SITE.phoneDisplay,
    whatsapp: SITE.whatsapp,
    email: SITE.email,
    notificationEmail: SITE.email,
  };

  it("returns the static SITE constant when no GlobalSettings row exists", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue(null);
    expect(await getSiteContact()).toEqual(staticContact);
  });

  it("returns the configured row when GlobalSettings is populated", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      phone: "+971500000000",
      phoneDisplay: "+971 50 000 0000",
      whatsapp: "+971500000001",
      email: "hello@apex-test.example",
      notificationEmail: "ops@apex-test.example",
    });
    expect(await getSiteContact()).toEqual({
      phone: "+971500000000",
      phoneDisplay: "+971 50 000 0000",
      whatsapp: "+971500000001",
      email: "hello@apex-test.example",
      notificationEmail: "ops@apex-test.example",
    });
  });

  it("falls back to static for each empty field so a blank admin field can't break the site", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      phone: "",
      phoneDisplay: "",
      whatsapp: "+971500000001",
      email: "",
      notificationEmail: "",
    });
    const result = await getSiteContact();
    expect(result.phone).toBe(SITE.phone);
    expect(result.whatsapp).toBe("+971500000001");
    expect(result.email).toBe(SITE.email);
  });

  it("degrades to static on database failure", async () => {
    mockGlobalSettings.findFirst.mockRejectedValue(new Error("simulated connection failure"));
    expect(await getSiteContact()).toEqual(staticContact);
  });
});
