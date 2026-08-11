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
 * Contact details are served from `lib/constants.ts`; the database is not in
 * the public read path. These assert that directly — including that a fully
 * populated GlobalSettings row is ignored — so the guarantee can't be
 * quietly undone by re-introducing a query here.
 */
describe("getSiteContact — static, database not in the read path", () => {
  const staticContact = {
    phone: SITE.phone,
    phoneDisplay: SITE.phoneDisplay,
    whatsapp: SITE.whatsapp,
    email: SITE.email,
    notificationEmail: SITE.email,
  };

  it("returns the static SITE constant", async () => {
    expect(await getSiteContact()).toEqual(staticContact);
  });

  it("never queries the database", async () => {
    await getSiteContact();
    expect(mockGlobalSettings.findFirst).not.toHaveBeenCalled();
  });

  it("still returns static even when a fully configured row would be available", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      phone: "+971500000000",
      phoneDisplay: "+971 50 000 0000",
      whatsapp: "+971500000001",
      email: "hello@apex-test.example",
      notificationEmail: "ops@apex-test.example",
    });
    expect(await getSiteContact()).toEqual(staticContact);
  });

  it("is unaffected by a database failure", async () => {
    mockGlobalSettings.findFirst.mockRejectedValue(new Error("simulated connection failure"));
    expect(await getSiteContact()).toEqual(staticContact);
  });
});
