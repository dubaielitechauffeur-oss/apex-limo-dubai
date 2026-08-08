"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import DirectionalIcon from "@/components/shared/DirectionalIcon";
import CarouselPauseButton from "@/components/shared/CarouselPauseButton";
import FleetCarouselCard, { type FleetCarouselCardLabels } from "./FleetCarouselCard";
import type { PlainFleetVehicle } from "@/data/fleet";
import type { SiteContact } from "@/lib/public/site-contact";
import { useInfiniteCarousel } from "./useInfiniteCarousel";
import { isRtlLocale } from "@/i18n/locale-metadata";

interface FleetCarouselClientProps {
  vehicles: PlainFleetVehicle[];
  cardLabels: FleetCarouselCardLabels;
  contact: SiteContact;
  eyebrow: string;
  title: string;
  subtitle: string;
  ariaLabel: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  /** slug -> pre-resolved "Go to {name}" aria-label, computed server-side
   *  since function props can't cross the server/client boundary. */
  vehicleAriaLabels: Record<string, string>;
  viewFullFleet: string;
  pauseAriaLabel: string;
}

/** Cards visible at once: 1 on mobile, 2 on tablet, 3 on desktop.
 *  Must stay in sync with the card wrapper's w-full/md:w-1/2/lg:w-1/3. */
function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setSlidesPerView(3);
      else if (window.matchMedia("(min-width: 768px)").matches) setSlidesPerView(2);
      else setSlidesPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return slidesPerView;
}

const AUTOPLAY_DELAY_MS = 1000;
const AUTOPLAY_INTERVAL_MS = 4000;
const SWIPE_THRESHOLD_PX = 40;

/**
 * "Explore Our Fleet" — the primary homepage fleet section: an infinite,
 * one-card-at-a-time carousel with side arrows and dot indicators.
 * Auto-plays only while the section is on-screen (pausing when scrolled
 * away and re-arming, after a short delay, when it scrolls back into
 * view) — but only until the user manually touches the arrows/dots, at
 * which point auto-play stops for good. Loops seamlessly in both
 * directions via cloned edge cards — see useInfiniteCarousel.
 *
 * Receives already-localized vehicles and translated chrome strings from
 * the async Server Component wrapper (FleetCarousel.tsx) rather than
 * importing the FLEET data module by value, so the client bundle never
 * ships every locale's fleet copy — only the one page's worth of props.
 */
export default function FleetCarouselClient({
  vehicles,
  cardLabels,
  contact,
  eyebrow,
  title,
  subtitle,
  ariaLabel,
  prevAriaLabel,
  nextAriaLabel,
  vehicleAriaLabels,
  viewFullFleet,
  pauseAriaLabel,
}: FleetCarouselClientProps) {
  const rtl = isRtlLocale(useLocale());
  const slidesPerView = useSlidesPerView();
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
      itemCount: vehicles.length,
      slidesPerView,
      autoplayDelayMs: AUTOPLAY_DELAY_MS,
      autoplayIntervalMs: AUTOPLAY_INTERVAL_MS,
      stopOnInteraction: true,
      pauseWhenOffscreen: true,
    });

  // Clone `slidesPerView` cards from each edge so the track can keep
  // sliding in one direction through the wrap point (see useInfiniteCarousel).
  const extended = useMemo(() => {
    const startClones = vehicles.slice(-slidesPerView);
    const endClones = vehicles.slice(0, slidesPerView);
    return [...startClones, ...vehicles, ...endClones];
  }, [vehicles, slidesPerView]);

  // Touch/mouse swipe support: a drag ending past the threshold advances
  // one card, same as tapping an arrow. Tracked via refs (not state) since
  // only the release matters — no per-frame re-render is needed while
  // dragging. A swipe that ends on a card's link suppresses the resulting
  // click so a drag doesn't also navigate.
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const didSwipeRef = useRef(false);

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
      didSwipeRef.current = true;
      const draggedTowardStart = rtl ? dx < 0 : dx > 0;
      if (draggedTowardStart) goPrev();
      else goNext();
    }
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="border-t border-gold/10 bg-linen py-24"
    >
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            tone="light"
          />
        </Reveal>

        <div className="relative mt-16">
          {/* Track */}
          <div
            className="touch-pan-y overflow-hidden"
            role="region"
            aria-label={ariaLabel}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              dragStartRef.current = null;
            }}
            onClickCapture={handleClickCapture}
          >
            <div
              className={`flex ${instant ? "" : "transition-transform duration-500 ease-out"}`}
              style={{ transform: `translateX(${rtl ? "" : "-"}${(index * 100) / slidesPerView}%)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extended.map((vehicle, position) => (
                <div key={`${vehicle.slug}-${position}`} className="w-full shrink-0 px-3 md:w-1/2 lg:w-1/3">
                  <FleetCarouselCard vehicle={vehicle} labels={cardLabels} contact={contact} />
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={goPrev}
            aria-label={prevAriaLabel}
            className="absolute -start-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold hover:text-obsidian sm:-start-4 lg:-start-6"
          >
            <DirectionalIcon icon={ChevronLeft} className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={nextAriaLabel}
            className="absolute -end-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold hover:text-obsidian sm:-end-4 lg:-end-6"
          >
            <DirectionalIcon icon={ChevronRight} className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Dot indicators — one per vehicle, plus a pause control while autoplay is running */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {vehicles.map((vehicle, realIndex) => (
            <button
              key={vehicle.slug}
              type="button"
              onClick={() => goToRealIndex(realIndex)}
              aria-label={vehicleAriaLabels[vehicle.slug]}
              aria-current={realIndex === activeRealIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                realIndex === activeRealIndex ? "w-6 bg-gold" : "w-2 bg-gold/30 hover:bg-gold/50"
              }`}
            />
          ))}
          <CarouselPauseButton
            isAutoplaying={isAutoplaying}
            onStop={stopAutoplay}
            label={pauseAriaLabel}
            className="ms-2"
          />
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/fleet"
            className="inline-flex items-center justify-center rounded-lg bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep"
          >
            {viewFullFleet}
          </Link>
        </div>
      </Container>
    </section>
  );
}
