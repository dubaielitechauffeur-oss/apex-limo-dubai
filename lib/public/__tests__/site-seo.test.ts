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
 * The site-wide SEO override was read from GlobalSettings.defaultSeo. The
 * database is no longer in the public read path, so this always returns null
 * and callers use the static defaults in `lib/seo.ts`. Asserting the null —
 * including when a configured override would otherwise be available — keeps
 * a re-introduced query from silently changing every page's metadata.
 */
describe("getDefaultSeoOverride — static, database not in the read path", () => {
  it("returns null so callers use the static defaults", async () => {
    expect(await getDefaultSeoOverride("en")).toBeNull();
  });

  it("never queries the database", async () => {
    await getDefaultSeoOverride("en");
    expect(mockGlobalSettings.findFirst).not.toHaveBeenCalled();
    expect(mockMediaItem.findUnique).not.toHaveBeenCalled();
  });

  it("returns null even when a configured override would be available", async () => {
    mockGlobalSettings.findFirst.mockResolvedValue({
      defaultSeo: {
        title: { en: "Configured title" },
        description: { en: "Configured description" },
        ogImageId: "media-1",
        noIndex: false,
        noFollow: false,
      },
    });
    mockMediaItem.findUnique.mockResolvedValue({ url: "/images/og.jpg" });
    expect(await getDefaultSeoOverride("en")).toBeNull();
  });

  it("returns null for every locale", async () => {
    for (const locale of ["en", "ar", "ru", "zh", "fr", "de"] as const) {
      expect(await getDefaultSeoOverride(locale)).toBeNull();
    }
  });
});
