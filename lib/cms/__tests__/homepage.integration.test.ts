import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import {
  listHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  setHeroSlideStatus,
  deleteHeroSlide,
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  type HeroSlideInput,
  type TestimonialInput,
  type BrandInput,
} from "@/lib/cms/homepage";
import { emptyLocalizedText } from "@/lib/cms/localized";

let users: Record<SystemRole, TestUser>;
const heroSlideIds: string[] = [];
const testimonialIds: string[] = [];
const brandIds: string[] = [];

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityId: { in: [...heroSlideIds, ...testimonialIds, ...brandIds] } } });
  await prisma.heroSlide.deleteMany({ where: { id: { in: heroSlideIds } } });
  await prisma.testimonial.deleteMany({ where: { id: { in: testimonialIds } } });
  await prisma.brand.deleteMany({ where: { id: { in: brandIds } } });
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

function heroSlideFixture(overrides?: Partial<HeroSlideInput>): HeroSlideInput {
  return {
    title: emptyLocalizedText("Vitest Slide"),
    subtitle: emptyLocalizedText("Subtitle"),
    desktopImageId: null,
    mobileImageId: null,
    ctas: [{ label: emptyLocalizedText("Book Now"), href: "/booking" }],
    status: "draft",
    sortOrder: 0,
    ...overrides,
  };
}

function testimonialFixture(overrides?: Partial<TestimonialInput>): TestimonialInput {
  return {
    name: "Vitest Reviewer",
    rating: 5,
    text: "Excellent service.",
    serviceUsed: "Airport Transfer",
    location: "Dubai",
    date: "March 2026",
    source: "direct",
    avatarInitials: "VR",
    profileUrl: null,
    isFeatured: false,
    sortOrder: 0,
    ...overrides,
  };
}

function brandFixture(overrides?: Partial<BrandInput>): BrandInput {
  return {
    name: `Vitest Brand ${Math.random().toString(36).slice(2, 10)}`,
    logoId: null,
    sortOrder: 0,
    ...overrides,
  };
}

async function makeHeroSlide(overrides?: Partial<HeroSlideInput>): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createHeroSlide(heroSlideFixture(overrides));
  if (!result.success) throw new Error(`Fixture hero slide creation failed: ${result.error}`);
  heroSlideIds.push(result.data.id);
  return result.data.id;
}

async function makeTestimonial(overrides?: Partial<TestimonialInput>): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createTestimonial(testimonialFixture(overrides));
  if (!result.success) throw new Error(`Fixture testimonial creation failed: ${result.error}`);
  testimonialIds.push(result.data.id);
  return result.data.id;
}

async function makeBrand(overrides?: Partial<BrandInput>): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createBrand(brandFixture(overrides));
  if (!result.success) throw new Error(`Fixture brand creation failed: ${result.error}`);
  brandIds.push(result.data.id);
  return result.data.id;
}

describe("Hero Slides — permission gating, CRUD, publish", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createHeroSlide(heroSlideFixture());
    expect(result.success).toBe(false);
  });

  it("booking_manager lacks homepage:create and is denied, with an audit entry", async () => {
    mockSessionFor(users.booking_manager);
    const before = await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } });
    const result = await createHeroSlide(heroSlideFixture());
    expect(result.success).toBe(false);
    expect(await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } })).toBe(before + 1);
  });

  it("rejects a missing English title", async () => {
    mockSessionFor(users.content_manager);
    const result = await createHeroSlide(heroSlideFixture({ title: emptyLocalizedText() }));
    expect(result.success).toBe(false);
  });

  it("creates, lists, updates, publishes, and deletes a slide, with CTAs preserved", async () => {
    const id = await makeHeroSlide();

    mockSessionFor(users.viewer);
    const listResult = await listHeroSlides();
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      const slide = listResult.data.find((s) => s.id === id);
      expect(slide).toBeDefined();
      expect(slide?.ctas).toHaveLength(1);
      expect(slide?.ctas[0]?.href).toBe("/booking");
    }

    mockSessionFor(users.content_manager);
    const updateResult = await updateHeroSlide(id, heroSlideFixture({ title: emptyLocalizedText("Updated Slide") }));
    expect(updateResult.success).toBe(true);

    const publishResult = await setHeroSlideStatus(id, "published");
    expect(publishResult.success).toBe(true);
    const row = await prisma.heroSlide.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("published");

    const deleteResult = await deleteHeroSlide(id);
    expect(deleteResult.success).toBe(true);
    heroSlideIds.splice(heroSlideIds.indexOf(id), 1);

    const afterDelete = await prisma.heroSlide.findUnique({ where: { id } });
    expect(afterDelete).toBeNull();
  });

  it("seo_manager lacks homepage:publish and is denied", async () => {
    const id = await makeHeroSlide();
    mockSessionFor(users.seo_manager);
    const result = await setHeroSlideStatus(id, "published");
    expect(result.success).toBe(false);
  });
});

describe("Testimonials — permission gating, CRUD, hard delete (no schema-level status field)", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createTestimonial(testimonialFixture());
    expect(result.success).toBe(false);
  });

  it("rejects a missing name/text", async () => {
    mockSessionFor(users.content_manager);
    const result = await createTestimonial(testimonialFixture({ name: "  " }));
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range rating", async () => {
    mockSessionFor(users.content_manager);
    const result = await createTestimonial(testimonialFixture({ rating: 6 }));
    expect(result.success).toBe(false);
  });

  it("creates, lists, updates, and hard-deletes a testimonial", async () => {
    const id = await makeTestimonial();

    mockSessionFor(users.viewer);
    const listResult = await listTestimonials();
    expect(listResult.success).toBe(true);
    if (listResult.success) expect(listResult.data.some((t) => t.id === id)).toBe(true);

    mockSessionFor(users.content_manager);
    const updateResult = await updateTestimonial(id, testimonialFixture({ isFeatured: true }));
    expect(updateResult.success).toBe(true);
    const row = await prisma.testimonial.findUniqueOrThrow({ where: { id } });
    expect(row.isFeatured).toBe(true);

    const deleteResult = await deleteTestimonial(id);
    expect(deleteResult.success).toBe(true);
    testimonialIds.splice(testimonialIds.indexOf(id), 1);

    const afterDelete = await prisma.testimonial.findUnique({ where: { id } });
    expect(afterDelete).toBeNull();
  });
});

describe("Brands — permission gating, unique name, CRUD, hard delete", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createBrand(brandFixture());
    expect(result.success).toBe(false);
  });

  it("rejects a duplicate name", async () => {
    const name = `Vitest Dup Brand ${Math.random().toString(36).slice(2, 8)}`;
    await makeBrand({ name });
    mockSessionFor(users.content_manager);
    const result = await createBrand(brandFixture({ name }));
    expect(result.success).toBe(false);
  });

  it("creates, lists, updates, and hard-deletes a brand", async () => {
    const id = await makeBrand();

    mockSessionFor(users.viewer);
    const listResult = await listBrands();
    expect(listResult.success).toBe(true);
    if (listResult.success) expect(listResult.data.some((b) => b.id === id)).toBe(true);

    mockSessionFor(users.content_manager);
    const updateResult = await updateBrand(id, brandFixture({ name: `Vitest Renamed ${Math.random().toString(36).slice(2, 8)}` }));
    expect(updateResult.success).toBe(true);

    const deleteResult = await deleteBrand(id);
    expect(deleteResult.success).toBe(true);
    brandIds.splice(brandIds.indexOf(id), 1);

    const afterDelete = await prisma.brand.findUnique({ where: { id } });
    expect(afterDelete).toBeNull();
  });
});
