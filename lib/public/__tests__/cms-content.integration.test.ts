import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import {
  getAllServices,
  getServiceBySlug,
  getAllLocations,
  getLocationBySlug,
  getAllBlogPosts,
  getBlogPostBySlug,
  getAllVehicles,
  getVehicleBySlug,
  getServiceSitemapEntries,
  getLocationSitemapEntries,
  getBlogPostSitemapEntries,
  getVehicleSitemapEntries,
} from "@/lib/public/cms-content";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";

const serviceIds: string[] = [];
const locationIds: string[] = [];
const blogPostIds: string[] = [];
const vehicleIds: string[] = [];
let vehicleCategoryId: string;

async function makeService(slug: string, status: "draft" | "published" | "archived", deletedAt: Date | null = null) {
  const row = await prisma.service.create({
    data: {
      slug,
      name: emptyLocalizedText(`Service ${slug}`),
      tagline: emptyLocalizedText(),
      shortDescription: emptyLocalizedText(),
      longDescription: emptyLocalizedText(),
      benefits: emptyLocalizedText(),
      whyChoose: emptyLocalizedText(),
      tags: emptyLocalizedText(),
      seo: emptySeoMeta() as unknown as object,
      status,
      deletedAt,
    },
  });
  serviceIds.push(row.id);
  return row.id;
}

async function makeLocation(slug: string, status: "draft" | "published" | "archived", deletedAt: Date | null = null) {
  const row = await prisma.location.create({
    data: {
      slug,
      name: `Location ${slug}`,
      tagline: emptyLocalizedText(),
      shortDescription: emptyLocalizedText(),
      longDescription: emptyLocalizedText(),
      landmarks: emptyLocalizedText(),
      whyChoose: emptyLocalizedText(),
      tags: emptyLocalizedText(),
      seo: emptySeoMeta() as unknown as object,
      status,
      deletedAt,
    },
  });
  locationIds.push(row.id);
  return row.id;
}

async function makeBlogPost(slug: string, status: "draft" | "published" | "archived", deletedAt: Date | null = null) {
  const row = await prisma.blogPost.create({
    data: {
      slug,
      title: emptyLocalizedText(`Post ${slug}`) as unknown as object,
      excerpt: emptyLocalizedText() as unknown as object,
      content: [] as unknown as object,
      author: { name: "Vitest" } as unknown as object,
      seo: emptySeoMeta() as unknown as object,
      status,
      deletedAt,
    },
  });
  blogPostIds.push(row.id);
  return row.id;
}

async function makeVehicle(slug: string, status: "draft" | "published" | "archived", deletedAt: Date | null = null) {
  const row = await prisma.vehicle.create({
    data: {
      slug,
      name: `Vehicle ${slug}`,
      brand: "Vitest Motors",
      model: "Vitest Model",
      categoryId: vehicleCategoryId,
      passengers: 4,
      luggage: 2,
      tagline: emptyLocalizedText(),
      description: emptyLocalizedText("Description"),
      longDescription: emptyLocalizedText(),
      idealFor: emptyLocalizedText(),
      features: emptyLocalizedText(),
      whyChoose: emptyLocalizedText(),
      rates: { tenHours: 0, fiveHours: 0, oneHour: 0, airport: 0, extraHour: 0, additionalCity: 0 },
      seo: emptySeoMeta() as unknown as object,
      status,
      deletedAt,
    },
  });
  vehicleIds.push(row.id);
  return row.id;
}

beforeAll(async () => {
  const suffix = Math.random().toString(36).slice(2, 10);

  await makeService(`vitest-pub-svc-published-${suffix}`, "published");
  await makeService(`vitest-pub-svc-draft-${suffix}`, "draft");
  await makeService(`vitest-pub-svc-archived-${suffix}`, "archived");
  await makeService(`vitest-pub-svc-deleted-${suffix}`, "published", new Date());

  await makeLocation(`vitest-pub-loc-published-${suffix}`, "published");
  await makeLocation(`vitest-pub-loc-draft-${suffix}`, "draft");
  await makeLocation(`vitest-pub-loc-archived-${suffix}`, "archived");
  await makeLocation(`vitest-pub-loc-deleted-${suffix}`, "published", new Date());

  await makeBlogPost(`vitest-pub-post-published-${suffix}`, "published");
  await makeBlogPost(`vitest-pub-post-draft-${suffix}`, "draft");
  await makeBlogPost(`vitest-pub-post-archived-${suffix}`, "archived");
  await makeBlogPost(`vitest-pub-post-deleted-${suffix}`, "published", new Date());

  const category = await prisma.vehicleCategory.create({
    data: { slug: `vitest-pub-cat-${suffix}`, name: emptyLocalizedText("Vitest Public Category"), sortOrder: 999 },
  });
  vehicleCategoryId = category.id;
  await makeVehicle(`vitest-pub-veh-published-${suffix}`, "published");
  await makeVehicle(`vitest-pub-veh-draft-${suffix}`, "draft");
  await makeVehicle(`vitest-pub-veh-archived-${suffix}`, "archived");
  await makeVehicle(`vitest-pub-veh-deleted-${suffix}`, "published", new Date());
});

afterAll(async () => {
  await prisma.service.deleteMany({ where: { id: { in: serviceIds } } });
  await prisma.location.deleteMany({ where: { id: { in: locationIds } } });
  await prisma.blogPost.deleteMany({ where: { id: { in: blogPostIds } } });
  await prisma.vehicle.deleteMany({ where: { id: { in: vehicleIds } } });
  if (vehicleCategoryId) await prisma.vehicleCategory.delete({ where: { id: vehicleCategoryId } }).catch(() => null);
});

describe("Public CMS read layer — draft/archived/soft-deleted content never leaks", () => {
  it("getAllServices only returns published, non-deleted services", async () => {
    const results = await getAllServices("en");
    const slugs = results.map((r) => r.slug);
    expect(slugs.some((s) => s.startsWith("vitest-pub-svc-published-"))).toBe(true);
    expect(slugs.some((s) => s.startsWith("vitest-pub-svc-draft-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-svc-archived-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-svc-deleted-"))).toBe(false);
  });

  it("getServiceBySlug 404s a draft service by direct slug access", async () => {
    const allDb = await prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { slug: true, status: true } });
    const draft = allDb.find((s) => s.status === "draft");
    expect(draft).toBeDefined();
    const result = await getServiceBySlug(draft!.slug, "en");
    expect(result).toBeUndefined();
  });

  it("getAllLocations only returns published, non-deleted locations", async () => {
    const results = await getAllLocations("en");
    const slugs = results.map((r) => r.slug);
    expect(slugs.some((s) => s.startsWith("vitest-pub-loc-published-"))).toBe(true);
    expect(slugs.some((s) => s.startsWith("vitest-pub-loc-draft-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-loc-archived-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-loc-deleted-"))).toBe(false);
  });

  it("getLocationBySlug 404s an archived location by direct slug access", async () => {
    const allDb = await prisma.location.findMany({ where: { id: { in: locationIds } }, select: { slug: true, status: true } });
    const archived = allDb.find((l) => l.status === "archived");
    expect(archived).toBeDefined();
    const result = await getLocationBySlug(archived!.slug, "en");
    expect(result).toBeUndefined();
  });

  it("getAllBlogPosts only returns published, non-deleted posts", async () => {
    const results = await getAllBlogPosts("en");
    const slugs = results.map((r) => r.slug);
    expect(slugs.some((s) => s.startsWith("vitest-pub-post-published-"))).toBe(true);
    expect(slugs.some((s) => s.startsWith("vitest-pub-post-draft-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-post-archived-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-post-deleted-"))).toBe(false);
  });

  it("getBlogPostBySlug 404s a soft-deleted post by direct slug access", async () => {
    const allDb = await prisma.blogPost.findMany({ where: { id: { in: blogPostIds } }, select: { slug: true, deletedAt: true } });
    const deleted = allDb.find((p) => p.deletedAt !== null);
    expect(deleted).toBeDefined();
    const result = await getBlogPostBySlug(deleted!.slug, "en");
    expect(result).toBeUndefined();
  });

  it("getAllVehicles only returns published, non-deleted vehicles", async () => {
    const results = await getAllVehicles("en");
    const slugs = results.map((r) => r.slug);
    expect(slugs.some((s) => s.startsWith("vitest-pub-veh-published-"))).toBe(true);
    expect(slugs.some((s) => s.startsWith("vitest-pub-veh-draft-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-veh-archived-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-veh-deleted-"))).toBe(false);
  });

  it("getVehicleBySlug 404s a draft vehicle by direct slug access", async () => {
    const allDb = await prisma.vehicle.findMany({ where: { id: { in: vehicleIds } }, select: { slug: true, status: true } });
    const draft = allDb.find((v) => v.status === "draft");
    expect(draft).toBeDefined();
    const result = await getVehicleBySlug(draft!.slug, "en");
    expect(result).toBeUndefined();
  });
});

describe("Sitemap entries — draft/archived/soft-deleted never generate a URL", () => {
  it("getServiceSitemapEntries excludes draft, archived, and soft-deleted services", async () => {
    const entries = await getServiceSitemapEntries();
    const slugs = entries.map((e) => e.slug);
    const dbRows = await prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { slug: true } });
    const testSlugs = dbRows.map((r) => r.slug);
    const publishedTestSlugs = testSlugs.filter((s) => s.includes("-published-"));
    expect(publishedTestSlugs.length).toBeGreaterThan(0);
    for (const slug of publishedTestSlugs) expect(slugs).toContain(slug);
    for (const slug of testSlugs.filter((s) => !s.includes("-published-"))) expect(slugs).not.toContain(slug);
  });

  it("getLocationSitemapEntries excludes draft, archived, and soft-deleted locations", async () => {
    const entries = await getLocationSitemapEntries();
    const slugs = entries.map((e) => e.slug);
    const dbRows = await prisma.location.findMany({ where: { id: { in: locationIds } }, select: { slug: true } });
    const testSlugs = dbRows.map((r) => r.slug);
    for (const slug of testSlugs.filter((s) => s.includes("-published-"))) expect(slugs).toContain(slug);
    for (const slug of testSlugs.filter((s) => !s.includes("-published-"))) expect(slugs).not.toContain(slug);
  });

  it("getBlogPostSitemapEntries excludes draft, archived, and soft-deleted posts", async () => {
    const entries = await getBlogPostSitemapEntries();
    const slugs = entries.map((e) => e.slug);
    const dbRows = await prisma.blogPost.findMany({ where: { id: { in: blogPostIds } }, select: { slug: true } });
    const testSlugs = dbRows.map((r) => r.slug);
    for (const slug of testSlugs.filter((s) => s.includes("-published-"))) expect(slugs).toContain(slug);
    for (const slug of testSlugs.filter((s) => !s.includes("-published-"))) expect(slugs).not.toContain(slug);
  });

  it("getVehicleSitemapEntries excludes draft, archived, and soft-deleted vehicles", async () => {
    const entries = await getVehicleSitemapEntries();
    const slugs = entries.map((e) => e.slug);
    const dbRows = await prisma.vehicle.findMany({ where: { id: { in: vehicleIds } }, select: { slug: true } });
    const testSlugs = dbRows.map((r) => r.slug);
    for (const slug of testSlugs.filter((s) => s.includes("-published-"))) expect(slugs).toContain(slug);
    for (const slug of testSlugs.filter((s) => !s.includes("-published-"))) expect(slugs).not.toContain(slug);
  });
});
