import { NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { FLEET } from "@/data/fleet";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import type { Prisma } from "@/lib/generated/prisma/client";

const MIGRATE_SECRET = process.env.MIGRATE_SECRET ?? "";

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

export async function POST(request: Request) {
  const secret = request.headers.get("x-migrate-secret");
  if (!MIGRATE_SECRET || secret !== MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

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
            luggage: vehicle.luggage,
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
