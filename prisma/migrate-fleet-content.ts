import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";
import { routing, type Locale } from "../i18n/routing";
import { FLEET, type FleetCategory } from "../data/fleet";

/**
 * Phase 9: one-time, idempotent, non-destructive import of the site's
 * existing static Fleet content (data/fleet.ts) into the Vehicle/
 * VehicleCategory/VehicleImage/Faq tables. Same idempotency contract as
 * prisma/migrate-public-content.ts (Phase 8): every row is looked up by
 * its natural key before writing; existing rows are left untouched.
 *
 * Run with: npx tsx prisma/migrate-fleet-content.ts
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

function emptySeo(title: Localized, description: Localized): Prisma.InputJsonValue {
  return { title, description, ogImageId: null, canonical: null, noIndex: false, noFollow: false };
}

const CATEGORY_SLUG: Record<FleetCategory, string> = {
  Sedan: "sedan",
  SUV: "suv",
  Van: "van",
  "Ultra-Luxury": "ultra-luxury",
};

let created = 0;
let skipped = 0;

function log(entity: string, key: string, action: "created" | "skipped") {
  if (action === "created") created++;
  else skipped++;
  console.log(`  ${action === "created" ? "+" : "="} [${entity}] ${key} (${action})`);
}

// ── Media (virtual import, same pattern as Phase 8's blog images) ────────

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

// ── Vehicles ─────────────────────────────────────────────────────────────

async function migrateVehicles() {
  console.log("\nMigrating vehicles...");

  const categories = await prisma.vehicleCategory.findMany();
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  if (categoryIdBySlug.size === 0) {
    console.warn("  ! No VehicleCategory rows found — run `npm run db:seed` first. Aborting vehicle import.");
    return;
  }

  for (const [index, vehicle] of FLEET.entries()) {
    const categoryId = categoryIdBySlug.get(CATEGORY_SLUG[vehicle.category]);
    if (!categoryId) {
      console.warn(`  ! No VehicleCategory for "${vehicle.category}" — skipping ${vehicle.slug}.`);
      continue;
    }

    let row = await prisma.vehicle.findUnique({ where: { slug: vehicle.slug } });
    if (row) {
      log("vehicle", vehicle.slug, "skipped");
    } else {
      row = await prisma.vehicle.create({
        data: {
          slug: vehicle.slug,
          name: vehicle.name,
          brand: vehicle.brand,
          model: vehicle.model,
          categoryId,
          isElectric: vehicle.isElectric ?? false,
          isFeatured: false,
          isPlaceholder: vehicle.isPlaceholder ?? false,
          tagline: vehicle.tagline as unknown as Prisma.InputJsonValue,
          description: vehicle.description as unknown as Prisma.InputJsonValue,
          longDescription: vehicle.longDescription as unknown as Prisma.InputJsonValue,
          idealFor: vehicle.idealFor as unknown as Prisma.InputJsonValue,
          features: vehicle.features as unknown as Prisma.InputJsonValue,
          whyChoose: vehicle.whyChoose as unknown as Prisma.InputJsonValue,
          badge: (vehicle.badge ?? null) as unknown as Prisma.InputJsonValue,
          passengers: vehicle.passengers,
          luggage: vehicle.luggage ?? 0,
          rates: vehicle.rates as unknown as Prisma.InputJsonValue,
          seo: emptySeo(broadcast(vehicle.name), vehicle.description),
          status: "published",
          publishedAt: new Date(),
          sortOrder: index,
        },
      });
      log("vehicle", vehicle.slug, "created");
    }

    // Runs whether the vehicle row is new or pre-existing, so a second run
    // still backfills any images/FAQs that weren't imported yet.
    if (vehicle.images && vehicle.images.length > 0) {
      const existingImageCount = await prisma.vehicleImage.count({ where: { vehicleId: row.id } });
      if (existingImageCount === 0) {
        for (const [imgIndex, image] of vehicle.images.entries()) {
          const mediaId = await getOrCreateMediaItem(image.src, image.alt);
          if (!mediaId) continue;
          await prisma.vehicleImage.create({ data: { vehicleId: row.id, mediaId, sortOrder: imgIndex } });
        }
        console.log(`    + ${vehicle.images.length} image(s) for vehicle:${vehicle.slug}`);
      }
    }

    let faqsCreated = 0;
    for (const [faqIndex, faq] of vehicle.faqs.entries()) {
      const existingFaq = await prisma.faq.findFirst({
        where: { vehicleId: row.id, question: { equals: faq.question as unknown as Prisma.InputJsonValue } },
      });
      if (existingFaq) continue;
      await prisma.faq.create({
        data: {
          vehicleId: row.id,
          question: faq.question as unknown as Prisma.InputJsonValue,
          answer: faq.answer as unknown as Prisma.InputJsonValue,
          sortOrder: faqIndex,
        },
      });
      faqsCreated++;
    }
    if (faqsCreated > 0) console.log(`    + ${faqsCreated} embedded FAQ(s) for vehicle:${vehicle.slug}`);
  }
}

async function main() {
  console.log("Migrating Fleet static content into the CMS...\n");
  console.log("(Idempotent — rows that already exist by their natural key are skipped, never overwritten.)");

  await migrateVehicles();

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
