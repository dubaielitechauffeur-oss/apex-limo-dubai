"use client";

import { useState } from "react";
import Image from "next/image";
import { Car } from "lucide-react";
import type { FleetVehicle, VehicleImage } from "@/data/fleet";

interface VehicleHeroGalleryProps {
  vehicle: FleetVehicle;
}

/**
 * Vehicle detail page hero gallery: one large photo with a clean thumbnail
 * strip below it — no badges, no title overlay, no Exterior/Interior/Detail
 * tabs. Deliberately a separate component from the shared VehicleGallery
 * (still used, unchanged, on fleet/related-vehicle cards), so this redesign
 * only ever affects the vehicle detail page hero.
 */
export default function VehicleHeroGallery({ vehicle }: VehicleHeroGalleryProps) {
  const images: VehicleImage[] = vehicle.images
    ? [vehicle.images.exterior, vehicle.images.interior, vehicle.images.detail].filter(Boolean)
    : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden border border-gold/20 bg-gradient-to-br from-charcoal via-obsidian to-charcoal">
        {activeImage ? (
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Car className="h-16 w-16 text-gold/70 sm:h-20 sm:w-20" strokeWidth={1} aria-hidden="true" />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={isActive}
                className={`relative aspect-square w-16 shrink-0 snap-start overflow-hidden border transition-colors duration-150 sm:w-20 ${
                  isActive ? "border-2 border-gold" : "border-gold/15 hover:border-gold/40"
                }`}
              >
                <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
