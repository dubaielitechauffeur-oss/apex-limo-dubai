"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LocationServiceCard from "./LocationServiceCard";
import { SERVICES, type Service } from "@/data/services";

const CARDS_PER_VIEW = 3;
const AUTOPLAY_INTERVAL_MS = 5000;
const DRAG_THRESHOLD_PX = 40;

function chunk(items: Service[], size: number): Service[][] {
  const pages: Service[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

const PAGES = chunk(SERVICES, CARDS_PER_VIEW);

/**
 * Desktop-only "Our Services" carousel for location pages — pages through
 * the service cards 3 at a time (instead of the previous all-6-at-once
 * grid) with a slow autoplay. Any manual interaction — arrows, dots, or a
 * pointer drag — permanently stops autoplay for the rest of the page's
 * lifetime, so the carousel never fights the visitor. Mobile/tablet never
 * render this component (see LocationServicesSection).
 */
export default function LocationServicesCarousel() {
  const [page, setPage] = useState(0);
  const [autoplayActive, setAutoplayActive] = useState(true);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef<number | null>(null);
  const pageCount = PAGES.length;

  const stopAutoplay = useCallback(() => setAutoplayActive(false), []);

  const goToPage = useCallback(
    (next: number) => {
      setPage(((next % pageCount) + pageCount) % pageCount);
    },
    [pageCount]
  );

  const goNext = useCallback(() => {
    stopAutoplay();
    goToPage(page + 1);
  }, [goToPage, page, stopAutoplay]);

  const goPrev = useCallback(() => {
    stopAutoplay();
    goToPage(page - 1);
  }, [goToPage, page, stopAutoplay]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplayActive || !inView || pageCount <= 1) return;
    const timer = setInterval(() => {
      setPage((current) => (current + 1) % pageCount);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [autoplayActive, inView, pageCount]);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStartX.current = e.clientX;
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;
    stopAutoplay();
    goToPage(deltaX < 0 ? page + 1 : page - 1);
  }

  return (
    <div ref={sectionRef} className="relative">
      <div className="overflow-hidden" role="region" aria-label="Our services">
        <div
          className="flex cursor-grab select-none transition-transform duration-700 ease-out active:cursor-grabbing"
          style={{ transform: `translateX(-${page * 100}%)` }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {PAGES.map((pageServices, i) => (
            <div key={i} className="grid w-full shrink-0 grid-cols-3 gap-6">
              {pageServices.map((service) => (
                <LocationServiceCard key={service.slug} service={service} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous services"
            className="absolute -left-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9A14A]/40 bg-black/70 text-[#C9A14A] backdrop-blur-sm transition-colors duration-200 hover:border-[#C9A14A] hover:bg-black"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next services"
            className="absolute -right-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9A14A]/40 bg-black/70 text-[#C9A14A] backdrop-blur-sm transition-colors duration-200 hover:border-[#C9A14A] hover:bg-black"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <div className="mt-8 flex justify-center gap-2">
            {PAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  stopAutoplay();
                  goToPage(i);
                }}
                aria-label={`Go to services page ${i + 1}`}
                aria-current={i === page ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === page ? "w-6 bg-[#C9A14A]" : "w-1.5 bg-[#C9A14A]/30 hover:bg-[#C9A14A]/50"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
