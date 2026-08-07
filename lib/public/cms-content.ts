import { prisma } from "@/lib/db";
import type { LocalizedText } from "@/lib/cms/localized";

/**
 * Read-only, unauthenticated query functions proving the Phase 7 CMS
 * content can be safely consumed by a public page — always filtered to
 * `status: "published"` and `deletedAt: null`, exactly the guarantee a
 * public route needs (draft/archived content must never leak — Phase 7
 * brief Part 13).
 *
 * **Not wired into any `app/[locale]/*` page.** Every content table these
 * read from (`services`, `locations`, `blog_posts`) is empty in production
 * today — the public site's real content still ships from `data/*.ts`.
 * Pointing a live page at these functions right now would render an empty
 * page instead of the working site. See CMS.md "Public Site Integration"
 * for the full reasoning and what a real cutover requires (content
 * migration first, then a page-by-page swap, tested per locale).
 */

export interface PublicServiceSummary {
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  imageUrl: string | null;
}

export async function getPublishedServices(): Promise<PublicServiceSummary[]> {
  const rows = await prisma.service.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: { image: { select: { url: true } } },
  });
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name as unknown as LocalizedText,
    tagline: r.tagline as unknown as LocalizedText,
    imageUrl: r.image?.url ?? r.imageUrl,
  }));
}

export interface PublicLocationSummary {
  slug: string;
  name: string;
  tagline: LocalizedText;
  heroDesktopImageUrl: string | null;
}

export async function getPublishedLocations(): Promise<PublicLocationSummary[]> {
  const rows = await prisma.location.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: { heroDesktopImage: { select: { url: true } } },
  });
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    tagline: r.tagline as unknown as LocalizedText,
    heroDesktopImageUrl: r.heroDesktopImage?.url ?? r.heroDesktopImageUrl,
  }));
}

export interface PublicBlogPostSummary {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  publishedAt: Date | null;
  featuredImageUrl: string | null;
}

export async function getPublishedBlogPosts(): Promise<PublicBlogPostSummary[]> {
  const rows = await prisma.blogPost.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { featuredImage: { select: { url: true } } },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title as unknown as LocalizedText,
    excerpt: r.excerpt as unknown as LocalizedText,
    publishedAt: r.publishedAt,
    featuredImageUrl: r.featuredImage?.url ?? null,
  }));
}
