"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Car, Armchair, Sparkles, type LucideIcon } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";

type ViewKey = "exterior" | "interior" | "detail";

interface GalleryView {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  caption: string;
}

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
 * Renders a tabbed gallery for a vehicle (Exterior / Interior / Detail).
 * If `vehicle.images` is present (real photography), each tab shows the
 * matching photo via next/image. Otherwise it falls back to the original
 * gradient + icon treatment, unchanged, so vehicles without photos yet
 * still render exactly as before.
 */
export default function VehicleGallery({ vehicle, priority = false }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();

  const views: GalleryView[] = [
    { key: "exterior", label: "Exterior", icon: Car, caption: vehicle.tagline },
    { key: "interior", label: "Interior", icon: Armchair, caption: vehicle.features[0] },
    {
      key: "detail",
      label: "Detail",
      icon: Sparkles,
      caption: vehicle.features[vehicle.features.length - 1],
    },
  ];

  const active = views[activeIndex];
  const activeImage = vehicle.images?.[active.key];

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
          <span className="label-eyebrow text-[10px]">{active.label}</span>
        </div>

        {!activeImage ? (
          <div className="relative flex flex-1 items-center justify-center">
            <active.icon
              className="h-16 w-16 text-gold/70 sm:h-20 sm:w-20"
              strokeWidth={1}
              aria-hidden="true"
            />
          </div>
        ) : null}

        <div className="relative">
          <div className="route-line-sm mb-3 w-10 opacity-70" />
          <p className="font-display text-lg text-smoke">{vehicle.name}</p>
          <p className="mt-1 text-xs text-smoke">{active.caption}</p>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label={`${vehicle.name} views`} className="mt-3 flex gap-2">
        {views.map((view, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={view.key}
              id={`${baseId}-tab-${index}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              className={`flex flex-1 items-center justify-center gap-1.5 border py-2 text-[11px] uppercase tracking-wide transition-colors duration-150 ${
                isActive
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-gold/15 text-smoke hover:border-gold/40 hover:text-gold"
              }`}
            >
              <view.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {view.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
