-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "heroDesktopImageId" TEXT,
ADD COLUMN     "heroMobileImageId" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "imageId" TEXT;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_heroDesktopImageId_fkey" FOREIGN KEY ("heroDesktopImageId") REFERENCES "media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_heroMobileImageId_fkey" FOREIGN KEY ("heroMobileImageId") REFERENCES "media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
