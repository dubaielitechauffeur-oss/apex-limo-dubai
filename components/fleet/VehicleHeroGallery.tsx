"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import type { PlainFleetVehicle } from "@/data/fleet";
import { useInfiniteCarousel } from "@/components/home/useInfiniteCarousel";
import DirectionalIcon from "@/components/shared/DirectionalIcon";
import CarouselPauseButton from "@/components/shared/CarouselPauseButton";
import { isRtlLocale } from "@/i18n/locale-metadata";

interface VehicleHeroGalleryProps {
  vehicle: PlainFleetVehicle;
}

const AUTOPLAY_DELAY_MS = 1000;
// Previously 1000ms — advancing a new photo every second gave visitors no
// real time to look at each image and made the WCAG 2.2.2 pause control
// below almost pointless (it would already have moved on by the time
// someone reacted). 4000ms matches the homepage fleet carousel's pace.
const AUTOPLAY_INTERVAL_MS = 4000;
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
  const rtl = isRtlLocale(useLocale());
  const t = useTranslations("fleet.heroGallery");
  const tCategory = useTranslations("fleet.detail.categories");
  const tA11y = useTranslations("common.a11y");
  const images = vehicle.images ?? [];
  const hasMultiple = images.length > 1;
  const categoryLabel = tCategory(vehicle.category);

  const {
    sectionRef,
    index,
    instant,
    activeRealIndex,
    goNext,
    goPrev,
    goToRealIndex,
    handleTransitionEnd,
    isAutoplaying,
    stopAutoplay,
  } = useInfiniteCarousel({
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
      const draggedTowardStart = rtl ? dx < 0 : dx > 0;
      if (draggedTowardStart) goPrev();
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
        <span className="absolute start-4 top-4 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-obsidian shadow-sm">
          {categoryLabel}
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
          style={{ transform: `translateX(${rtl ? "" : "-"}${index * 100}%)` }}
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

        <span className="absolute start-4 top-4 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-obsidian shadow-sm">
          {categoryLabel}
        </span>
        <span className="absolute end-4 top-4 inline-flex items-center rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ivory backdrop-blur-sm">
          {activeRealIndex + 1} / {images.length}
        </span>

        <button
          type="button"
          onClick={goPrev}
          aria-label={t("previousPhoto")}
          className="absolute start-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-ivory backdrop-blur-sm transition-colors duration-200 hover:bg-gold hover:text-obsidian"
        >
          <DirectionalIcon icon={ChevronLeft} className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label={t("nextPhoto")}
          className="absolute end-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-ivory backdrop-blur-sm transition-colors duration-200 hover:bg-gold hover:text-obsidian"
        >
          <DirectionalIcon icon={ChevronRight} className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToRealIndex(i)}
            aria-label={t("goToPhotoAriaLabel", { index: i + 1 })}
            aria-current={i === activeRealIndex}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeRealIndex ? "w-6 bg-gold" : "w-2 bg-gold/30"
            }`}
          />
        ))}
        <CarouselPauseButton
          isAutoplaying={isAutoplaying}
          onStop={stopAutoplay}
          label={tA11y("pauseCarouselAriaLabel")}
          className="ms-2"
        />
      </div>
    </div>
  );
}
