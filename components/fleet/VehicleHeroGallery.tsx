"use client";

import { useRef } from "react";
import Image from "next/image";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";
import { useInfiniteCarousel } from "@/components/home/useInfiniteCarousel";

interface VehicleHeroGalleryProps {
  vehicle: FleetVehicle;
}

const AUTOPLAY_DELAY_MS = 1000;
const AUTOPLAY_INTERVAL_MS = 1000;
const SWIPE_THRESHOLD_PX = 40;

/**
 * Mobile-only (lg:hidden) wrapper around the shared carousel gallery. The
 * desktop hero renders VehicleGalleryCarousel directly in its own two-column
 * layout — see app/fleet/[vehicle]/page.tsx.
 */
export default function VehicleHeroGallery({ vehicle }: VehicleHeroGalleryProps) {
  return (
    <div className="lg:hidden">
      <VehicleGalleryCarousel vehicle={vehicle} sizes="100vw" />
    </div>
  );
}

/**
 * Swipeable, autoplaying, infinite-loop carousel with arrows and dots —
 * originally built for the mobile hero gallery, now also used for the
 * desktop hero's image column (replacing the old static-image +
 * thumbnail-strip treatment). Driven by the same infinite-loop hook as the
 * homepage Fleet/Brands carousels. Autoplay stops for good the moment the
 * user swipes, taps an arrow, or taps a dot.
 */
export function VehicleGalleryCarousel({
  vehicle,
  sizes = "100vw",
}: VehicleHeroGalleryProps & { sizes?: string }) {
  const images = vehicle.images ?? [];
  const hasMultiple = images.length > 1;

  const { sectionRef, index, instant, activeRealIndex, goNext, goPrev, goToRealIndex, handleTransitionEnd } =
    useInfiniteCarousel({
      itemCount: Math.max(images.length, 1),
      slidesPerView: 1,
      autoplayDelayMs: AUTOPLAY_DELAY_MS,
      autoplayIntervalMs: AUTOPLAY_INTERVAL_MS,
      stopOnInteraction: true,
      pauseWhenOffscreen: false,
    });

  const extended = hasMultiple ? [images[images.length - 1], ...images, images[0]] : images;

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev();
      else goNext();
    }
  };

  if (!hasMultiple) {
    const activeImage = images[0];
    return (
      <div
        ref={sectionRef as React.RefObject<HTMLDivElement>}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-charcoal via-obsidian to-charcoal shadow-[0_30px_60px_-25px_rgba(0,0,0,0.85)]"
      >
        {activeImage ? (
          <Image src={activeImage.src} alt={activeImage.alt} fill priority sizes={sizes} className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Car className="h-16 w-16 text-gold/70" strokeWidth={1} aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-obsidian shadow-sm">
          {vehicle.category}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={sectionRef as React.RefObject<HTMLDivElement>}
        className="relative touch-pan-y aspect-[4/3] overflow-hidden rounded-2xl border border-gold/20 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.85)]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStartRef.current = null;
        }}
      >
        <div
          className={`flex h-full ${instant ? "" : "transition-transform duration-500 ease-out"}`}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extended.map((image, position) => (
            <div
              key={`${image.src}-${position}`}
              className="relative h-full w-full shrink-0 bg-gradient-to-br from-charcoal via-obsidian to-charcoal"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                draggable={false}
                priority={position === 1}
                sizes={sizes}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-obsidian shadow-sm">
          {vehicle.category}
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ivory backdrop-blur-sm">
          {activeRealIndex + 1} / {images.length}
        </span>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-ivory backdrop-blur-sm transition-colors duration-200 hover:bg-gold hover:text-obsidian"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-ivory backdrop-blur-sm transition-colors duration-200 hover:bg-gold hover:text-obsidian"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToRealIndex(i)}
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === activeRealIndex}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeRealIndex ? "w-6 bg-gold" : "w-2 bg-gold/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
