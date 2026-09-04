-- Adds three columns that existed in schema.prisma and were already read and
-- written by application code, but that no migration ever created:
--
--   vehicles.amenities        -> lib/cms/fleet.ts (createVehicle/updateVehicle),
--                                lib/public/cms-content.ts (mapVehicle)
--   vehicles.popularFor       -> same, plus buildPopularForChips()
--   vehicle_images.mobileMediaId -> the mobile art variant rendered by
--                                components/fleet/VehicleHeroGallery.tsx
--
-- The production database presumably acquired them via `prisma db push`, which
-- applies a schema without recording a migration. The committed migration
-- history therefore did NOT describe the real schema: `prisma migrate deploy`
-- against a fresh database produced a `vehicles` table with no `amenities`
-- column, and every vehicle create/update through the CMS failed with
-- "The column `amenities` of relation `vehicles` does not exist".
--
-- Written as idempotent IF NOT EXISTS statements so it is safe to apply to an
-- environment that already received these columns through `db push`.

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "amenities" JSONB;
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "popularFor" JSONB;

-- AlterTable
ALTER TABLE "vehicle_images" ADD COLUMN IF NOT EXISTS "mobileMediaId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "vehicle_images_mobileMediaId_idx" ON "vehicle_images"("mobileMediaId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_images_mobileMediaId_fkey'
  ) THEN
    ALTER TABLE "vehicle_images"
      ADD CONSTRAINT "vehicle_images_mobileMediaId_fkey"
      FOREIGN KEY ("mobileMediaId") REFERENCES "media_items"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
