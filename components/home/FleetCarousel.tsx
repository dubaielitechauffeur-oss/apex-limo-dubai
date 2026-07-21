"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import FleetCarouselCard from "./FleetCarouselCard";
import { FLEET } from "@/data/fleet";
import { FLEET_SIZE } from "@/lib/constants";
import { useInfiniteCarousel } from "./useInfiniteCarousel";

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

/**
 * "Explore Our Fleet" — the primary homepage fleet section: an infinite,
 * one-card-at-a-time carousel with side arrows and dot indicators.
 * Auto-plays only while the section is on-screen (pausing when scrolled
 * away and re-arming, after a short delay, when it scrolls back into
 * view) — but only until the user manually touches the arrows/dots, at
 * which point auto-play stops for good. Loops seamlessly in both
 * directions via cloned edge cards — see useInfiniteCarousel.
 */
export default function FleetCarousel() {
  const slidesPerView = useSlidesPerView();
  const { sectionRef, index, instant, activeRealIndex, goNext, goPrev, goToRealIndex, handleTransitionEnd } =
    useInfiniteCarousel({
      itemCount: FLEET.length,
      slidesPerView,
      autoplayDelayMs: AUTOPLAY_DELAY_MS,
      autoplayIntervalMs: AUTOPLAY_INTERVAL_MS,
      stopOnInteraction: true,
      pauseWhenOffscreen: true,
    });

  // Clone `slidesPerView` cards from each edge so the track can keep
  // sliding in one direction through the wrap point (see useInfiniteCarousel).
  const extended = useMemo(() => {
    const startClones = FLEET.slice(-slidesPerView);
    const endClones = FLEET.slice(0, slidesPerView);
    return [...startClones, ...FLEET, ...endClones];
  }, [slidesPerView]);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="border-t border-gold/10 bg-linen py-24"
    >
      <Container>
        <SectionHeading
          eyebrow="The Fleet"
          title="Explore Our Fleet"
          subtitle={`${FLEET_SIZE} late-model vehicles, one uncompromising standard — every journey with a professional chauffeur included.`}
          tone="light"
        />

        <div className="relative mt-16">
          {/* Track */}
          <div className="overflow-hidden" role="region" aria-label="Fleet vehicles carousel">
            <div
              className={`flex ${instant ? "" : "transition-transform duration-500 ease-out"}`}
              style={{ transform: `translateX(-${(index * 100) / slidesPerView}%)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extended.map((vehicle, position) => (
                <div key={`${vehicle.slug}-${position}`} className="w-full shrink-0 px-3 md:w-1/2 lg:w-1/3">
                  <FleetCarouselCard vehicle={vehicle} />
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous vehicles"
            className="absolute -left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold hover:text-obsidian sm:-left-4 lg:-left-6"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next vehicles"
            className="absolute -right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold hover:text-obsidian sm:-right-4 lg:-right-6"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* Dot indicators — one per vehicle */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FLEET.map((vehicle, realIndex) => (
            <button
              key={vehicle.slug}
              type="button"
              onClick={() => goToRealIndex(realIndex)}
              aria-label={`Go to ${vehicle.name}`}
              aria-current={realIndex === activeRealIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                realIndex === activeRealIndex ? "w-6 bg-gold" : "w-2 bg-gold/30 hover:bg-gold/50"
              }`}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/fleet"
            className="inline-flex items-center justify-center rounded-sm bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep"
          >
            View Our Full Fleet
          </Link>
        </div>
      </Container>
    </section>
  );
}
