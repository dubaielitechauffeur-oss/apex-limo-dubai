import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGlobalSettings, mockMediaItem } = vi.hoisted(() => ({
  mockGlobalSettings: { findFirst: vi.fn() },
  mockMediaItem: { findUnique: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  prisma: { globalSettings: mockGlobalSettings, mediaItem: mockMediaItem },
}));

import { getDefaultSeoOverride } from "@/lib/public/site-seo";

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * DB-first read of GlobalSettings.defaultSeo, with null → static defaults
 * fallback. Restores the admin SEO Manager's control over site-wide meta
 * without ever letting a DB outage or empty override render a blank page.
 */
describe("getDefaultSeoOverride — DB-first with static fallback", () => {
  it("returns null when no GlobalSettings row exists", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue(null);
    expect(await getDefaultSeoOverride("en")).toBeNull();
  });

  it("returns null when the configured title and description are both empty for this locale", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: {
        title: {},
        description: {},
        ogImageId: null,
        noIndex: false,
        noFollow: false,
      },
    });
    expect(await getDefaultSeoOverride("en")).toBeNull();
  });

  it("returns the configured override with resolved OG image url when both are set", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: {
        title: { en: "Configured title" },
        description: { en: "Configured description" },
        ogImageId: "media-1",
        noIndex: false,
        noFollow: false,
      },
    });
    mockMediaItem.findUnique.mockResolvedValue({ url: "/images/og.jpg", deletedAt: null });
    const result = await getDefaultSeoOverride("en");
    expect(result).toEqual({
      title: "Configured title",
      description: "Configured description",
      ogImageUrl: "/images/og.jpg",
      noIndex: false,
      noFollow: false,
    });
  });

  it("returns null ogImageUrl when the referenced media item was soft-deleted", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: {
        title: { en: "T" },
        description: { en: "D" },
        ogImageId: "media-1",
        noIndex: false,
        noFollow: false,
      },
    });
    mockMediaItem.findUnique.mockResolvedValue({ url: "/x.jpg", deletedAt: new Date() });
    const result = await getDefaultSeoOverride("en");
    expect(result?.ogImageUrl).toBeNull();
  });

  it("falls back to English for locales with no configured translation", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: {
        title: { en: "English title" },
        description: { en: "English description" },
        ogImageId: null,
        noIndex: false,
        noFollow: false,
      },
    });
    const result = await getDefaultSeoOverride("ar");
    expect(result?.title).toBe("English title");
    expect(result?.description).toBe("English description");
  });

  it("returns null (uses static defaults) when the database query throws", async () => {
    mockGlobalSettings.findFirst.mockRejectedValue(new Error("boom"));
    expect(await getDefaultSeoOverride("en")).toBeNull();
  });
});
