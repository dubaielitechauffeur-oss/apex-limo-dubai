"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteCarouselOptions {
  /** Total number of real (non-cloned) items. */
  itemCount: number;
  /** How many items are visible at once — may change on resize. */
  slidesPerView: number;
  /** Delay after the section first enters the viewport before autoplay starts, ms. */
  autoplayDelayMs: number;
  /** Interval between automatic one-item advances, ms. */
  autoplayIntervalMs: number;
  /** How long to wait after manual interaction before autoplay resumes, ms. */
  resumeDelayMs?: number;
}

/**
 * Drives an infinite, one-item-at-a-time carousel shared by the homepage
 * Fleet and Brands carousels only.
 *
 * Callers render `slidesPerView` cloned items from the end of the list
 * before the real items, and `slidesPerView` cloned items from the start
 * after them (see FleetCarousel/BrandsShowcase). This hook's `index` is a
 * position in that extended array, starting at `slidesPerView` (the first
 * real item). Once a transition into a cloned edge finishes, it snaps
 * (transition disabled for one paint) to the equivalent real position —
 * always moving in the same direction, never animating backward.
 *
 * An IntersectionObserver arms autoplay once, `autoplayDelayMs` after the
 * section first scrolls into view; manual next/prev/goTo calls pause
 * autoplay and restart it after `resumeDelayMs` of inactivity.
 */
export function useInfiniteCarousel({
  itemCount,
  slidesPerView,
  autoplayDelayMs,
  autoplayIntervalMs,
  resumeDelayMs = 5000,
}: UseInfiniteCarouselOptions) {
  const [index, setIndex] = useState(slidesPerView);
  const [instant, setInstant] = useState(false);
  const [autoplayActive, setAutoplayActive] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const armedRef = useRef(false);
  // Generation token: whichever scheduled activation is requested most
  // recently "wins". Without this, a manual interaction that happens
  // before the initial IntersectionObserver delay elapses would get
  // silently overridden when that earlier timer fires and force-resumes
  // autoplay — this makes any stale, superseded timer a no-op instead.
  const activationTokenRef = useRef(0);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleActivation = useCallback((delay: number) => {
    const token = ++activationTokenRef.current;
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => {
      if (activationTokenRef.current === token) setAutoplayActive(true);
    }, delay);
  }, []);

  // Reset to the first real item whenever the visible-slide count changes
  // (e.g. a resize crosses a breakpoint and the clone buffer is rebuilt).
  useEffect(() => {
    setIndex(slidesPerView);
  }, [slidesPerView]);

  // Arm autoplay once, after `autoplayDelayMs`, the first time the section
  // enters the viewport — never starts while off-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || armedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || armedRef.current) return;
        armedRef.current = true;
        scheduleActivation(autoplayDelayMs);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [autoplayDelayMs, scheduleActivation]);

  const next = useCallback(() => setIndex((current) => current + 1), []);
  const prev = useCallback(() => setIndex((current) => current - 1), []);

  useEffect(() => {
    if (!autoplayActive) return;
    const timer = setInterval(next, autoplayIntervalMs);
    return () => clearInterval(timer);
  }, [autoplayActive, autoplayIntervalMs, next]);

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, []);

  const pauseThenResume = useCallback(() => {
    setAutoplayActive(false);
    scheduleActivation(resumeDelayMs);
  }, [resumeDelayMs, scheduleActivation]);

  const goNext = useCallback(() => {
    pauseThenResume();
    next();
  }, [pauseThenResume, next]);

  const goPrev = useCallback(() => {
    pauseThenResume();
    prev();
  }, [pauseThenResume, prev]);

  const goToRealIndex = useCallback(
    (realIndex: number) => {
      pauseThenResume();
      setIndex(slidesPerView + realIndex);
    },
    [pauseThenResume, slidesPerView],
  );

  // Once the CSS transition into a cloned edge finishes, snap invisibly
  // (no transition) to the equivalent real position — always continuing
  // forward/backward, never rewinding.
  const handleTransitionEnd = useCallback(() => {
    if (index >= itemCount + slidesPerView) {
      setInstant(true);
      setIndex(index - itemCount);
    } else if (index < slidesPerView) {
      setInstant(true);
      setIndex(index + itemCount);
    }
  }, [index, itemCount, slidesPerView]);

  // Re-enable the transition only after the browser has painted the
  // transition-less snap (double rAF — a single frame can land before paint).
  useEffect(() => {
    if (!instant) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setInstant(false));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [instant]);

  const activeRealIndex = (((index - slidesPerView) % itemCount) + itemCount) % itemCount;

  return {
    sectionRef,
    index,
    instant,
    activeRealIndex,
    goNext,
    goPrev,
    goToRealIndex,
    handleTransitionEnd,
  };
}
