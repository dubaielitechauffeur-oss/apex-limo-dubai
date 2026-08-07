import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { getPublishedServices, getPublishedLocations, getPublishedBlogPosts } from "@/lib/public/cms-content";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";

const serviceIds: string[] = [];
const locationIds: string[] = [];
const blogPostIds: string[] = [];

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
});

afterAll(async () => {
  await prisma.service.deleteMany({ where: { id: { in: serviceIds } } });
  await prisma.location.deleteMany({ where: { id: { in: locationIds } } });
  await prisma.blogPost.deleteMany({ where: { id: { in: blogPostIds } } });
});

describe("Public CMS readiness — draft/archived/soft-deleted content never leaks", () => {
  it("getPublishedServices only returns published, non-deleted services", async () => {
    const results = await getPublishedServices();
    const slugs = results.map((r) => r.slug);
    expect(slugs.some((s) => s.startsWith("vitest-pub-svc-published-"))).toBe(true);
    expect(slugs.some((s) => s.startsWith("vitest-pub-svc-draft-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-svc-archived-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-svc-deleted-"))).toBe(false);
  });

  it("getPublishedLocations only returns published, non-deleted locations", async () => {
    const results = await getPublishedLocations();
    const slugs = results.map((r) => r.slug);
    expect(slugs.some((s) => s.startsWith("vitest-pub-loc-published-"))).toBe(true);
    expect(slugs.some((s) => s.startsWith("vitest-pub-loc-draft-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-loc-archived-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-loc-deleted-"))).toBe(false);
  });

  it("getPublishedBlogPosts only returns published, non-deleted posts", async () => {
    const results = await getPublishedBlogPosts();
    const slugs = results.map((r) => r.slug);
    expect(slugs.some((s) => s.startsWith("vitest-pub-post-published-"))).toBe(true);
    expect(slugs.some((s) => s.startsWith("vitest-pub-post-draft-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-post-archived-"))).toBe(false);
    expect(slugs.some((s) => s.startsWith("vitest-pub-post-deleted-"))).toBe(false);
  });
});
