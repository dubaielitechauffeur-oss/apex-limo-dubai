import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockService,
  mockLocation,
  mockBlogPost,
  mockFaq,
  mockTestimonial,
  mockBrand,
  mockHeroSlide,
  mockVehicle,
  mockPageHero,
} = vi.hoisted(
  () => ({
    mockService: { findMany: vi.fn() },
    mockLocation: { findMany: vi.fn() },
    mockBlogPost: { findMany: vi.fn() },
    mockFaq: { findMany: vi.fn() },
    mockTestimonial: { findMany: vi.fn(), count: vi.fn() },
    mockBrand: { findMany: vi.fn() },
    mockHeroSlide: { findMany: vi.fn() },
    mockVehicle: { findMany: vi.fn() },
    mockPageHero: { findUnique: vi.fn() },
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
    vehicle: mockVehicle,
    pageHero: mockPageHero,
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
  getAllVehicles,
  getVehicleBySlug,
  getVehiclesByCategorySlug,
  getPageHero,
  getServiceSitemapEntries,
  getLocationSitemapEntries,
  getBlogPostSitemapEntries,
  getVehicleSitemapEntries,
} from "@/lib/public/cms-content";
import { SERVICES } from "@/data/services";
import { LOCATIONS } from "@/data/locations";
import { BLOG_POSTS } from "@/data/blog";
import { TESTIMONIALS } from "@/data/testimonials";
import { BRANDS } from "@/data/brands";
import { FLEET } from "@/data/fleet";

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

  it("getAllVehicles falls back to the static fleet list", async () => {
    mockVehicle.findMany.mockRejectedValue(DB_ERROR);
    const result = await getAllVehicles("en");
    expect(result.length).toBe(FLEET.length);
  });

  it("getVehicleBySlug falls back to the static lookup", async () => {
    mockVehicle.findMany.mockRejectedValue(DB_ERROR);
    const result = await getVehicleBySlug(FLEET[0].slug, "en");
    expect(result?.slug).toBe(FLEET[0].slug);
  });

  it("getVehiclesByCategorySlug falls back through getAllVehicles's own fallback", async () => {
    mockVehicle.findMany.mockRejectedValue(DB_ERROR);
    const result = await getVehiclesByCategorySlug("sedan", "en");
    expect(result.every((v) => v.category === "Sedan")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("sitemap helpers fall back to static slug lists", async () => {
    mockService.findMany.mockRejectedValue(DB_ERROR);
    mockLocation.findMany.mockRejectedValue(DB_ERROR);
    mockBlogPost.findMany.mockRejectedValue(DB_ERROR);
    mockVehicle.findMany.mockRejectedValue(DB_ERROR);

    const [services, locations, posts, vehicles] = await Promise.all([
      getServiceSitemapEntries(),
      getLocationSitemapEntries(),
      getBlogPostSitemapEntries(),
      getVehicleSitemapEntries(),
    ]);
    expect(services.map((s) => s.slug).sort()).toEqual(SERVICES.map((s) => s.slug).sort());
    expect(locations.map((l) => l.slug).sort()).toEqual(LOCATIONS.map((l) => l.slug).sort());
    expect(posts.map((p) => p.slug).sort()).toEqual(BLOG_POSTS.map((p) => p.slug).sort());
    expect(vehicles.map((v) => v.slug).sort()).toEqual(FLEET.map((v) => v.slug).sort());
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

  it("getAllVehicles falls back when the table is empty", async () => {
    mockVehicle.findMany.mockResolvedValue([]);
    const result = await getAllVehicles("en");
    expect(result.length).toBe(FLEET.length);
  });
});

/**
 * Ordering is the only thing the admin panel's "Sort order" field controls,
 * and it has to survive the read layer untouched. A hardcoded category rank
 * used to be re-applied on top of it here, so an editor could reorder two
 * vehicles within one category but never move a Van above a Sedan — on the
 * /fleet listing, the category pages, the homepage carousel or the related
 * grid, all of which read `getAllVehicles`.
 *
 * Mocked rather than run against Postgres on purpose: the vehicles table is
 * empty on a CI database, so a live query would resolve through the static
 * fallback and never exercise this path at all.
 */
describe("vehicle ordering follows the admin's sort order", () => {
  /** Minimal row in the shape `mapVehicle()` reads. */
  function vehicleRow(slug: string, categorySlug: string) {
    const text = { en: slug };
    return {
      slug,
      name: slug,
      brand: "Brand",
      model: "Model",
      rates: { tenHours: 0, fiveHours: 0, oneHour: 0, airport: 0, extraHour: 0, additionalCity: 0 },
      category: { slug: categorySlug, name: { en: categorySlug } },
      isElectric: false,
      tagline: text,
      description: text,
      longDescription: text,
      passengers: 4,
      luggage: 2,
      idealFor: text,
      features: { en: [] },
      whyChoose: { en: [] },
      faqs: [],
      images: [],
      badge: null,
      isPlaceholder: false,
      amenities: [],
      popularFor: [],
      seo: null,
    };
  }

  it("returns rows in the order the query gave them, without regrouping by category", async () => {
    // Deliberately interleaved: a Van sits above a Sedan, which the old
    // category rank would have reversed.
    const rows = [
      vehicleRow("van-first", "van"),
      vehicleRow("sedan-second", "sedan"),
      vehicleRow("ultra-third", "ultra-luxury"),
      vehicleRow("suv-fourth", "suv"),
    ];
    mockVehicle.findMany.mockResolvedValue(rows);

    const result = await getAllVehicles("en");

    expect(result.map((v) => v.slug)).toEqual(["van-first", "sedan-second", "ultra-third", "suv-fourth"]);
  });

  it("asks the database for sortOrder ascending, with a stable tiebreaker", async () => {
    mockVehicle.findMany.mockResolvedValue([vehicleRow("only", "sedan")]);

    await getAllVehicles("en");

    expect(mockVehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] })
    );
  });

  it("keeps that order when a category page filters the same list", async () => {
    const rows = [
      vehicleRow("sedan-b", "sedan"),
      vehicleRow("van-between", "van"),
      vehicleRow("sedan-a", "sedan"),
    ];
    mockVehicle.findMany.mockResolvedValue(rows);

    const result = await getVehiclesByCategorySlug("sedan", "en");

    expect(result.map((v) => v.slug)).toEqual(["sedan-b", "sedan-a"]);
  });
});

/**
 * A page hero has no `data/*.ts` counterpart: the built-in image compiled
 * into ServicesHero/LocationsHero is the fallback, so every failure mode here
 * has to resolve to `undefined` rather than throw or hand back a half-built
 * object the component would render as a broken image.
 */
describe("page heroes degrade to the component's built-in image", () => {
  it("returns undefined when the page has no row", async () => {
    mockPageHero.findUnique.mockResolvedValue(null);
    expect(await getPageHero("services", "en")).toBeUndefined();
  });

  it("returns undefined when a row exists but neither image is set", async () => {
    mockPageHero.findUnique.mockResolvedValue({
      page: "services",
      desktopImage: null,
      mobileImage: null,
      imageAlt: null,
    });
    expect(await getPageHero("services", "en")).toBeUndefined();
  });

  it("returns undefined instead of throwing when the database is down", async () => {
    mockPageHero.findUnique.mockRejectedValue(DB_ERROR);
    expect(await getPageHero("services", "en")).toBeUndefined();
  });

  it("returns one breakpoint's image when only that one is set", async () => {
    mockPageHero.findUnique.mockResolvedValue({
      page: "locations",
      desktopImage: null,
      mobileImage: { url: "/uploads/locations-mobile.webp" },
      imageAlt: null,
    });

    const hero = await getPageHero("locations", "en");

    expect(hero?.mobileSrc).toBe("/uploads/locations-mobile.webp");
    expect(hero?.desktopSrc).toBeUndefined();
  });

  it("resolves alt text in the requested locale", async () => {
    mockPageHero.findUnique.mockResolvedValue({
      page: "services",
      desktopImage: { url: "/uploads/services-desktop.webp" },
      mobileImage: { url: "/uploads/services-mobile.webp" },
      imageAlt: { en: "Chauffeur opening a car door", ar: "سائق يفتح باب السيارة" },
    });

    expect((await getPageHero("services", "ar"))?.alt).toBe("سائق يفتح باب السيارة");
    expect((await getPageHero("services", "en"))?.alt).toBe("Chauffeur opening a car door");
  });
});

describe("service hero images", () => {
  /** Minimal row in the shape `mapService()` reads. */
  function serviceRow(overrides: Record<string, unknown> = {}) {
    const text = { en: "copy" };
    return {
      slug: "airport-transfers",
      name: text,
      tagline: text,
      heroSubtitle: text,
      shortDescription: text,
      longDescription: { en: ["copy"] },
      ratingMetric: { value: "1", label: text },
      benefits: { en: [] },
      whyChoose: { en: [] },
      tags: { en: [] },
      faqs: [],
      image: { url: "/uploads/card.webp" },
      imageUrl: null,
      imageAlt: { en: "Card image" },
      heroDesktopImage: null,
      heroMobileImage: null,
      seo: null,
      ...overrides,
    };
  }

  it("exposes both breakpoints when the admin has set them", async () => {
    mockService.findMany.mockResolvedValue([
      serviceRow({
        heroDesktopImage: { url: "/uploads/hero-desktop.webp", alt: { en: "Wide banner" } },
        heroMobileImage: { url: "/uploads/hero-mobile.webp", alt: null },
      }),
    ]);

    const [service] = await getAllServices("en");

    expect(service.heroDesktopImage).toEqual({ src: "/uploads/hero-desktop.webp", alt: "Wide banner" });
    // No alt of its own — it falls back to the card image's alt rather than
    // shipping an empty one.
    expect(service.heroMobileImage).toEqual({ src: "/uploads/hero-mobile.webp", alt: "Card image" });
  });

  it("leaves both undefined when the admin has set neither, so the page keeps using the card image", async () => {
    mockService.findMany.mockResolvedValue([serviceRow()]);

    const [service] = await getAllServices("en");

    expect(service.heroDesktopImage).toBeUndefined();
    expect(service.heroMobileImage).toBeUndefined();
    expect(service.image.src).toBe("/uploads/card.webp");
  });
});
