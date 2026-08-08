import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";
import { routing, type Locale } from "../i18n/routing";
import { SERVICES, type Service } from "../data/services";
import { LOCATIONS, type Location } from "../data/locations";
import { BLOG_POSTS, type BlogPost } from "../data/blog";
import { FAQS } from "../data/faqs";
import { NEW_FAQS, FAQ_CATEGORIES } from "../data/faqHub";
import { TESTIMONIALS } from "../data/testimonials";
import { BRANDS } from "../data/brands";

/**
 * Phase 8: one-time, idempotent, non-destructive import of the site's
 * existing static content (data/*.ts) into the Phase 7 CMS tables.
 *
 * Idempotency: every entity is looked up by its natural key before writing;
 * if a row already exists this script SKIPS it rather than overwriting it,
 * so re-running never creates duplicates and never clobbers an
 * administrator's edits made after the first run. Run again any time it's
 * safe to pick up new static entries that haven't been imported yet.
 *
 * Run with: npx tsx prisma/migrate-public-content.ts
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Localized<T = string> = Record<Locale, T>;

function broadcast(value: string): Localized {
  const out = {} as Localized;
  for (const locale of routing.locales) out[locale] = value;
  return out;
}

function broadcastArray(value: string[]): Localized<string[]> {
  const out = {} as Localized<string[]>;
  for (const locale of routing.locales) out[locale] = value;
  return out;
}

function emptySeo(title: Localized, description: Localized): Prisma.InputJsonValue {
  return {
    title,
    description,
    ogImageId: null,
    canonical: null,
    noIndex: false,
    noFollow: false,
  };
}

let created = 0;
let skipped = 0;
let categoryIdByKey = new Map<string, string>();

const SERVICE_CATEGORY_MAP: Record<string, string> = {
  "airport-transfers": "airport-transfers",
  "corporate-chauffeur": "corporate-travel",
  "luxury-chauffeur": "fleet",
  "vip-transportation": "vip-transportation",
  "event-transportation": "corporate-travel",
  "wedding-chauffeur": "wedding-chauffeurs",
};

function log(entity: string, key: string, action: "created" | "skipped") {
  if (action === "created") created++;
  else skipped++;
  console.log(`  ${action === "created" ? "+" : "="} [${entity}] ${key} (${action})`);
}

// ── Services ─────────────────────────────────────────────────────────────

async function migrateServices() {
  console.log("\nMigrating services...");
  for (const [index, service] of SERVICES.entries()) {
    let row = await prisma.service.findUnique({ where: { slug: service.slug } });
    if (row) {
      log("service", service.slug, "skipped");
    } else {
      row = await prisma.service.create({
        data: {
          slug: service.slug,
          name: service.name as unknown as Prisma.InputJsonValue,
          tagline: service.tagline as unknown as Prisma.InputJsonValue,
          shortDescription: service.shortDescription as unknown as Prisma.InputJsonValue,
          longDescription: service.longDescription as unknown as Prisma.InputJsonValue,
          benefits: service.benefits as unknown as Prisma.InputJsonValue,
          whyChoose: service.whyChoose as unknown as Prisma.InputJsonValue,
          tags: service.tags as unknown as Prisma.InputJsonValue,
          ratingMetric: {
            value: service.ratingMetric.value,
            label: service.ratingMetric.label,
          } as unknown as Prisma.InputJsonValue,
          imageUrl: service.image.src,
          imageAlt: service.image.alt as unknown as Prisma.InputJsonValue,
          seo: emptySeo(service.name, service.shortDescription),
          status: "published",
          publishedAt: new Date(),
          sortOrder: index,
        },
      });
      log("service", service.slug, "created");
    }

    // Runs whether the service row is new or pre-existing, so a second run
    // still backfills any embedded FAQs that weren't imported yet.
    await migrateEmbeddedFaqs(
      service.faqs,
      { serviceId: row.id },
      SERVICE_CATEGORY_MAP[service.slug] ?? "general-questions",
      `service:${service.slug}`
    );
  }
}

// ── Locations ────────────────────────────────────────────────────────────

async function migrateLocations() {
  console.log("\nMigrating locations...");
  for (const [index, location] of LOCATIONS.entries()) {
    let row = await prisma.location.findUnique({ where: { slug: location.slug } });
    if (row) {
      log("location", location.slug, "skipped");
    } else {
      row = await prisma.location.create({
        data: {
          slug: location.slug,
          name: location.name,
          tagline: location.tagline as unknown as Prisma.InputJsonValue,
          shortDescription: location.shortDescription as unknown as Prisma.InputJsonValue,
          longDescription: location.longDescription as unknown as Prisma.InputJsonValue,
          isAirport: location.isAirport,
          landmarks: broadcastArray(location.landmarks) as unknown as Prisma.InputJsonValue,
          whyChoose: location.whyChoose as unknown as Prisma.InputJsonValue,
          tags: location.tags as unknown as Prisma.InputJsonValue,
          geo: location.geo ? { lat: location.geo.latitude, lng: location.geo.longitude } : undefined,
          imageUrl: location.image.src,
          imageAlt: location.image.alt as unknown as Prisma.InputJsonValue,
          heroDesktopImageUrl: location.heroDesktopImage?.src ?? null,
          heroMobileImageUrl: location.heroMobileImage?.src ?? null,
          heroObjectPosition: location.heroObjectPosition ?? null,
          seo: emptySeo(broadcast(location.name), location.shortDescription),
          status: "published",
          publishedAt: new Date(),
          sortOrder: index,
        },
      });
      log("location", location.slug, "created");
    }

    // Runs whether the location row is new or pre-existing, so a second run
    // still backfills any routes/FAQs that weren't imported yet.
    for (const [routeIndex, route] of location.popularRoutes.entries()) {
      const existingRoute = await prisma.locationPopularRoute.findFirst({
        where: {
          locationId: row.id,
          from: { equals: broadcast(route.from) as unknown as Prisma.InputJsonValue },
          to: { equals: broadcast(route.to) as unknown as Prisma.InputJsonValue },
        },
      });
      if (existingRoute) continue;
      await prisma.locationPopularRoute.create({
        data: {
          locationId: row.id,
          from: broadcast(route.from) as unknown as Prisma.InputJsonValue,
          to: broadcast(route.to) as unknown as Prisma.InputJsonValue,
          duration: route.duration as unknown as Prisma.InputJsonValue,
          sortOrder: routeIndex,
        },
      });
    }

    await migrateEmbeddedFaqs(location.faqs, { locationId: row.id }, "locations", `location:${location.slug}`);
  }
}

// ── FAQs (categories already seeded by prisma/seed.ts) ──────────────────

async function migrateEmbeddedFaqs(
  faqs: { question: Localized; answer: Localized }[],
  parent: { serviceId?: string; locationId?: string },
  categoryKey: string,
  ownerLabel: string
) {
  const categoryId = categoryIdByKey.get(categoryKey) ?? null;
  for (const [index, faq] of faqs.entries()) {
    const existing = await prisma.faq.findFirst({
      where: {
        ...parent,
        question: { equals: faq.question as unknown as Prisma.InputJsonValue },
      },
    });
    if (existing) continue;
    await prisma.faq.create({
      data: {
        ...parent,
        categoryId,
        question: faq.question as unknown as Prisma.InputJsonValue,
        answer: faq.answer as unknown as Prisma.InputJsonValue,
        sortOrder: index,
      },
    });
  }
  if (faqs.length > 0) console.log(`    + ${faqs.length} embedded FAQ(s) for ${ownerLabel}`);
}

const HOME_CATEGORY_ORDER = ["booking", "airport-transfers", "fleet", "booking", "safety", "general-questions"];

async function migrateGeneralFaqs() {
  console.log("\nMigrating FAQ hub entries (general/home)...");

  if (categoryIdByKey.size === 0) {
    console.warn("  ! No FaqCategory rows found — run `npm run db:seed` first. Skipping categorized FAQ import.");
    return;
  }

  for (const faq of NEW_FAQS) {
    const existing = await prisma.faq.findFirst({
      where: { question: { equals: faq.question as unknown as Prisma.InputJsonValue } },
    });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.faq.create({
      data: {
        categoryId: categoryIdByKey.get(faq.category) ?? null,
        question: faq.question as unknown as Prisma.InputJsonValue,
        answer: faq.answer as unknown as Prisma.InputJsonValue,
        sortOrder: 0,
      },
    });
    created++;
  }
  console.log(`  + ${NEW_FAQS.length} FAQ hub entries processed`);

  for (const [index, faq] of FAQS.entries()) {
    const existing = await prisma.faq.findFirst({
      where: { question: { equals: faq.question as unknown as Prisma.InputJsonValue } },
    });
    if (existing) {
      skipped++;
      continue;
    }
    const categoryKey = HOME_CATEGORY_ORDER[index] ?? "general-questions";
    await prisma.faq.create({
      data: {
        categoryId: categoryIdByKey.get(categoryKey) ?? null,
        question: faq.question as unknown as Prisma.InputJsonValue,
        answer: faq.answer as unknown as Prisma.InputJsonValue,
        sortOrder: 0,
      },
    });
    created++;
  }
  console.log(`  + ${FAQS.length} homepage FAQ entries processed`);
}

// ── Blog (needs real MediaItem rows for featuredImageId — no legacy URL
//    column exists on BlogPost, unlike Service/Location) ─────────────────

const PUBLIC_DIR = join(__dirname, "..", "public");
const mediaItemIdByUrl = new Map<string, string>();

async function getOrCreateMediaItem(publicSrc: string, alt: Localized): Promise<string | null> {
  if (mediaItemIdByUrl.has(publicSrc)) return mediaItemIdByUrl.get(publicSrc)!;

  const existing = await prisma.mediaItem.findFirst({ where: { url: publicSrc } });
  if (existing) {
    mediaItemIdByUrl.set(publicSrc, existing.id);
    return existing.id;
  }

  const absolutePath = join(PUBLIC_DIR, publicSrc);
  let sizeBytes = 0;
  let width: number | null = null;
  let height: number | null = null;
  try {
    const stat = statSync(absolutePath);
    sizeBytes = stat.size;
    const buffer = readFileSync(absolutePath);
    const dims = imageSize(buffer);
    width = dims.width ?? null;
    height = dims.height ?? null;
  } catch {
    console.warn(`  ! Could not read ${publicSrc} from public/ — creating MediaItem record anyway (URL-only reference).`);
  }

  const filename = publicSrc.split("/").pop() ?? publicSrc;
  const mimeType = filename.endsWith(".webp")
    ? "image/webp"
    : filename.endsWith(".png")
      ? "image/png"
      : filename.endsWith(".jpeg") || filename.endsWith(".jpg")
        ? "image/jpeg"
        : "application/octet-stream";

  const created = await prisma.mediaItem.create({
    data: {
      filename,
      originalFilename: filename,
      mimeType,
      sizeBytes,
      width,
      height,
      alt: alt as unknown as Prisma.InputJsonValue,
      type: "image",
      variant: "original",
      storageProvider: "local",
      storagePath: publicSrc,
      url: publicSrc,
    },
  });
  mediaItemIdByUrl.set(publicSrc, created.id);
  return created.id;
}

async function migrateBlog() {
  console.log("\nMigrating blog posts...");
  for (const [index, post] of BLOG_POSTS.entries()) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing) {
      log("blog_post", post.slug, "skipped");
      continue;
    }

    const featuredImageId = await getOrCreateMediaItem(post.featuredImage.src, post.featuredImage.alt);

    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title as unknown as Prisma.InputJsonValue,
        excerpt: post.excerpt as unknown as Prisma.InputJsonValue,
        // Full structured content (heading/paragraph/list/faq blocks) is
        // stored as-is — the admin's simpler editor only *writes*
        // paragraph blocks, but the column itself supports the richer
        // shape data/blog.ts already uses, so migrating loses nothing.
        content: post.content as unknown as Prisma.InputJsonValue,
        author: {
          name: post.author.name,
          title: post.author.title,
          ...(post.author.email ? { email: post.author.email } : {}),
        } as unknown as Prisma.InputJsonValue,
        featuredImageId,
        seo: emptySeo(post.seoTitle, post.seoDescription),
        readingTimeMinutes: 5,
        status: "published",
        publishedAt: new Date(post.publishDate),
        sortOrder: index,
      },
    });
    log("blog_post", post.slug, "created");
  }
}

// ── Testimonials (no unique key — dedupe by name+date+text) ──────────────

async function migrateTestimonials() {
  console.log("\nMigrating testimonials...");
  for (const [index, testimonial] of TESTIMONIALS.entries()) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: testimonial.name, date: testimonial.date, text: testimonial.text },
    });
    if (existing) {
      log("testimonial", testimonial.id, "skipped");
      continue;
    }
    await prisma.testimonial.create({
      data: {
        name: testimonial.name,
        rating: testimonial.rating,
        text: testimonial.text,
        serviceUsed: testimonial.serviceUsed,
        location: testimonial.location,
        date: testimonial.date,
        source: testimonial.source,
        avatarInitials: testimonial.avatarInitials,
        profileUrl: testimonial.profileUrl ?? null,
        isFeatured: testimonial.featured ?? false,
        sortOrder: index,
      },
    });
    log("testimonial", testimonial.id, "created");
  }
}

// ── Brands (unique name, legacy logoUrl column — no MediaItem needed) ────

async function migrateBrands() {
  console.log("\nMigrating brands...");
  for (const [index, brand] of BRANDS.entries()) {
    const existing = await prisma.brand.findUnique({ where: { name: brand.name } });
    if (existing) {
      log("brand", brand.name, "skipped");
      continue;
    }
    await prisma.brand.create({
      data: { name: brand.name, logoUrl: brand.logo, sortOrder: index },
    });
    log("brand", brand.name, "created");
  }
}

async function main() {
  console.log("Migrating public static content into the CMS...\n");
  console.log("(Idempotent — rows that already exist by their natural key are skipped, never overwritten.)");

  const categories = await prisma.faqCategory.findMany();
  categoryIdByKey = new Map(categories.map((c) => [c.key, c.id]));
  if (categoryIdByKey.size === 0) {
    console.warn("\n! No FaqCategory rows found — run `npm run db:seed` first. FAQs will be imported without a category.");
  }

  await migrateServices();
  await migrateLocations();
  await migrateGeneralFaqs();
  await migrateBlog();
  await migrateTestimonials();
  await migrateBrands();

  console.log(`\nDone. ${created} row(s) created, ${skipped} row(s) already present and left untouched.`);
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
