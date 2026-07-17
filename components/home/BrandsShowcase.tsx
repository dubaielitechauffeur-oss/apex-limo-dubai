"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/shared/Container";
import BrandBadge from "./BrandBadge";
import { BRANDS } from "@/data/brands";
import { useInfiniteCarousel } from "./useInfiniteCarousel";

/** Badges visible at once: 2 on mobile, 3 on tablet, 5 on desktop. */
function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(5);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setSlidesPerView(5);
      else if (window.matchMedia("(min-width: 768px)").matches) setSlidesPerView(3);
      else setSlidesPerView(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return slidesPerView;
}

const AUTOPLAY_DELAY_MS = 500;
const AUTOPLAY_INTERVAL_MS = 2500;

/**
 * "Our Brands" — an infinite, one-logo-at-a-time badge carousel beneath
 * the homepage fleet section. Auto-plays once the section scrolls into
 * view (after a short delay), pausing on manual arrow/dot use and
 * resuming after a few seconds of inactivity. Always advances forward
 * (or backward) through cloned edge badges rather than rewinding — see
 * useInfiniteCarousel.
 */
export default function BrandsShowcase() {
  const slidesPerView = useSlidesPerView();
  const { sectionRef, index, instant, activeRealIndex, goNext, goPrev, goToRealIndex, handleTransitionEnd } =
    useInfiniteCarousel({
      itemCount: BRANDS.length,
      slidesPerView,
      autoplayDelayMs: AUTOPLAY_DELAY_MS,
      autoplayIntervalMs: AUTOPLAY_INTERVAL_MS,
    });

  const extended = useMemo(() => {
    const startClones = BRANDS.slice(-slidesPerView);
    const endClones = BRANDS.slice(0, slidesPerView);
    return [...startClones, ...BRANDS, ...endClones];
  }, [slidesPerView]);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="border-t border-gold/10 bg-ivory py-24"
    >
      <Container>
        <h2 className="text-center font-display text-3xl font-semibold text-obsidian sm:text-4xl">
          Our Brands
        </h2>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="overflow-hidden" role="region" aria-label="Brand carousel">
            <div
              className={`flex ${instant ? "" : "transition-transform duration-500 ease-out"}`}
              style={{ transform: `translateX(-${(index * 100) / slidesPerView}%)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extended.map((brand, position) => (
                <div
                  key={`${brand.name}-${position}`}
                  className="flex w-1/2 shrink-0 justify-center px-3 sm:w-1/3 lg:w-1/5"
                >
                  <BrandBadge brand={brand} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous brands"
            className="absolute -left-2 top-14 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold sm:-left-4 lg:-left-8"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next brands"
            className="absolute -right-2 top-14 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold sm:-right-4 lg:-right-8"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {BRANDS.map((brand, realIndex) => (
            <button
              key={brand.name}
              type="button"
              onClick={() => goToRealIndex(realIndex)}
              aria-label={`Go to ${brand.name}`}
              aria-current={realIndex === activeRealIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                realIndex === activeRealIndex ? "w-6 bg-gold" : "w-2 bg-gold/30 hover:bg-gold/50"
              }`}
            />
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Link
            href="/fleet"
            className="w-full bg-gold px-8 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:bg-gold-deep sm:w-auto"
          >
            View Our Fleet
          </Link>
          <Link
            href="/booking"
            className="w-full bg-gold px-8 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:bg-gold-deep sm:w-auto"
          >
            Book a Car
          </Link>
          <Link
            href="/contact"
            className="w-full bg-gold px-8 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:bg-gold-deep sm:w-auto"
          >
            Request Details
          </Link>
        </div>
      </Container>
    </section>
  );
}
