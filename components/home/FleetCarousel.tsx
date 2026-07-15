"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import FleetCarouselCard from "./FleetCarouselCard";
import { FLEET } from "@/data/fleet";

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

/**
 * "Explore Our Fleet" — the primary homepage fleet section: a paged
 * carousel of compact vehicle cards with side arrows and dot indicators.
 * Pages advance one full view (3 cards on desktop, 2 tablet, 1 mobile);
 * the final page clamps so the track never scrolls past the last card.
 */
export default function FleetCarousel() {
  const slidesPerView = useSlidesPerView();
  const pageCount = Math.ceil(FLEET.length / slidesPerView);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  // First visible card, clamped so a partial last page stays flush right.
  const startIndex = useMemo(
    () => Math.min(page * slidesPerView, FLEET.length - slidesPerView),
    [page, slidesPerView]
  );

  return (
    <section className="border-t border-gold/10 bg-linen py-24">
      <Container>
        <SectionHeading
          eyebrow="The Fleet"
          title="Explore Our Fleet"
          subtitle="Fifteen late-model vehicles, one uncompromising standard — every journey with a professional chauffeur included."
          tone="light"
        />

        <div className="relative mt-14">
          {/* Track */}
          <div className="overflow-hidden" role="region" aria-label="Fleet vehicles carousel">
            <div
              className="flex transition-transform duration-500 ease-out"
              // translateX % is relative to the track (container width), so one
              // card = 100/slidesPerView %.
              style={{ transform: `translateX(-${(startIndex * 100) / slidesPerView}%)` }}
            >
              {FLEET.map((vehicle) => (
                <div key={vehicle.slug} className="w-full shrink-0 px-3 md:w-1/2 lg:w-1/3">
                  <FleetCarouselCard vehicle={vehicle} />
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={page === 0}
            aria-label="Previous vehicles"
            className="absolute -left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold hover:text-obsidian disabled:cursor-default disabled:opacity-30 disabled:hover:bg-ivory sm:-left-4 lg:-left-6"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, pageCount - 1))}
            disabled={page === pageCount - 1}
            aria-label="Next vehicles"
            className="absolute -right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold hover:text-obsidian disabled:cursor-default disabled:opacity-30 disabled:hover:bg-ivory sm:-right-4 lg:-right-6"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`Go to page ${index + 1} of ${pageCount}`}
              aria-current={index === page ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === page ? "w-6 bg-gold" : "w-2 bg-gold/30 hover:bg-gold/50"
              }`}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/fleet" className="btn-gold px-12">
            View Our Full Fleet
          </Link>
        </div>
      </Container>
    </section>
  );
}
