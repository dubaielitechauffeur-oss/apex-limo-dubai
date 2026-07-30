"use client";

import { useState } from "react";
import Image from "next/image";
import { Car } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";

interface VehicleHeroGalleryProps {
  vehicle: FleetVehicle;
}

/**
 * Vehicle detail page hero gallery: one large premium photo — rounded,
 * dark-bordered, with a category badge and an image-counter overlay — and
 * a clean thumbnail strip below it. Deliberately its own component (not
 * shared with fleet/related-vehicle cards), so it only ever affects the
 * vehicle detail page hero. Image state/order/thumbnail click behavior is
 * unchanged from before; only the visual presentation is new.
 */
export default function VehicleHeroGallery({ vehicle }: VehicleHeroGalleryProps) {
  const images = vehicle.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-charcoal via-obsidian to-charcoal shadow-[0_30px_60px_-25px_rgba(0,0,0,0.85)]">
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

        {/* Category badge overlay */}
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-obsidian shadow-sm sm:left-5 sm:top-5">
          {vehicle.category}
        </span>

        {/* Gallery counter indicator */}
        {images.length > 1 ? (
          <span className="absolute right-4 top-4 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ivory backdrop-blur-sm sm:right-5 sm:top-5">
            {activeIndex + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={isActive}
                className={`relative aspect-square w-16 shrink-0 snap-start overflow-hidden rounded-lg border transition-all duration-150 sm:w-20 ${
                  isActive ? "border-2 border-gold" : "border-gold/15 opacity-70 hover:border-gold/40 hover:opacity-100"
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
