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

describe("getSiteContact — database-first, static-fallback", () => {
  it("falls back to the static SITE constant when no GlobalSettings row exists", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue(null);
    const result = await getSiteContact();
    expect(result).toEqual({
      phone: SITE.phone,
      phoneDisplay: SITE.phoneDisplay,
      whatsapp: SITE.whatsapp,
      email: SITE.email,
      notificationEmail: SITE.email,
    });
  });

  it("falls back to static when the row exists but phone/whatsapp/email are still blank", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      phone: "",
      phoneDisplay: "",
      whatsapp: "",
      email: "",
      notificationEmail: "",
    });
    const result = await getSiteContact();
    expect(result.phone).toBe(SITE.phone);
    expect(result.whatsapp).toBe(SITE.whatsapp);
    expect(result.email).toBe(SITE.email);
  });

  it("falls back to static when the query throws", async () => {
    mockGlobalSettings.findFirst.mockRejectedValue(new Error("simulated connection failure"));
    const result = await getSiteContact();
    expect(result.phone).toBe(SITE.phone);
  });

  it("returns the admin-configured contact when fully set", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      phone: "+971500000000",
      phoneDisplay: "+971 50 000 0000",
      whatsapp: "+971500000001",
      email: "hello@apex-test.example",
      notificationEmail: "ops@apex-test.example",
    });
    const result = await getSiteContact();
    expect(result).toEqual({
      phone: "+971500000000",
      phoneDisplay: "+971 50 000 0000",
      whatsapp: "+971500000001",
      email: "hello@apex-test.example",
      notificationEmail: "ops@apex-test.example",
    });
  });

  it("falls back the notification email to the public email when notificationEmail is blank", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      phone: "+971500000000",
      phoneDisplay: "+971 50 000 0000",
      whatsapp: "+971500000001",
      email: "hello@apex-test.example",
      notificationEmail: "",
    });
    const result = await getSiteContact();
    expect(result.notificationEmail).toBe("hello@apex-test.example");
  });
});
