"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/shared/Container";
import BrandBadge from "./BrandBadge";
import { BRANDS } from "@/data/brands";

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

const AUTO_ADVANCE_MS = 4000;

/**
 * "Our Brands" — a looping badge carousel beneath the homepage fleet
 * section. Pages advance one full view (5 badges desktop / 3 tablet /
 * 2 mobile) and wrap from the last page back to the first, both via
 * the arrow buttons and on a timer; hovering the track pauses the timer.
 */
export default function BrandsShowcase() {
  const slidesPerView = useSlidesPerView();
  const pageCount = Math.ceil(BRANDS.length / slidesPerView);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setPage((current) => current % pageCount);
  }, [pageCount]);

  useEffect(() => {
    if (paused || pageCount <= 1) return;
    const timer = setInterval(() => {
      setPage((current) => (current + 1) % pageCount);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, pageCount]);

  const startIndex = Math.min(page * slidesPerView, BRANDS.length - slidesPerView);

  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <h2 className="text-center font-display text-3xl font-semibold text-obsidian sm:text-4xl">
          Our Brands
        </h2>

        <div
          className="relative mx-auto mt-14 max-w-5xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden" role="region" aria-label="Brand carousel">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${(startIndex * 100) / slidesPerView}%)` }}
            >
              {BRANDS.map((brand) => (
                <div
                  key={brand.name}
                  className="flex w-1/2 shrink-0 justify-center px-3 sm:w-1/3 lg:w-1/5"
                >
                  <BrandBadge brand={brand} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPage((current) => (current - 1 + pageCount) % pageCount)}
            aria-label="Previous brands"
            className="absolute -left-2 top-14 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold sm:-left-4 lg:-left-8"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => (current + 1) % pageCount)}
            aria-label="Next brands"
            className="absolute -right-2 top-14 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-colors duration-200 hover:bg-gold sm:-right-4 lg:-right-8"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {pageCount > 1 ? (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index)}
                aria-label={`Go to brand page ${index + 1} of ${pageCount}`}
                aria-current={index === page ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === page ? "w-6 bg-gold" : "w-2 bg-gold/30 hover:bg-gold/50"
                }`}
              />
            ))}
          </div>
        ) : null}

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
