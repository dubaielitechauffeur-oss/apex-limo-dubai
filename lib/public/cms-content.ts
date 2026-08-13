import { prisma } from "@/lib/db";
import { routing, type Locale } from "@/i18n/routing";
import type { LocalizedText } from "@/lib/cms/localized";
import {
  getAllServices as staticGetAllServices,
  getServiceBySlug as staticGetServiceBySlug,
  type PlainService,
} from "@/data/services";
import {
  getAllLocations as staticGetAllLocations,
  getLocationBySlug as staticGetLocationBySlug,
  type PlainLocation,
} from "@/data/locations";
import {
  getAllBlogPosts as staticGetAllBlogPosts,
  getBlogPostBySlug as staticGetBlogPostBySlug,
  type PlainBlogPost,
  type PlainBlogContentBlock,
} from "@/data/blog";
import { getAllFaqs as staticGetAllFaqs, type PlainFaqHubEntry } from "@/data/faqHub";
import { TESTIMONIALS, type Testimonial } from "@/data/testimonials";
import { BRANDS, type Brand } from "@/data/brands";
import {
  getAllVehicles as staticGetAllVehicles,
  getVehicleBySlug as staticGetVehicleBySlug,
  getVehiclesByCategorySlug as staticGetVehiclesByCategorySlug,
  type PlainFleetVehicle,
  type FleetCategory,
  type FleetCategorySlug,
} from "@/data/fleet";

/**
 * The central public read layer for CMS-backed content (Phase 8).
 *
 * Every export here is a drop-in replacement for the matching `data/*.ts`
 * function — same name, same arguments, same return shape — so page
 * components need only swap the import and add `await`. Internally, each
 * function tries the database first and falls back to the original static
 * data file whenever:
 *   - the database/query throws (connection down, Prisma error, etc.), or
 *   - the relevant table has zero rows (nothing migrated/created yet), or
 *   - (for single-item lookups) the slug isn't found in the database.
 * This satisfies Phase 8's fallback requirement without ever leaving a
 * route blank: static data is never deleted and always remains the safety
 * net. See PUBLIC_CMS_INTEGRATION.md for the full fallback matrix.
 *
 * Per-field locale fallback: any individual locale missing from a JSON
 * field falls back to English (`value[locale] || value.en`), matching the
 * exact idiom already used by every `data/*.ts` file's own `pick()`.
 *
 * Caching/revalidation: queries here run directly against Prisma (no
 * `unstable_cache` wrapper — it requires the Next.js server's incremental
 * cache store and throws outside of it, including in this file's own
 * Vitest suite, which would make the database-backed code path untestable
 * and add a real failure mode for no benefit here). Freshness instead
 * comes from two standard, independently-testable layers: pages set
 * `export const revalidate = 300` for time-based ISR, and CMS admin
 * actions call `revalidatePath()` on the affected public routes after a
 * successful mutation for near-immediate visibility. See
 * PUBLIC_CMS_INTEGRATION.md "Caching & Revalidation".
 */

function pickText(value: unknown, locale: Locale): string {
  const record = (value ?? {}) as Partial<Record<Locale, string>>;
  return record[locale] || record[routing.defaultLocale] || "";
}

function pickArray(value: unknown, locale: Locale): string[] {
  const record = (value ?? {}) as Partial<Record<Locale, string[]>>;
  return record[locale] ?? record[routing.defaultLocale] ?? [];
}

/**
 * DB-first with static fallback. Order: try the database; if the query
 * throws (connection down, unreachable, Prisma error) or the result is
 * empty (no rows migrated yet), serve the static `data/*.ts` file so the
 * public route never renders blank. The static files are the permanent
 * safety net and are never removed.
 *
 * When a table has rows the admin panel manages, the DB wins — this is
 * what makes admin publish visible on the public site. Pair with each
 * page's `export const revalidate = 300` (ISR) and the CMS actions'
 * `revalidatePath()` calls for near-immediate visibility.
 */
async function withFallback<T>(run: () => Promise<T>, isEmpty: (value: T) => boolean, fallback: () => T): Promise<T> {
  try {
    const result = await run();
    if (isEmpty(result)) return fallback();
    return result;
  } catch (err) {
    console.error("[cms-content] DB read failed, using static fallback:", err);
    return fallback();
  }
}

// ── Services ─────────────────────────────────────────────────────────────

function mapService(
  row: Awaited<ReturnType<typeof fetchAllServiceRows>>[number],
  locale: Locale
): PlainService {
  const ratingMetric = (row.ratingMetric ?? {}) as { value?: string; label?: unknown };
  return {
    slug: row.slug,
    name: pickText(row.name, locale),
    tagline: pickText(row.tagline, locale),
    heroSubtitle: pickText(row.heroSubtitle, locale),
    shortDescription: pickText(row.shortDescription, locale),
    longDescription: pickArray(row.longDescription, locale),
    ratingMetric: { value: ratingMetric.value ?? "", label: pickText(ratingMetric.label, locale) },
    benefits: pickArray(row.benefits, locale),
    whyChoose: pickArray(row.whyChoose, locale),
    faqs: row.faqs.map((faq) => ({ question: pickText(faq.question, locale), answer: pickText(faq.answer, locale) })),
    image: { src: row.image?.url ?? row.imageUrl ?? "", alt: pickText(row.imageAlt, locale) },
    tags: pickArray(row.tags, locale),
  };
}

function fetchAllServiceRows() {
  return prisma.service.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: { image: { select: { url: true } }, faqs: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAllServices(locale: Locale): Promise<PlainService[]> {
  return withFallback(
    async () => (await fetchAllServiceRows()).map((row) => mapService(row, locale)),
    (result) => result.length === 0,
    () => staticGetAllServices(locale)
  );
}

export async function getServiceBySlug(slug: string, locale: Locale): Promise<PlainService | undefined> {
  return withFallback(
    async () => {
      const rows = await fetchAllServiceRows();
      const row = rows.find((r) => r.slug === slug);
      return row ? mapService(row, locale) : undefined;
    },
    (result) => result === undefined,
    () => staticGetServiceBySlug(slug, locale)
  );
}

// ── Locations ────────────────────────────────────────────────────────────

function mapLocation(
  row: Awaited<ReturnType<typeof fetchAllLocationRows>>[number],
  locale: Locale
): PlainLocation {
  const geo = row.geo as { lat?: number; lng?: number } | null;
  const heroDesktopSrc = row.heroDesktopImage?.url ?? row.heroDesktopImageUrl;
  const heroMobileSrc = row.heroMobileImage?.url ?? row.heroMobileImageUrl;

  return {
    slug: row.slug,
    name: row.name,
    tagline: pickText(row.tagline, locale),
    heroSubtitle: pickText(row.heroSubtitle, locale),
    shortDescription: pickText(row.shortDescription, locale),
    longDescription: pickArray(row.longDescription, locale),
    isAirport: row.isAirport,
    popularRoutes: row.popularRoutes.map((route) => ({
      from: pickText(route.from, locale),
      to: pickText(route.to, locale),
      duration: pickText(route.duration, locale),
    })),
    whyChoose: pickArray(row.whyChoose, locale),
    faqs: row.faqs.map((faq) => ({ question: pickText(faq.question, locale), answer: pickText(faq.answer, locale) })),
    landmarks: pickArray(row.landmarks, locale),
    image: { src: row.imageUrl ?? "", alt: pickText(row.imageAlt, locale) },
    heroDesktopImage: heroDesktopSrc ? { src: heroDesktopSrc, alt: pickText(row.imageAlt, locale) } : undefined,
    heroMobileImage: heroMobileSrc ? { src: heroMobileSrc, alt: pickText(row.imageAlt, locale) } : undefined,
    heroObjectPosition: row.heroObjectPosition ?? undefined,
    tags: pickArray(row.tags, locale),
    geo: geo?.lat !== undefined && geo?.lng !== undefined ? { latitude: geo.lat, longitude: geo.lng } : undefined,
  };
}

function fetchAllLocationRows() {
  return prisma.location.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      heroDesktopImage: { select: { url: true } },
      heroMobileImage: { select: { url: true } },
      popularRoutes: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getAllLocations(locale: Locale): Promise<PlainLocation[]> {
  return withFallback(
    async () => (await fetchAllLocationRows()).map((row) => mapLocation(row, locale)),
    (result) => result.length === 0,
    () => staticGetAllLocations(locale)
  );
}

export async function getLocationBySlug(slug: string, locale: Locale): Promise<PlainLocation | undefined> {
  return withFallback(
    async () => {
      const rows = await fetchAllLocationRows();
      const row = rows.find((r) => r.slug === slug);
      return row ? mapLocation(row, locale) : undefined;
    },
    (result) => result === undefined,
    () => staticGetLocationBySlug(slug, locale)
  );
}

// ── FAQ hub ──────────────────────────────────────────────────────────────
// Note: image row here has no MediaItem lookup, since a MediaItem row was
// never guaranteed for every legacy `image.src` value beyond what
// migration created — src falls back to the raw imageUrl column, which the
// migration always populates for Service/Location.

function fetchAllFaqRows() {
  return prisma.faq.findMany({
    orderBy: [{ sortOrder: "asc" }],
    include: { category: { select: { key: true } } },
  });
}

export async function getAllFaqs(locale: Locale): Promise<PlainFaqHubEntry[]> {
  return withFallback(
    async () => {
      const rows = await fetchAllFaqRows();
      return rows.map((row) => ({
        id: row.id,
        category: row.category?.key ?? "general-questions",
        question: pickText(row.question, locale),
        answer: pickText(row.answer, locale),
      }));
    },
    (result) => result.length === 0,
    () => staticGetAllFaqs(locale)
  );
}

// ── Blog ─────────────────────────────────────────────────────────────────

function pickBlock(block: unknown, locale: Locale): PlainBlogContentBlock | null {
  if (!block || typeof block !== "object" || !("type" in block)) return null;
  const b = block as { type: string; level?: 2 | 3; text?: unknown; items?: unknown };
  if (b.type === "heading") return { type: "heading", level: b.level ?? 2, text: pickText(b.text, locale) };
  if (b.type === "paragraph") return { type: "paragraph", text: pickText(b.text, locale) };
  if (b.type === "list") return { type: "list", items: pickArray(b.items, locale) };
  if (b.type === "faq" && Array.isArray(b.items)) {
    return {
      type: "faq",
      items: b.items.map((item: { question: unknown; answer: unknown }) => ({
        question: pickText(item.question, locale),
        answer: pickText(item.answer, locale),
      })),
    };
  }
  return null;
}

function mapBlogPost(row: Awaited<ReturnType<typeof fetchAllBlogRows>>[number], locale: Locale): PlainBlogPost {
  const seo = (row.seo ?? {}) as { title?: unknown; description?: unknown };
  const author = (row.author ?? {}) as { name?: string; title?: unknown; email?: string };
  const content = Array.isArray(row.content)
    ? (row.content as unknown[]).map((block) => pickBlock(block, locale)).filter((b): b is PlainBlogContentBlock => b !== null)
    : [];

  return {
    slug: row.slug,
    title: pickText(row.title, locale),
    excerpt: pickText(row.excerpt, locale),
    seoTitle: pickText(seo.title, locale) || pickText(row.title, locale),
    seoDescription: pickText(seo.description, locale) || pickText(row.excerpt, locale),
    publishDate: (row.publishedAt ?? row.createdAt).toISOString(),
    author: { name: author.name ?? "", title: pickText(author.title, locale), email: author.email },
    featuredImage: { src: row.featuredImage?.url ?? "", alt: pickText(row.featuredImage?.alt, locale) },
    content,
  };
}

function fetchAllBlogRows() {
  return prisma.blogPost.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: [{ publishedAt: "desc" }],
    include: { featuredImage: { select: { url: true, alt: true } } },
  });
}

export async function getAllBlogPosts(locale: Locale): Promise<PlainBlogPost[]> {
  return withFallback(
    async () => (await fetchAllBlogRows()).map((row) => mapBlogPost(row, locale)),
    (result) => result.length === 0,
    () => staticGetAllBlogPosts(locale)
  );
}

export async function getBlogPostBySlug(slug: string, locale: Locale): Promise<PlainBlogPost | undefined> {
  return withFallback(
    async () => {
      const rows = await fetchAllBlogRows();
      const row = rows.find((r) => r.slug === slug);
      return row ? mapBlogPost(row, locale) : undefined;
    },
    (result) => result === undefined,
    () => staticGetBlogPostBySlug(slug, locale)
  );
}

export async function getRelatedBlogPosts(currentSlug: string, locale: Locale, limit = 3): Promise<PlainBlogPost[]> {
  const posts = await getAllBlogPosts(locale);
  return posts.filter((post) => post.slug !== currentSlug).slice(0, limit);
}

// ── Homepage: Testimonials, Brands, Hero Slides ────────────────────────

function fetchFeaturedTestimonialRows() {
  return prisma.testimonial.findMany({ where: { isFeatured: true }, orderBy: { sortOrder: "asc" } });
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  return withFallback(
    async () => {
      const totalCount = await prisma.testimonial.count();
      if (totalCount === 0) return [];
      const rows = await fetchFeaturedTestimonialRows();
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        rating: row.rating,
        text: row.text,
        serviceUsed: row.serviceUsed,
        location: row.location,
        date: row.date,
        source: row.source === "google" ? "google" : "direct",
        avatarInitials: row.avatarInitials,
        profileUrl: row.profileUrl ?? undefined,
        featured: row.isFeatured,
      }));
    },
    (result) => result.length === 0,
    () => TESTIMONIALS.filter((t) => t.featured)
  );
}

function fetchBrandRows() {
  return prisma.brand.findMany({ orderBy: { sortOrder: "asc" }, include: { logo: { select: { url: true } } } });
}

export async function getBrands(): Promise<Brand[]> {
  return withFallback(
    async () => {
      const rows = await fetchBrandRows();
      return rows.map((row) => ({ name: row.name, logo: row.logo?.url ?? row.logoUrl ?? "" }));
    },
    (result) => result.length === 0,
    () => BRANDS
  );
}

export interface PublicHeroSlide {
  title: string;
  subtitle: string;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  ctas: { label: string; href: string }[];
}

function fetchHeroSlideRows() {
  return prisma.heroSlide.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
    include: { desktopImage: { select: { url: true } }, mobileImage: { select: { url: true } } },
  });
}

/**
 * No static fallback source exists — the homepage currently has a single
 * hardcoded hero (not a slideshow), so an empty array here is itself the
 * correct "use the existing static Hero" signal to `components/home/Hero.tsx`.
 * See PUBLIC_CMS_INTEGRATION.md "Homepage Hero" for the full reasoning.
 */
export async function getHeroSlides(_locale: Locale): Promise<PublicHeroSlide[]> {
  // Empty means "use the static hero" — the same result this returned
  // whenever no slides were configured. The database is not in the public
  // read path (see the note on `withFallback` above); restoring
  // admin-managed hero slides means calling `fetchHeroSlideRows()` again.
  return [];
}

// ── Fleet ────────────────────────────────────────────────────────────────
// Vehicle.category is a real FK (VehicleCategory), while the static
// PlainFleetVehicle's `category` field is the closed `FleetCategory`
// display-string union ("Sedan"/"SUV"/"Van"/"Ultra-Luxury"). The four
// VehicleCategory rows are seeded with exactly these matching slugs
// (prisma/seed.ts), so this map is safe for the real data; a category an
// admin adds beyond these four falls back to its own English name so
// nothing throws, though it won't participate in the same-ordering rank
// below — a known, documented limitation (see FLEET_CMS.md).
const CATEGORY_SLUG_TO_DISPLAY: Record<string, FleetCategory> = {
  sedan: "Sedan",
  suv: "SUV",
  van: "Van",
  "ultra-luxury": "Ultra-Luxury",
};

const CATEGORY_DISPLAY_RANK: Record<FleetCategory, number> = {
  "Ultra-Luxury": 0,
  Sedan: 1,
  SUV: 2,
  Van: 3,
};

function mapVehicle(row: Awaited<ReturnType<typeof fetchAllVehicleRows>>[number], locale: Locale): PlainFleetVehicle {
  const badge = row.badge as LocalizedText | null;
  const category = CATEGORY_SLUG_TO_DISPLAY[row.category.slug] ?? ((row.category.name as LocalizedText | null)?.en as FleetCategory);

  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    model: row.model,
    rates: row.rates as unknown as PlainFleetVehicle["rates"],
    category,
    isElectric: row.isElectric,
    tagline: pickText(row.tagline, locale),
    description: pickText(row.description, locale),
    longDescription: pickText(row.longDescription, locale),
    passengers: row.passengers,
    luggage: row.luggage,
    idealFor: pickText(row.idealFor, locale),
    features: pickArray(row.features, locale),
    whyChoose: pickArray(row.whyChoose, locale),
    faqs: row.faqs.map((faq) => ({ question: pickText(faq.question, locale), answer: pickText(faq.answer, locale) })),
    images: row.images.length > 0 ? row.images.map((img) => ({ src: img.media.url, alt: pickText(img.media.alt, locale) })) : undefined,
    badge: badge ? pickText(badge, locale) || undefined : undefined,
    isPlaceholder: row.isPlaceholder,
  };
}

function fetchAllVehicleRows() {
  return prisma.vehicle.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      category: { select: { slug: true, name: true } },
      images: { orderBy: { sortOrder: "asc" }, include: { media: { select: { url: true, alt: true } } } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/** Same category-rank ordering `getAllVehicles()` in data/fleet.ts applies
 *  (Ultra-Luxury first, down to Van), so the CMS-backed listing visually
 *  matches the static one exactly. */
function sortByCategoryRank(vehicles: PlainFleetVehicle[]): PlainFleetVehicle[] {
  return [...vehicles].sort((a, b) => (CATEGORY_DISPLAY_RANK[a.category] ?? 99) - (CATEGORY_DISPLAY_RANK[b.category] ?? 99));
}

export async function getAllVehicles(locale: Locale): Promise<PlainFleetVehicle[]> {
  return withFallback(
    async () => sortByCategoryRank((await fetchAllVehicleRows()).map((row) => mapVehicle(row, locale))),
    (result) => result.length === 0,
    () => staticGetAllVehicles(locale)
  );
}

export async function getVehicleBySlug(slug: string, locale: Locale): Promise<PlainFleetVehicle | undefined> {
  return withFallback(
    async () => {
      const rows = await fetchAllVehicleRows();
      const row = rows.find((r) => r.slug === slug);
      return row ? mapVehicle(row, locale) : undefined;
    },
    (result) => result === undefined,
    () => staticGetVehicleBySlug(slug, locale)
  );
}

export async function getVehiclesByCategorySlug(categorySlug: FleetCategorySlug, locale: Locale): Promise<PlainFleetVehicle[]> {
  const all = await getAllVehicles(locale);
  if (categorySlug === "electric") return all.filter((v) => v.isElectric);
  const display = CATEGORY_SLUG_TO_DISPLAY[categorySlug];
  return all.filter((v) => v.category === display);
}

// ── Sitemap helpers ──────────────────────────────────────────────────────

export interface SitemapEntry {
  slug: string;
  lastModified?: Date;
}

export async function getServiceSitemapEntries(): Promise<SitemapEntry[]> {
  return withFallback(
    async () => {
      const rows = await prisma.service.findMany({
        where: { status: "published", deletedAt: null },
        select: { slug: true, updatedAt: true },
      });
      return rows.map((r) => ({ slug: r.slug, lastModified: r.updatedAt }));
    },
    (result) => result.length === 0,
    () => staticGetAllServices(routing.defaultLocale).map((s) => ({ slug: s.slug }))
  );
}

export async function getLocationSitemapEntries(): Promise<SitemapEntry[]> {
  return withFallback(
    async () => {
      const rows = await prisma.location.findMany({
        where: { status: "published", deletedAt: null },
        select: { slug: true, updatedAt: true },
      });
      return rows.map((r) => ({ slug: r.slug, lastModified: r.updatedAt }));
    },
    (result) => result.length === 0,
    () => staticGetAllLocations(routing.defaultLocale).map((l) => ({ slug: l.slug }))
  );
}

export async function getBlogPostSitemapEntries(): Promise<SitemapEntry[]> {
  return withFallback(
    async () => {
      const rows = await prisma.blogPost.findMany({
        where: { status: "published", deletedAt: null },
        select: { slug: true, publishedAt: true, updatedAt: true },
      });
      return rows.map((r) => ({ slug: r.slug, lastModified: r.publishedAt ?? r.updatedAt }));
    },
    (result) => result.length === 0,
    () =>
      staticGetAllBlogPosts(routing.defaultLocale).map((p) => ({ slug: p.slug, lastModified: new Date(p.publishDate) }))
  );
}

export async function getVehicleSitemapEntries(): Promise<SitemapEntry[]> {
  return withFallback(
    async () => {
      const rows = await prisma.vehicle.findMany({
        where: { status: "published", deletedAt: null },
        select: { slug: true, updatedAt: true },
      });
      return rows.map((r) => ({ slug: r.slug, lastModified: r.updatedAt }));
    },
    (result) => result.length === 0,
    () => staticGetAllVehicles(routing.defaultLocale).map((v) => ({ slug: v.slug }))
  );
}
