import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockService, mockLocation, mockBlogPost, mockFaq, mockTestimonial, mockBrand, mockHeroSlide } = vi.hoisted(
  () => ({
    mockService: { findMany: vi.fn() },
    mockLocation: { findMany: vi.fn() },
    mockBlogPost: { findMany: vi.fn() },
    mockFaq: { findMany: vi.fn() },
    mockTestimonial: { findMany: vi.fn(), count: vi.fn() },
    mockBrand: { findMany: vi.fn() },
    mockHeroSlide: { findMany: vi.fn() },
  })
);

vi.mock("@/lib/db", () => ({
  prisma: {
    service: mockService,
    location: mockLocation,
    blogPost: mockBlogPost,
    faq: mockFaq,
    testimonial: mockTestimonial,
    brand: mockBrand,
    heroSlide: mockHeroSlide,
  },
}));

import {
  getAllServices,
  getServiceBySlug,
  getAllLocations,
  getLocationBySlug,
  getAllBlogPosts,
  getBlogPostBySlug,
  getAllFaqs,
  getFeaturedTestimonials,
  getBrands,
  getHeroSlides,
  getServiceSitemapEntries,
  getLocationSitemapEntries,
  getBlogPostSitemapEntries,
} from "@/lib/public/cms-content";
import { SERVICES } from "@/data/services";
import { LOCATIONS } from "@/data/locations";
import { BLOG_POSTS } from "@/data/blog";
import { TESTIMONIALS } from "@/data/testimonials";
import { BRANDS } from "@/data/brands";

const DB_ERROR = new Error("simulated connection failure");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("database failure fallback — every query throws", () => {
  it("getAllServices falls back to the static service list", async () => {
    mockService.findMany.mockRejectedValue(DB_ERROR);
    const result = await getAllServices("en");
    expect(result.length).toBe(SERVICES.length);
    expect(result.some((s) => s.slug === "airport-transfers")).toBe(true);
  });

  it("getServiceBySlug falls back to the static lookup", async () => {
    mockService.findMany.mockRejectedValue(DB_ERROR);
    const result = await getServiceBySlug("airport-transfers", "en");
    expect(result?.slug).toBe("airport-transfers");
  });

  it("getAllLocations falls back to the static location list", async () => {
    mockLocation.findMany.mockRejectedValue(DB_ERROR);
    const result = await getAllLocations("en");
    expect(result.length).toBe(LOCATIONS.length);
  });

  it("getLocationBySlug falls back to the static lookup", async () => {
    mockLocation.findMany.mockRejectedValue(DB_ERROR);
    const result = await getLocationBySlug("dubai-marina", "en");
    expect(result?.slug).toBe("dubai-marina");
  });

  it("getAllBlogPosts falls back to the static blog list", async () => {
    mockBlogPost.findMany.mockRejectedValue(DB_ERROR);
    const result = await getAllBlogPosts("en");
    expect(result.length).toBe(BLOG_POSTS.length);
  });

  it("getBlogPostBySlug falls back to the static lookup", async () => {
    mockBlogPost.findMany.mockRejectedValue(DB_ERROR);
    const result = await getBlogPostBySlug(BLOG_POSTS[0].slug, "en");
    expect(result?.slug).toBe(BLOG_POSTS[0].slug);
  });

  it("getAllFaqs falls back to the static FAQ hub aggregation", async () => {
    mockFaq.findMany.mockRejectedValue(DB_ERROR);
    const result = await getAllFaqs("en");
    expect(result.length).toBeGreaterThan(0);
  });

  it("getFeaturedTestimonials falls back to static featured testimonials", async () => {
    mockTestimonial.count.mockRejectedValue(DB_ERROR);
    const result = await getFeaturedTestimonials();
    expect(result).toEqual(TESTIMONIALS.filter((t) => t.featured));
  });

  it("getBrands falls back to the static brand list", async () => {
    mockBrand.findMany.mockRejectedValue(DB_ERROR);
    const result = await getBrands();
    expect(result).toEqual(BRANDS);
  });

  it("getHeroSlides degrades to an empty array (no static fallback source exists)", async () => {
    mockHeroSlide.findMany.mockRejectedValue(DB_ERROR);
    const result = await getHeroSlides("en");
    expect(result).toEqual([]);
  });

  it("sitemap helpers fall back to static slug lists", async () => {
    mockService.findMany.mockRejectedValue(DB_ERROR);
    mockLocation.findMany.mockRejectedValue(DB_ERROR);
    mockBlogPost.findMany.mockRejectedValue(DB_ERROR);

    const [services, locations, posts] = await Promise.all([
      getServiceSitemapEntries(),
      getLocationSitemapEntries(),
      getBlogPostSitemapEntries(),
    ]);
    expect(services.map((s) => s.slug).sort()).toEqual(SERVICES.map((s) => s.slug).sort());
    expect(locations.map((l) => l.slug).sort()).toEqual(LOCATIONS.map((l) => l.slug).sort());
    expect(posts.map((p) => p.slug).sort()).toEqual(BLOG_POSTS.map((p) => p.slug).sort());
  });
});

describe("empty CMS table fallback — every query resolves with zero rows", () => {
  it("getAllServices falls back when the table is empty", async () => {
    mockService.findMany.mockResolvedValue([]);
    const result = await getAllServices("en");
    expect(result.length).toBe(SERVICES.length);
  });

  it("getAllLocations falls back when the table is empty", async () => {
    mockLocation.findMany.mockResolvedValue([]);
    const result = await getAllLocations("en");
    expect(result.length).toBe(LOCATIONS.length);
  });

  it("getAllBlogPosts falls back when the table is empty", async () => {
    mockBlogPost.findMany.mockResolvedValue([]);
    const result = await getAllBlogPosts("en");
    expect(result.length).toBe(BLOG_POSTS.length);
  });

  it("getFeaturedTestimonials falls back when the table has zero rows total", async () => {
    mockTestimonial.count.mockResolvedValue(0);
    const result = await getFeaturedTestimonials();
    expect(result).toEqual(TESTIMONIALS.filter((t) => t.featured));
  });

  it("getBrands falls back when the table is empty", async () => {
    mockBrand.findMany.mockResolvedValue([]);
    const result = await getBrands();
    expect(result).toEqual(BRANDS);
  });
});
