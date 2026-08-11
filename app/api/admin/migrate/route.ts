import { NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { FLEET } from "@/data/fleet";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import type { Prisma } from "@/lib/generated/prisma/client";

const MIGRATE_SECRET = process.env.MIGRATE_SECRET ?? "apex-migrate-2026";

function broadcast(value: string): Record<Locale, string> {
  const out = {} as Record<Locale, string>;
  for (const locale of routing.locales) out[locale] = value;
  return out;
}

function emptySeo(title: Record<Locale, string>, description: Record<Locale, string>): Prisma.InputJsonValue {
  return { title, description, ogImageId: null, canonical: null, noIndex: false, noFollow: false };
}

const CATEGORY_SLUG: Record<string, string> = {
  Sedan: "sedan",
  SUV: "suv",
  Van: "van",
  "Ultra-Luxury": "ultra-luxury",
};

function mimeTypeFor(filename: string): string {
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

/**
 * Replaces every existing vehicle's gallery with whatever data/fleet.ts
 * currently declares.
 *
 * The normal import path above only ever touches vehicles that don't exist
 * yet, and prisma/migrate-fleet-content.ts only imports images when a
 * vehicle has none — both deliberately, so a re-run can't wipe a gallery an
 * admin curated by hand. That means neither one can push replacement
 * photography to an environment whose database is already populated, which
 * is why refreshed images show up locally but not on a deployed site.
 *
 * This action is the explicit, opt-in way to do that. It is destructive by
 * design: it drops the VehicleImage rows for each vehicle it touches and
 * rebuilds them from the data file, so any hand-picked gallery ordering in
 * the admin panel is replaced. It is never part of the default request.
 */
async function resyncVehicleImages(prisma: PrismaClient) {
  const results = { vehiclesUpdated: 0, imagesLinked: 0, skipped: [] as string[], errors: [] as string[] };

  for (const vehicle of FLEET) {
    try {
      const row = await prisma.vehicle.findUnique({ where: { slug: vehicle.slug } });
      if (!row) {
        results.skipped.push(`${vehicle.slug}: not in database`);
        continue;
      }

      const images = vehicle.images ?? [];
      if (images.length === 0) {
        results.skipped.push(`${vehicle.slug}: no images declared`);
        continue;
      }

      // Detach first so the gallery ends up with exactly the declared
      // images, in the declared order — no leftovers from a longer set.
      await prisma.vehicleImage.deleteMany({ where: { vehicleId: row.id } });

      for (const [sortOrder, image] of images.entries()) {
        const filename = image.src.split("/").pop() ?? image.src;
        const alt = image.alt as unknown as Prisma.InputJsonValue;

        // MediaItem.url is not unique, so reuse by lookup rather than
        // upsert. Alt text is refreshed on reuse so re-worded descriptions
        // reach an item that some earlier run already created.
        const existing = await prisma.mediaItem.findFirst({ where: { url: image.src } });
        const media = existing
          ? await prisma.mediaItem.update({ where: { id: existing.id }, data: { alt } })
          : await prisma.mediaItem.create({
              data: {
                filename,
                originalFilename: filename,
                mimeType: mimeTypeFor(filename),
                sizeBytes: 0,
                alt,
                type: "image",
                variant: "original",
                storageProvider: "local",
                storagePath: image.src,
                url: image.src,
              },
            });

        await prisma.vehicleImage.create({ data: { vehicleId: row.id, mediaId: media.id, sortOrder } });
        results.imagesLinked++;
      }

      results.vehiclesUpdated++;
    } catch (e) {
      results.errors.push(`${vehicle.slug}: ${e}`);
    }
  }

  return results;
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-migrate-secret");
  if (!MIGRATE_SECRET || secret !== MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Body is optional — an empty request keeps the original import behaviour.
  const action = await request
    .json()
    .then((body: unknown) => (body as { action?: string } | null)?.action)
    .catch(() => undefined);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  if (action === "resync-images") {
    try {
      const imageResults = await resyncVehicleImages(prisma);
      return NextResponse.json({
        success: imageResults.errors.length === 0,
        message: `Image re-sync complete: ${imageResults.vehiclesUpdated} vehicle(s) updated, ${imageResults.imagesLinked} image(s) linked`,
        ...imageResults,
      });
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] };

  try {
    // Migrate vehicles
    const categories = await prisma.vehicleCategory.findMany();
    const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

    for (const [index, vehicle] of FLEET.entries()) {
      try {
        const categoryId = categoryIdBySlug.get(CATEGORY_SLUG[vehicle.category]);
        if (!categoryId) {
          results.errors.push(`No category for ${vehicle.slug}`);
          continue;
        }

        const existing = await prisma.vehicle.findUnique({ where: { slug: vehicle.slug } });
        if (existing) {
          results.skipped++;
          continue;
        }

        const row = await prisma.vehicle.create({
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
            seo: emptySeo(broadcast(vehicle.name), vehicle.description as unknown as Record<Locale, string>),
            status: "published",
            publishedAt: new Date(),
            sortOrder: index,
          },
        });

        // Images
        if (vehicle.images && vehicle.images.length > 0) {
          for (const [imgIndex, image] of vehicle.images.entries()) {
            const filename = image.src.split("/").pop() ?? image.src;
            const mimeType = filename.endsWith(".webp") ? "image/webp" : filename.endsWith(".png") ? "image/png" : "image/jpeg";
            const mediaItem = await prisma.mediaItem.create({
              data: {
                filename,
                originalFilename: filename,
                mimeType,
                sizeBytes: 0,
                alt: image.alt as unknown as Prisma.InputJsonValue,
                type: "image",
                variant: "original",
                storageProvider: "local",
                storagePath: image.src,
                url: image.src,
              },
            });
            await prisma.vehicleImage.create({ data: { vehicleId: row.id, mediaId: mediaItem.id, sortOrder: imgIndex } });
          }
        }

        // FAQs
        for (const [faqIndex, faq] of vehicle.faqs.entries()) {
          await prisma.faq.create({
            data: {
              vehicleId: row.id,
              question: faq.question as unknown as Prisma.InputJsonValue,
              answer: faq.answer as unknown as Prisma.InputJsonValue,
              sortOrder: faqIndex,
            },
          });
        }

        results.created++;
      } catch (e) {
        results.errors.push(`${vehicle.slug}: ${e}`);
      }
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  return NextResponse.json({
    success: true,
    message: `Migration complete: ${results.created} created, ${results.skipped} skipped`,
    ...results,
  });
}
