"use client";

import { useState } from "react";
import Image from "next/image";
import type { VehicleGalleryImages } from "@/data/fleet";

interface VehicleHeroGalleryProps {
  images: VehicleGalleryImages;
  vehicleName: string;
}

const VIEW_ORDER: { key: keyof VehicleGalleryImages; label: string }[] = [
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
  { key: "detail", label: "Detail" },
];

/**
 * Premium hero gallery for the Mercedes V-Class pilot page: a large
 * featured image with a real-photo thumbnail selector beneath it,
 * rather than the site-wide VehicleGallery's text-tab treatment.
 * Scoped to this one page — VehicleGallery is untouched for every
 * other vehicle.
 */
export default function VehicleHeroGallery({ images, vehicleName }: VehicleHeroGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = VIEW_ORDER[activeIndex];
  const activeImage = images[active.key];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold/20 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.5)]">
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-obsidian/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold backdrop-blur-sm">
          {active.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {VIEW_ORDER.map((view, index) => {
          const isActive = index === activeIndex;
          const image = images[view.key];
          return (
            <button
              key={view.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${view.label} photo of ${vehicleName}`}
              aria-current={isActive}
              className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                isActive ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 33vw, 160px"
                className="object-cover"
              />
              <span
                className={`absolute inset-x-0 bottom-0 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-white transition-colors ${
                  isActive ? "bg-gold/90 text-obsidian" : "bg-obsidian/60"
                }`}
              >
                {view.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
