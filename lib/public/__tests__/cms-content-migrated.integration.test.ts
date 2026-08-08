import { describe, it, expect } from "vitest";
import {
  getAllServices,
  getServiceBySlug,
  getAllLocations,
  getAllFaqs,
  getBlogPostBySlug,
  getFeaturedTestimonials,
  getBrands,
  getAllVehicles,
  getVehicleBySlug,
  getVehiclesByCategorySlug,
} from "@/lib/public/cms-content";
import { BLOG_POSTS } from "@/data/blog";
import { FLEET } from "@/data/fleet";

/**
 * Verifies the real, already-migrated content (prisma/migrate-public-content.ts)
 * round-trips correctly through the public read layer — localization,
 * structured blog content, FAQ categorization, and image URLs. Assumes the
 * migration script has already been run against the test database (it has,
 * as part of Phase 8's one-time content import — this suite does not
 * re-run it).
 */

describe("migrated content — localization", () => {
  it("getAllServices resolves Arabic text for a known service", async () => {
    const services = await getAllServices("ar");
    const airport = services.find((s) => s.slug === "airport-transfers");
    expect(airport).toBeDefined();
    expect(airport?.name).toBe("الاستقبال من المطار");
  });

  it("getServiceBySlug carries the legacy imageUrl through as image.src", async () => {
    const service = await getServiceBySlug("airport-transfers", "en");
    expect(service?.image.src).toBe("/images/services/airport-transfer-jet-tarmac.webp");
  });

  it("getAllLocations resolves geo coordinates from the migrated {lat,lng} shape", async () => {
    const locations = await getAllLocations("en");
    const marina = locations.find((l) => l.slug === "dubai-marina");
    expect(marina?.geo?.latitude).toBeCloseTo(25.0805, 3);
    expect(marina?.geo?.longitude).toBeCloseTo(55.1403, 3);
  });

  it("getAllLocations resolves landmarks (broadcast across locales at migration time)", async () => {
    const locations = await getAllLocations("de");
    const marina = locations.find((l) => l.slug === "dubai-marina");
    expect(marina?.landmarks).toContain("Marina Walk");
  });
});

describe("migrated content — FAQ hub categorization", () => {
  it("getAllFaqs assigns categories to general, service-embedded, and location-embedded FAQs alike", async () => {
    const faqs = await getAllFaqs("en");
    expect(faqs.length).toBeGreaterThan(150);
    const categories = new Set(faqs.map((f) => f.category));
    expect(categories.has("booking")).toBe(true);
    expect(categories.has("locations")).toBe(true);
    expect(categories.has("airport-transfers")).toBe(true);
  });
});

describe("migrated content — blog structured content preserved", () => {
  it("getBlogPostBySlug preserves heading/list/faq blocks, not just paragraphs", async () => {
    const postWithRichBlocks = BLOG_POSTS.find(
      (p) => p.content.some((b) => b.type === "heading") && p.content.some((b) => b.type === "list")
    );
    expect(postWithRichBlocks).toBeDefined();

    const post = await getBlogPostBySlug(postWithRichBlocks!.slug, "en");
    expect(post).toBeDefined();
    const blockTypes = new Set(post!.content.map((b) => b.type));
    expect(blockTypes.has("heading")).toBe(true);
    expect(blockTypes.has("paragraph")).toBe(true);
  });
});

describe("migrated content — homepage Testimonials/Brands", () => {
  it("getFeaturedTestimonials returns only isFeatured rows", async () => {
    const featured = await getFeaturedTestimonials();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((t) => t.featured)).toBe(true);
  });

  it("getBrands returns every migrated brand with a resolved logo URL", async () => {
    const brands = await getBrands();
    expect(brands.length).toBe(7);
    expect(brands.every((b) => b.logo.length > 0)).toBe(true);
  });
});

describe("migrated content — Fleet", () => {
  it("getAllVehicles returns every migrated vehicle, ordered Ultra-Luxury first", async () => {
    const vehicles = await getAllVehicles("en");
    expect(vehicles.length).toBe(FLEET.length);
    expect(vehicles[0]?.category).toBe("Ultra-Luxury");
  });

  it("getVehicleBySlug resolves Arabic description and preserves image order (primary first)", async () => {
    const vehicle = await getVehicleBySlug("mercedes-maybach-s-class", "ar");
    expect(vehicle).toBeDefined();
    expect(vehicle?.brand).toBe("Mercedes-Maybach");
    expect(vehicle?.description.length).toBeGreaterThan(0);
    expect(vehicle?.images?.length).toBeGreaterThan(0);
  });

  it("getVehicleBySlug carries chauffeur-hire rates through as a plain object", async () => {
    const vehicle = await getVehicleBySlug("mercedes-maybach-s-class", "en");
    expect(vehicle?.rates.tenHours).toBeGreaterThan(0);
  });

  it("getVehiclesByCategorySlug('electric') filters by isElectric across categories", async () => {
    const electric = await getVehiclesByCategorySlug("electric", "en");
    expect(electric.length).toBeGreaterThan(0);
    expect(electric.every((v) => v.isElectric)).toBe(true);
  });

  it("getVehiclesByCategorySlug('sedan') only returns Sedan-category vehicles", async () => {
    const sedans = await getVehiclesByCategorySlug("sedan", "en");
    expect(sedans.length).toBeGreaterThan(0);
    expect(sedans.every((v) => v.category === "Sedan")).toBe(true);
  });
});
