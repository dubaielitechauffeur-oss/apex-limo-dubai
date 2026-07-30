"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";
import { useInfiniteCarousel } from "@/components/home/useInfiniteCarousel";

interface VehicleHeroGalleryProps {
  vehicle: FleetVehicle;
}

const MOBILE_AUTOPLAY_DELAY_MS = 1000;
const MOBILE_AUTOPLAY_INTERVAL_MS = 1000;
const SWIPE_THRESHOLD_PX = 40;

/**
 * Vehicle detail page hero gallery. Renders two entirely independent
 * implementations, toggled by CSS breakpoint rather than shared state:
 * desktop (lg+) keeps the original single-photo + thumbnail-strip design
 * unchanged, while mobile gets its own swipeable, autoplaying, infinite-loop
 * carousel with arrows and dots instead of thumbnails. Kept as two separate
 * components (rather than one with responsive markup) so the desktop
 * behavior is provably untouched by the mobile redesign.
 */
export default function VehicleHeroGallery({ vehicle }: VehicleHeroGalleryProps) {
  return (
    <div>
      <div className="hidden lg:block">
        <DesktopGallery vehicle={vehicle} />
      </div>
      <div className="lg:hidden">
        <MobileGallery vehicle={vehicle} />
      </div>
    </div>
  );
}

/** Unchanged from before the mobile redesign — desktop only. */
function DesktopGallery({ vehicle }: VehicleHeroGalleryProps) {
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

        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-obsidian shadow-sm sm:left-5 sm:top-5">
          {vehicle.category}
        </span>

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

/**
 * Mobile only — swipe/arrow/dot carousel with autoplay, driven by the same
 * infinite-loop hook as the homepage Fleet/Brands carousels. Autoplay stops
 * for good the moment the user swipes, taps an arrow, or taps a dot.
 */
function MobileGallery({ vehicle }: VehicleHeroGalleryProps) {
  const images = vehicle.images ?? [];
  const hasMultiple = images.length > 1;

  const { sectionRef, index, instant, activeRealIndex, goNext, goPrev, goToRealIndex, handleTransitionEnd } =
    useInfiniteCarousel({
      itemCount: Math.max(images.length, 1),
      slidesPerView: 1,
      autoplayDelayMs: MOBILE_AUTOPLAY_DELAY_MS,
      autoplayIntervalMs: MOBILE_AUTOPLAY_INTERVAL_MS,
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
          <Image src={activeImage.src} alt={activeImage.alt} fill priority sizes="100vw" className="object-cover" />
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
                sizes="100vw"
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
