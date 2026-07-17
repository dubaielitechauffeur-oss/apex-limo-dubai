"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteCarouselOptions {
  /** Total number of real (non-cloned) items. */
  itemCount: number;
  /** How many items are visible at once — may change on resize. */
  slidesPerView: number;
  /** Delay after the section enters the viewport before autoplay starts, ms. */
  autoplayDelayMs: number;
  /** Interval between automatic one-item advances, ms. */
  autoplayIntervalMs: number;
  /** How long to wait after manual interaction before autoplay resumes, ms.
   *  Ignored when `stopOnInteraction` is true. */
  resumeDelayMs?: number;
  /** When true, any manual next/prev/goTo permanently stops autoplay for
   *  the rest of the page's lifetime — it never resumes on its own again.
   *  When false (default), autoplay pauses on interaction and resumes
   *  after `resumeDelayMs` of inactivity. */
  stopOnInteraction?: boolean;
  /** When true, autoplay pauses whenever the section scrolls out of the
   *  viewport and re-arms (after `autoplayDelayMs`) each time it scrolls
   *  back in — as long as it hasn't been permanently stopped by manual
   *  interaction. When false (default), autoplay arms once the first time
   *  the section becomes visible and then keeps running regardless of
   *  later visibility changes. */
  pauseWhenOffscreen?: boolean;
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
 */
export function useInfiniteCarousel({
  itemCount,
  slidesPerView,
  autoplayDelayMs,
  autoplayIntervalMs,
  resumeDelayMs = 5000,
  stopOnInteraction = false,
  pauseWhenOffscreen = false,
}: UseInfiniteCarouselOptions) {
  const [index, setIndex] = useState(slidesPerView);
  const [instant, setInstant] = useState(false);
  const [autoplayActive, setAutoplayActive] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  // Once true (stopOnInteraction mode only), autoplay must never turn back
  // on — not on a resume timer, not on scrolling back into view.
  const stoppedRef = useRef(false);
  // Generation token: whichever scheduled activation is requested most
  // recently "wins", so an earlier still-pending timer (e.g. the initial
  // viewport-entry delay) can't silently override a later pause/stop.
  const activationTokenRef = useRef(0);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = useCallback(() => {
    activationTokenRef.current += 1;
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  const scheduleActivation = useCallback((delay: number) => {
    const token = ++activationTokenRef.current;
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => {
      if (activationTokenRef.current === token && !stoppedRef.current) {
        setAutoplayActive(true);
      }
    }, delay);
  }, []);

  // Reset to the first real item whenever the visible-slide count changes
  // (e.g. a resize crosses a breakpoint and the clone buffer is rebuilt).
  useEffect(() => {
    setIndex(slidesPerView);
  }, [slidesPerView]);

  // Visibility handling: either arm autoplay once (default) or continuously
  // pause/resume it as the section leaves/re-enters the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (!pauseWhenOffscreen) {
      let armed = false;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || armed) return;
          armed = true;
          scheduleActivation(autoplayDelayMs);
          observer.disconnect();
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!stoppedRef.current) scheduleActivation(autoplayDelayMs);
        } else {
          setAutoplayActive(false);
          cancelPending();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoplayDelayMs, pauseWhenOffscreen, scheduleActivation, cancelPending]);

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

  const handleInteraction = useCallback(() => {
    if (stopOnInteraction) {
      stoppedRef.current = true;
      setAutoplayActive(false);
      cancelPending();
    } else {
      setAutoplayActive(false);
      scheduleActivation(resumeDelayMs);
    }
  }, [stopOnInteraction, resumeDelayMs, scheduleActivation, cancelPending]);

  const goNext = useCallback(() => {
    handleInteraction();
    next();
  }, [handleInteraction, next]);

  const goPrev = useCallback(() => {
    handleInteraction();
    prev();
  }, [handleInteraction, prev]);

  const goToRealIndex = useCallback(
    (realIndex: number) => {
      handleInteraction();
      setIndex(slidesPerView + realIndex);
    },
    [handleInteraction, slidesPerView],
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
