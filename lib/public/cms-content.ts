import { prisma } from "@/lib/db";
import { routing, type Locale } from "@/i18n/routing";
import type { LocalizedText } from "@/lib/cms/localized";
import { resolvePublicSeo, collectOgImageIds, type PublicSeo } from "./seo-fields";
import { availableLocalesFor } from "./translation-coverage";
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
  type PlainPopularForChip,
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
 * One batched lookup turning every `seo.ogImageId` referenced by `rows` into a
 * usable URL. Called once per fetch rather than per row: a per-row
 * `mediaItem.findUnique` would add an N+1 to the fleet, services and locations
 * listing pages, which render every published row at once.
 *
 * Soft-deleted media is excluded, so an image an admin removed from the Media
 * Library degrades to "no OG override" (the page falls back to the site
 * default) instead of emitting a dead URL into Open Graph tags.
 *
 * Never throws: an OG image is a nice-to-have, and a media-table failure must
 * not take down the page it decorates.
 */
async function resolveOgImageUrls(rows: ReadonlyArray<{ seo?: unknown }>): Promise<Map<string, string>> {
  const ids = collectOgImageIds(rows);
  if (ids.length === 0) return new Map();
  try {
    const media = await prisma.mediaItem.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, url: true },
    });
    return new Map(media.map((m) => [m.id, m.url]));
  } catch (err) {
    console.error("[cms-content] OG image lookup failed, omitting overrides:", err);
    return new Map();
  }
}

/** True when the CMS row is marked noindex — used to keep it out of the sitemap. */
function isSeoNoIndex(value: unknown): boolean {
  return !!value && typeof value === "object" && (value as { noIndex?: unknown }).noIndex === true;
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
  locale: Locale,
  ogImageUrlById?: ReadonlyMap<string, string>
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
    seo: resolvePublicSeo(row.seo, locale, ogImageUrlById) ?? undefined,
    // A service reads as translated only when its name, summary and body copy
    // are all present — a translated name over English body text is exactly
    // the half-localized page this gate exists to keep out of hreflang.
    availableLocales: availableLocalesFor([row.name, row.shortDescription, row.longDescription]),
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
    async () => {
      const rows = await fetchAllServiceRows();
      const ogImages = await resolveOgImageUrls(rows);
      return rows.map((row) => mapService(row, locale, ogImages));
    },
    (result) => result.length === 0,
    () => staticGetAllServices(locale)
  );
}

export async function getServiceBySlug(slug: string, locale: Locale): Promise<PlainService | undefined> {
  return withFallback(
    async () => {
      // Targeted lookup on the unique `slug` index. This previously fetched
      // every published service (with its image + FAQ joins) and then found
      // one row in JS, which made a single service page's cost scale with the
      // whole catalogue for no reason.
      const row = await prisma.service.findUnique({
        where: { slug },
        include: { image: { select: { url: true } }, faqs: { orderBy: { sortOrder: "asc" } } },
      });
      if (!row || row.status !== "published" || row.deletedAt !== null) return undefined;
      const ogImages = await resolveOgImageUrls([row]);
      return mapService(row, locale, ogImages);
    },
    (result) => result === undefined,
    () => staticGetServiceBySlug(slug, locale)
  );
}

// ── Locations ────────────────────────────────────────────────────────────

function mapLocation(
  row: Awaited<ReturnType<typeof fetchAllLocationRows>>[number],
  locale: Locale,
  ogImageUrlById?: ReadonlyMap<string, string>
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
    seo: resolvePublicSeo(row.seo, locale, ogImageUrlById) ?? undefined,
    // `name` is a proper noun kept in Latin script across all locales by
    // design, so it is deliberately not part of the coverage check.
    availableLocales: availableLocalesFor([row.tagline, row.shortDescription, row.longDescription]),
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
    async () => {
      const rows = await fetchAllLocationRows();
      const ogImages = await resolveOgImageUrls(rows);
      return rows.map((row) => mapLocation(row, locale, ogImages));
    },
    (result) => result.length === 0,
    () => staticGetAllLocations(locale)
  );
}

export async function getLocationBySlug(slug: string, locale: Locale): Promise<PlainLocation | undefined> {
  return withFallback(
    async () => {
      // Targeted lookup on the unique `slug` index — see getServiceBySlug.
      const row = await prisma.location.findUnique({
        where: { slug },
        include: {
          heroDesktopImage: { select: { url: true } },
          heroMobileImage: { select: { url: true } },
          popularRoutes: { orderBy: { sortOrder: "asc" } },
          faqs: { orderBy: { sortOrder: "asc" } },
        },
      });
      if (!row || row.status !== "published" || row.deletedAt !== null) return undefined;
      const ogImages = await resolveOgImageUrls([row]);
      return mapLocation(row, locale, ogImages);
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

/**
 * The short FAQ list the homepage renders (and emits FAQPage schema from).
 *
 * Previously the homepage read `data/faqs.ts` — a separate hand-written set of
 * six questions — while `/faqs` read the CMS hub. Two FAQ sources meant an
 * admin could edit an answer in the CMS and leave the homepage stating the
 * opposite, with both pages publishing conflicting FAQPage structured data for
 * the same business.
 *
 * Now both read the same rows. "Booking" is preferred as the homepage slice
 * because it is the category a first-time visitor is most likely to be asking
 * from, with the rest of the hub as backfill so the section is never short.
 * The static file remains the fallback for a fresh install or a DB outage,
 * exactly like every other reader here.
 */
export async function getHomepageFaqs(locale: Locale, limit = 6): Promise<{ question: string; answer: string }[]> {
  const all = await getAllFaqs(locale);
  if (all.length === 0) return [];

  const preferred = all.filter((faq) => faq.category === "booking");
  const rest = all.filter((faq) => faq.category !== "booking");
  return [...preferred, ...rest]
    .slice(0, limit)
    .map((faq) => ({ question: faq.question, answer: faq.answer }));
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

function mapBlogPost(
  row: Awaited<ReturnType<typeof fetchAllBlogRows>>[number],
  locale: Locale,
  ogImageUrlById?: ReadonlyMap<string, string>
): PlainBlogPost {
  const seo = (row.seo ?? {}) as { title?: unknown; description?: unknown };
  const publicSeo = resolvePublicSeo(row.seo, locale, ogImageUrlById);
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
    // Blog already consumed seo.title/description above; carrying the full
    // object through means canonical, OG image and noIndex/noFollow now work
    // for posts on the same footing as every other content type.
    seo: publicSeo ?? undefined,
    updatedAt: row.updatedAt.toISOString(),
    availableLocales: availableLocalesFor([row.title, row.excerpt]),
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
    async () => {
      const rows = await fetchAllBlogRows();
      const ogImages = await resolveOgImageUrls(rows);
      return rows.map((row) => mapBlogPost(row, locale, ogImages));
    },
    (result) => result.length === 0,
    () => staticGetAllBlogPosts(locale)
  );
}

export async function getBlogPostBySlug(slug: string, locale: Locale): Promise<PlainBlogPost | undefined> {
  return withFallback(
    async () => {
      // Targeted lookup on the unique `slug` index — see getServiceBySlug.
      const row = await prisma.blogPost.findUnique({
        where: { slug },
        include: { featuredImage: { select: { url: true, alt: true } } },
      });
      if (!row || row.status !== "published" || row.deletedAt !== null) return undefined;
      const ogImages = await resolveOgImageUrls([row]);
      return mapBlogPost(row, locale, ogImages);
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
  /** The Media Library's own alt text for the hero image. Falls back to "" so
   *  the Hero can use its translated static alt instead — reusing the
   *  headline as alt text (the previous behaviour) just repeats the H1 to a
   *  screen reader and describes nothing about the photograph. */
  imageAlt: string;
  ctas: { label: string; href: string }[];
}

function fetchHeroSlideRows() {
  return prisma.heroSlide.findMany({
    where: { status: "published" },
    orderBy: { sortOrder: "asc" },
    include: {
      desktopImage: { select: { url: true, alt: true } },
      mobileImage: { select: { url: true } },
    },
  });
}

/**
 * Published hero slides, lowest `sortOrder` first.
 *
 * This previously returned a hardcoded `[]` — `fetchHeroSlideRows()` was
 * defined and never called — which meant the entire Hero Slides module
 * (Prisma model, CRUD, admin UI, server actions, tests) wrote content that no
 * visitor could ever see. An admin could upload art, write CTAs, hit Publish,
 * watch it appear as "published" in the panel, and the homepage would keep
 * rendering the hardcoded static hero with no error and no warning.
 *
 * An empty array is still the correct "use the static hero" signal to
 * `components/home/Hero.tsx` — it just now means "no slides are published"
 * rather than "this feature is switched off". The static hero therefore
 * remains the permanent fallback for a fresh install or a database outage,
 * matching every other reader in this file.
 */
export async function getHeroSlides(locale: Locale): Promise<PublicHeroSlide[]> {
  return withFallback(
    async () => {
      const rows = await fetchHeroSlideRows();
      return rows.map((row) => ({
        title: pickText(row.title, locale),
        subtitle: pickText(row.subtitle, locale),
        desktopImageUrl: row.desktopImage?.url ?? null,
        mobileImageUrl: row.mobileImage?.url ?? null,
        imageAlt: pickText(row.desktopImage?.alt, locale),
        ctas: Array.isArray(row.ctas)
          ? (row.ctas as unknown[])
              .map((cta) => {
                const c = (cta ?? {}) as { label?: unknown; href?: unknown };
                return {
                  // `HeroCta.label` is a LocalizedText object written by the
                  // admin form (see readCtas in the homepage actions), not a
                  // plain string — so it goes through the same locale pick as
                  // every other translated field, with the English fallback.
                  label: pickText(c.label, locale),
                  href: typeof c.href === "string" ? c.href.trim() : "",
                };
              })
              // A CTA with no destination is a dead button, and one with no
              // label is an empty one — drop both rather than render them.
              .filter((cta) => cta.label && cta.href)
          : [],
      }));
    },
    // Never treat "no slides" as an error worth logging; it is the normal
    // state for a site that has not configured any.
    () => false,
    () => []
  );
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
/**
 * The four `VehicleCategory` rows seeded in prisma/seed.ts, mapped to the
 * closed `FleetCategory` display union.
 *
 * Note there are FIVE fleet category PAGES — `electric` is the fifth, but it
 * is not a category row: it is the `Vehicle.isElectric` boolean, so a car can
 * be both a Sedan and electric. `getVehiclesByCategorySlug` handles that case
 * explicitly rather than pretending it is a category here, which is why this
 * map has four entries and FLEET_CATEGORY_SLUGS has five.
 */
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

function mapVehicle(
  row: Awaited<ReturnType<typeof fetchAllVehicleRows>>[number],
  locale: Locale,
  ogImageUrlById?: ReadonlyMap<string, string>
): PlainFleetVehicle {
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
    images: row.images.length > 0
      ? row.images.map((img) => ({
          src: img.media.url,
          alt: pickText(img.media.alt, locale),
          mobileSrc: img.mobileMedia?.url,
        }))
      : undefined,
    badge: badge ? pickText(badge, locale) || undefined : undefined,
    isPlaceholder: row.isPlaceholder,
    amenities: Array.isArray(row.amenities) ? (row.amenities as string[]) : undefined,
    popularFor: buildPopularForChips(row, locale),
    seo: resolvePublicSeo(row.seo, locale, ogImageUrlById) ?? undefined,
    // Vehicle `name`/`brand`/`model` are proper nouns and stay Latin script.
    availableLocales: availableLocalesFor([row.description, row.longDescription, row.idealFor]),
  };
}

/** Resolve serviceId/locationId FKs into label + slug for public rendering.
 *  Fetched in `fetchAllVehicleRows` via a lightweight include. */
function buildPopularForChips(
  row: Awaited<ReturnType<typeof fetchAllVehicleRows>>[number],
  locale: Locale
): PlainPopularForChip[] | undefined {
  if (!Array.isArray(row.popularFor)) return undefined;
  const services = (row as unknown as { _popularForServices?: { id: string; slug: string; name: unknown }[] })._popularForServices ?? [];
  const locations = (row as unknown as { _popularForLocations?: { id: string; slug: string; name: string }[] })._popularForLocations ?? [];
  const svcById = new Map(services.map((s) => [s.id, s]));
  const locById = new Map(locations.map((l) => [l.id, l]));
  const pairs = row.popularFor as { serviceId: string | null; locationId: string | null }[];
  const chips: PlainPopularForChip[] = [];
  for (const pair of pairs) {
    const svc = pair.serviceId ? svcById.get(pair.serviceId) : undefined;
    const loc = pair.locationId ? locById.get(pair.locationId) : undefined;
    // Drop rows whose FKs both resolve to nothing (deleted/renamed).
    if (!svc && !loc) continue;
    chips.push({
      serviceLabel: svc ? pickText(svc.name, locale) : undefined,
      serviceSlug: svc?.slug,
      locationLabel: loc?.name,
      locationSlug: loc?.slug,
    });
  }
  return chips.length > 0 ? chips : undefined;
}

/**
 * Shared vehicle query. `extraWhere` narrows it to a single row for the detail
 * page without duplicating the include tree (gallery + mobile variants + FAQs
 * + category) or the popularFor FK resolution below, both of which the detail
 * page needs just as much as the listing does.
 */
async function fetchVehicleRowsWhere(extraWhere: { slug?: string } = {}) {
  const rows = await prisma.vehicle.findMany({
    where: { status: "published", deletedAt: null, ...extraWhere },
    orderBy: { sortOrder: "asc" },
    include: {
      category: { select: { slug: true, name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        include: {
          media: { select: { url: true, alt: true } },
          mobileMedia: { select: { url: true } },
        },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });

  // Resolve popularFor's service+location FKs (stored inside JSON, so
  // Prisma cannot join them declaratively). Batch-fetch once across all
  // rows and attach as private _popularForServices/_popularForLocations
  // fields for `buildPopularForChips()` above.
  const serviceIds = new Set<string>();
  const locationIds = new Set<string>();
  for (const row of rows) {
    if (Array.isArray(row.popularFor)) {
      for (const p of row.popularFor as { serviceId?: string | null; locationId?: string | null }[]) {
        if (p?.serviceId) serviceIds.add(p.serviceId);
        if (p?.locationId) locationIds.add(p.locationId);
      }
    }
  }
  const [services, locations] = await Promise.all([
    serviceIds.size > 0
      ? prisma.service.findMany({
          where: { id: { in: [...serviceIds] }, status: "published", deletedAt: null },
          select: { id: true, slug: true, name: true },
        })
      : Promise.resolve([]),
    locationIds.size > 0
      ? prisma.location.findMany({
          where: { id: { in: [...locationIds] }, status: "published", deletedAt: null },
          select: { id: true, slug: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  return rows.map((row) => {
    const attached = row as typeof row & {
      _popularForServices?: typeof services;
      _popularForLocations?: typeof locations;
    };
    attached._popularForServices = services;
    attached._popularForLocations = locations;
    return attached;
  });
}

/** Every published vehicle — the listing/carousel path. */
function fetchAllVehicleRows() {
  return fetchVehicleRowsWhere();
}

/** Same category-rank ordering `getAllVehicles()` in data/fleet.ts applies
 *  (Ultra-Luxury first, down to Van), so the CMS-backed listing visually
 *  matches the static one exactly. */
function sortByCategoryRank(vehicles: PlainFleetVehicle[]): PlainFleetVehicle[] {
  return [...vehicles].sort((a, b) => (CATEGORY_DISPLAY_RANK[a.category] ?? 99) - (CATEGORY_DISPLAY_RANK[b.category] ?? 99));
}

export async function getAllVehicles(locale: Locale): Promise<PlainFleetVehicle[]> {
  return withFallback(
    async () => {
      const rows = await fetchAllVehicleRows();
      const ogImages = await resolveOgImageUrls(rows);
      return sortByCategoryRank(rows.map((row) => mapVehicle(row, locale, ogImages)));
    },
    (result) => result.length === 0,
    () => staticGetAllVehicles(locale)
  );
}

export async function getVehicleBySlug(slug: string, locale: Locale): Promise<PlainFleetVehicle | undefined> {
  return withFallback(
    async () => {
      // Targeted lookup on the unique `slug` index. `fetchAllVehicleRows()`
      // pulls every published vehicle with its gallery, mobile variants, FAQs
      // and category joins plus two follow-up queries — an unreasonable cost
      // for rendering one vehicle page, and it grew with every vehicle added.
      const rows = await fetchVehicleRowsWhere({ slug });
      const row = rows[0];
      if (!row) return undefined;
      const ogImages = await resolveOgImageUrls(rows);
      return mapVehicle(row, locale, ogImages);
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
  /** Locales with real translated copy. Undefined = all six. */
  availableLocales?: Locale[];
}

/**
 * A sitemap must only advertise URLs the site actually wants indexed. Before
 * this, `seo.noIndex` was written by the admin SEO Manager and read by nobody:
 * a row an editor had explicitly marked "no index" still appeared here, and
 * still rendered without a robots meta tag. Both halves of that are fixed —
 * the metadata side in each route's `generateMetadata`, and the discovery side
 * here.
 */
function excludeNoIndex<T extends { seo: unknown }>(rows: T[]): T[] {
  return rows.filter((row) => !isSeoNoIndex(row.seo));
}

export async function getServiceSitemapEntries(): Promise<SitemapEntry[]> {
  return withFallback(
    async () => {
      const rows = await prisma.service.findMany({
        where: { status: "published", deletedAt: null },
        select: { slug: true, updatedAt: true, seo: true, name: true, shortDescription: true, longDescription: true },
      });
      return excludeNoIndex(rows).map((r) => ({
        slug: r.slug,
        lastModified: r.updatedAt,
        availableLocales: availableLocalesFor([r.name, r.shortDescription, r.longDescription]),
      }));
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
        select: { slug: true, updatedAt: true, seo: true, tagline: true, shortDescription: true, longDescription: true },
      });
      return excludeNoIndex(rows).map((r) => ({
        slug: r.slug,
        lastModified: r.updatedAt,
        availableLocales: availableLocalesFor([r.tagline, r.shortDescription, r.longDescription]),
      }));
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
        select: { slug: true, publishedAt: true, updatedAt: true, seo: true, title: true, excerpt: true },
      });
      return excludeNoIndex(rows).map((r) => ({
        slug: r.slug,
        lastModified: r.updatedAt ?? r.publishedAt,
        availableLocales: availableLocalesFor([r.title, r.excerpt]),
      }));
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
        select: { slug: true, updatedAt: true, seo: true, description: true, longDescription: true, idealFor: true },
      });
      return excludeNoIndex(rows).map((r) => ({
        slug: r.slug,
        lastModified: r.updatedAt,
        availableLocales: availableLocalesFor([r.description, r.longDescription, r.idealFor]),
      }));
    },
    (result) => result.length === 0,
    () => staticGetAllVehicles(routing.defaultLocale).map((v) => ({ slug: v.slug }))
  );
}
