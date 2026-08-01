"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DirectionalIcon from "@/components/shared/DirectionalIcon";
import LocationServiceCard from "./LocationServiceCard";
import type { PlainService } from "@/data/services";
import { isRtlLocale } from "@/i18n/locale-metadata";

const CARDS_PER_VIEW = 3;
const AUTOPLAY_INTERVAL_MS = 5000;
const DRAG_THRESHOLD_PX = 40;

interface LocationServicesCarouselProps {
  services: PlainService[];
  learnMoreLabel: string;
}

function chunk(items: PlainService[], size: number): PlainService[][] {
  const pages: PlainService[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

/**
 * Desktop-only "Our Services" carousel for location pages — pages through
 * the service cards 3 at a time (instead of the previous all-6-at-once
 * grid) with a slow autoplay. Any manual interaction — arrows, dots, or a
 * pointer drag — permanently stops autoplay for the rest of the page's
 * lifetime, so the carousel never fights the visitor. Mobile/tablet never
 * render this component (see LocationServicesSection). Receives its
 * already-localized `services` as a prop from a Server Component parent
 * rather than importing the data module by value, so the client bundle
 * only ships the current locale's trimmed card data, not all 6 locales'
 * full service content (descriptions, FAQs, etc.).
 */
export default function LocationServicesCarousel({
  services,
  learnMoreLabel,
}: LocationServicesCarouselProps) {
  const rtl = isRtlLocale(useLocale());
  const t = useTranslations("common.a11y");
  const [page, setPage] = useState(0);
  const [autoplayActive, setAutoplayActive] = useState(true);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef<number | null>(null);
  const PAGES = chunk(services, CARDS_PER_VIEW);
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
    const draggedTowardNext = rtl ? deltaX > 0 : deltaX < 0;
    goToPage(draggedTowardNext ? page + 1 : page - 1);
  }

  return (
    <div ref={sectionRef} className="relative">
      <div className="overflow-hidden" role="region" aria-label={t("ourServicesRegion")}>
        <div
          className="flex cursor-grab select-none transition-transform duration-700 ease-out active:cursor-grabbing"
          style={{ transform: `translateX(${rtl ? "" : "-"}${page * 100}%)` }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {PAGES.map((pageServices, i) => (
            <div key={i} className="grid w-full shrink-0 grid-cols-3 gap-6">
              {pageServices.map((service) => (
                <LocationServiceCard key={service.slug} service={service} learnMoreLabel={learnMoreLabel} />
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
            aria-label={t("previousServices")}
            className="absolute -start-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9A14A]/40 bg-black/70 text-[#C9A14A] backdrop-blur-sm transition-colors duration-200 hover:border-[#C9A14A] hover:bg-black"
          >
            <DirectionalIcon icon={ChevronLeft} className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t("nextServices")}
            className="absolute -end-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9A14A]/40 bg-black/70 text-[#C9A14A] backdrop-blur-sm transition-colors duration-200 hover:border-[#C9A14A] hover:bg-black"
          >
            <DirectionalIcon icon={ChevronRight} className="h-4 w-4" strokeWidth={1.75} />
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
                aria-label={t("goToServicesPageTemplate", { index: i + 1 })}
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
