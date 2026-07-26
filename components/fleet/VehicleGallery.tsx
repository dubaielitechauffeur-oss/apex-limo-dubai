"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Car } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";

interface VehicleGalleryProps {
  vehicle: FleetVehicle;
  /**
   * Set true only for the single above-the-fold hero instance of this
   * gallery on a page (e.g. the vehicle detail page hero). Defaults to
   * false so grid contexts (fleet listing, "related vehicles") — where
   * many instances of this component render at once — never mark
   * multiple images priority/eager-loaded at the same time.
   */
  priority?: boolean;
}

/**
 * Renders a single-photo gallery panel with a numbered tab strip for
 * vehicles that have more than one photo. Photos are shown in the exact
 * order provided in `vehicle.images` (index 0 = hero) — since real
 * photography isn't guaranteed to map to fixed Exterior/Interior/Detail
 * views, tabs are generic "1", "2", "3" rather than labelled categories.
 * Falls back to the original gradient + icon treatment when no photos are
 * available, unchanged, so vehicles without photos still render as before.
 */
export default function VehicleGallery({ vehicle, priority = false }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();

  const images = vehicle.images ?? [];
  const activeImage = images[activeIndex];

  return (
    <div>
      {/* Panel */}
      <div
        id={`${baseId}-panel-${activeIndex}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeIndex}`}
        className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden border border-gold/20 bg-gradient-to-br from-charcoal via-obsidian to-charcoal p-5"
      >
        {activeImage ? (
          <>
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority={priority && activeIndex === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
              className="object-cover"
            />
            {/* Scrim so the label/caption text stays legible over a photo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/10 to-obsidian/40"
            />
          </>
        ) : null}

        <div className="relative flex items-start justify-between">
          <span className="label-eyebrow text-[10px]">{vehicle.category}</span>
          {images.length > 1 ? (
            <span className="label-eyebrow text-[10px]">
              {activeIndex + 1} / {images.length}
            </span>
          ) : null}
        </div>

        {!activeImage ? (
          <div className="relative flex flex-1 items-center justify-center">
            <Car className="h-16 w-16 text-gold/70 sm:h-20 sm:w-20" strokeWidth={1} aria-hidden="true" />
          </div>
        ) : null}

        <div className="relative">
          <div className="route-line-sm mb-3 w-10 opacity-70" />
          <p className="font-display text-lg text-smoke">{vehicle.name}</p>
          <p className="mt-1 text-xs text-smoke">{vehicle.tagline}</p>
        </div>
      </div>

      {/* Tabs */}
      {images.length > 1 ? (
        <div role="tablist" aria-label={`${vehicle.name} photos`} className="mt-3 flex gap-2">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.src}
                id={`${baseId}-tab-${index}`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`${baseId}-panel-${index}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                className={`flex flex-1 items-center justify-center border py-2 text-[11px] uppercase tracking-wide transition-colors duration-150 ${
                  isActive
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-gold/15 text-smoke hover:border-gold/40 hover:text-gold"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
