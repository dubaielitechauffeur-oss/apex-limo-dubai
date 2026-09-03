"use client";

import { ElementType, ReactNode, useEffect, useRef, useState } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms — pass index * 80 (or similar) for card grids. */
  delay?: number;
  /** "up" (default) fades in while rising slightly; "none" fades in place. */
  direction?: "up" | "none";
  /** Rendered element — defaults to "div"; use "li" inside a <ul>/<ol>. */
  as?: ElementType;
}

/** How long to wait for the observer's first callback before assuming it is
 *  never coming and showing the content anyway. IntersectionObserver always
 *  delivers an initial entry shortly after `observe()`, whether or not the
 *  target is on screen — so silence past this point means the observer is not
 *  working, not that the visitor simply hasn't scrolled here yet. */
const OBSERVER_FAILSAFE_MS = 1500;

/**
 * Fires once when the wrapped content scrolls into view, then fades/rises it
 * into place with a CSS transition — no animation library, just
 * IntersectionObserver + Tailwind. Reduced-motion is handled globally by the
 * `prefers-reduced-motion` override in globals.css (collapses the transition
 * to near-instant), so this component doesn't need its own motion check.
 *
 * Because the resting state is `opacity-0`, anything that stops this
 * component from running would leave the wrapped content permanently
 * invisible — and it wraps most of the site. Three guards prevent that:
 * browsers without IntersectionObserver reveal immediately, a failsafe timer
 * reveals if the observer never delivers its first callback, and the
 * `noscript` rule in globals.css reveals everything when JavaScript is off
 * entirely.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (very old browsers, some embedded webviews):
    // show the content rather than hiding it forever. Scheduled rather than
    // set synchronously so this stays a one-render update, and so the fade
    // still plays instead of the content snapping in mid-hydration.
    if (typeof IntersectionObserver === "undefined") {
      const immediate = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(immediate);
    }

    let failsafe: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Any callback at all proves the observer works, so the failsafe is
        // no longer needed even when this entry isn't intersecting yet.
        if (failsafe !== undefined) clearTimeout(failsafe);
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    failsafe = setTimeout(() => setIsVisible(true), OBSERVER_FAILSAFE_MS);

    observer.observe(node);
    return () => {
      if (failsafe !== undefined) clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={isVisible ? "shown" : "pending"}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : direction === "up" ? "opacity-0 translate-y-6" : "opacity-0"
      } ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
