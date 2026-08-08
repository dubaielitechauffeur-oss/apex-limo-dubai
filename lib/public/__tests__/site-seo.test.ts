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

describe("getDefaultSeoOverride — database-first, static-fallback", () => {
  it("returns null when no GlobalSettings row exists", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue(null);
    const result = await getDefaultSeoOverride("en");
    expect(result).toBeNull();
  });

  it("returns null when defaultSeo has never been configured (empty object)", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({ defaultSeo: {} });
    const result = await getDefaultSeoOverride("en");
    expect(result).toBeNull();
  });

  it("returns null when the title for this locale is blank, even with other fields set", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: { title: { en: "" }, description: { en: "Has a description" }, noIndex: false, noFollow: false, ogImageId: null },
    });
    const result = await getDefaultSeoOverride("en");
    expect(result).toBeNull();
  });

  it("returns null when the query throws", async () => {
    mockGlobalSettings.findFirst.mockRejectedValue(new Error("simulated connection failure"));
    const result = await getDefaultSeoOverride("en");
    expect(result).toBeNull();
  });

  it("returns the configured override for the requested locale", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: {
        title: { en: "English Title", ar: "Arabic Title" },
        description: { en: "English description", ar: "Arabic description" },
        noIndex: true,
        noFollow: false,
        ogImageId: null,
      },
    });
    const result = await getDefaultSeoOverride("ar");
    expect(result).toEqual({
      title: "Arabic Title",
      description: "Arabic description",
      ogImageUrl: null,
      noIndex: true,
      noFollow: false,
    });
  });

  it("falls back to the default locale's title when the requested locale has none", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: { title: { en: "English Title" }, description: { en: "English description" }, noIndex: false, noFollow: false, ogImageId: null },
    });
    const result = await getDefaultSeoOverride("fr");
    expect(result?.title).toBe("English Title");
  });

  it("resolves the OG image URL from MediaItem when ogImageId is set", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: { title: { en: "Title" }, description: { en: "Desc" }, noIndex: false, noFollow: false, ogImageId: "media-123" },
    });
    mockMediaItem.findUnique.mockResolvedValue({ url: "/uploads/og-custom.jpg" });

    const result = await getDefaultSeoOverride("en");
    expect(result?.ogImageUrl).toBe("/uploads/og-custom.jpg");
    expect(mockMediaItem.findUnique).toHaveBeenCalledWith({ where: { id: "media-123" }, select: { url: true } });
  });

  it("returns null ogImageUrl when the referenced media item no longer exists", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: { title: { en: "Title" }, description: { en: "Desc" }, noIndex: false, noFollow: false, ogImageId: "deleted-media" },
    });
    mockMediaItem.findUnique.mockResolvedValue(null);

    const result = await getDefaultSeoOverride("en");
    expect(result?.ogImageUrl).toBeNull();
  });
});
