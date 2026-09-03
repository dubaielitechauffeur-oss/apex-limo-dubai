"use client";

import { useCallback, useEffect, useRef, useState, type TransitionEvent } from "react";

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
 * Fleet and Brands carousels, and the vehicle detail page's mobile hero
 * gallery.
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
  // Autoplay must not tick while the document is hidden. A hidden tab still
  // runs `setInterval` (throttled to roughly once a minute) but never paints,
  // so CSS transitions never run and `transitionend` never fires — which is
  // what advances `index` past the cloned edge and snaps it back. Left
  // unguarded, `index` climbs unbounded while the visitor is away and the
  // track ends up translated far beyond the last slide, so the carousel is
  // blank when they return and only a reload fixes it.
  const [documentVisible, setDocumentVisible] = useState(true);

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
  //
  // react-hooks/set-state-in-effect flags this, and for ordinary derived
  // state it would be right — but `index` isn't derived from slidesPerView,
  // it's independent carousel position that the user also drives via
  // arrows/dots/swipe. A breakpoint change invalidates that position because
  // the clone buffer is rebuilt around it, so this is a genuine reset of
  // independent state in response to an external (viewport) change, not a
  // value that could be computed during render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Track document visibility so autoplay can be suspended entirely while the
  // tab is in the background (see `documentVisible` above), and so the track
  // can be re-normalised the moment the visitor comes back.
  useEffect(() => {
    const sync = () => setDocumentVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    // `pageshow` covers the bfcache restore path (navigating back to the page,
    // or returning to it on mobile Safari), where `visibilitychange` alone
    // isn't guaranteed to fire.
    window.addEventListener("pageshow", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  // Belt-and-braces recovery, run only on the hidden -> visible edge (not on
  // every index change, which would cancel the running animation): snap
  // without animating to the real slide equivalent to wherever `index` now
  // points. If the tab was hidden long enough for `index` to drift out of the
  // extended array — or a `transitionend` was simply missed — this puts a real
  // slide back under the viewport instead of empty space.
  const wasVisibleRef = useRef(true);
  const indexRef = useRef(index);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    wasVisibleRef.current = documentVisible;
    if (!documentVisible || wasVisible || itemCount < 1) return;

    const current = indexRef.current;
    const normalized = slidesPerView + ((((current - slidesPerView) % itemCount) + itemCount) % itemCount);
    if (normalized === current) return;
    setInstant(true);
    setIndex(normalized);
  }, [documentVisible, itemCount, slidesPerView]);

  useEffect(() => {
    if (!autoplayActive || !documentVisible) return;
    const timer = setInterval(next, autoplayIntervalMs);
    return () => clearInterval(timer);
  }, [autoplayActive, documentVisible, autoplayIntervalMs, next]);

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
  //
  // `transitionend` bubbles, so without the guard below every transition
  // inside a slide (card hover lifts, image scales, colour fades) also
  // reaches this handler and can fire a snap mid-animation, which reads as
  // the carousel randomly jumping. Only the track's own transform counts.
  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.propertyName !== "transform") return;

      if (index >= itemCount + slidesPerView) {
        setInstant(true);
        setIndex(index - itemCount);
      } else if (index < slidesPerView) {
        setInstant(true);
        setIndex(index + itemCount);
      }
    },
    [index, itemCount, slidesPerView]
  );

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
    /** True while autoplay is actively cycling — exposed so callers can
     *  render a pause control (WCAG 2.2.2: auto-advancing content running
     *  longer than 5s needs a way to stop it). */
    isAutoplaying: autoplayActive,
    /** Permanently stops autoplay — same effect as any arrow/dot
     *  interaction when `stopOnInteraction` is set, exposed directly so a
     *  dedicated pause button doesn't need to fake a navigation action. */
    stopAutoplay: handleInteraction,
  };
}
