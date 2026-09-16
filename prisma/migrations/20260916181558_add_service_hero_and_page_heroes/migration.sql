-- AlterTable
ALTER TABLE "services" ADD COLUMN     "heroDesktopImageId" TEXT,
ADD COLUMN     "heroMobileImageId" TEXT;

-- CreateTable
CREATE TABLE "page_heroes" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "desktopImageId" TEXT,
    "mobileImageId" TEXT,
    "imageAlt" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_heroes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_heroes_page_key" ON "page_heroes"("page");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_heroDesktopImageId_fkey" FOREIGN KEY ("heroDesktopImageId") REFERENCES "media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_heroMobileImageId_fkey" FOREIGN KEY ("heroMobileImageId") REFERENCES "media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_desktopImageId_fkey" FOREIGN KEY ("desktopImageId") REFERENCES "media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_heroes" ADD CONSTRAINT "page_heroes_mobileImageId_fkey" FOREIGN KEY ("mobileImageId") REFERENCES "media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
