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

/**
 * Fires once when the wrapped content scrolls into view, then fades/rises it
 * into place with a CSS transition — no animation library, just
 * IntersectionObserver + Tailwind. Reduced-motion is handled globally by the
 * `prefers-reduced-motion` override in globals.css (collapses the transition
 * to near-instant), so this component doesn't need its own motion check.
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : direction === "up" ? "opacity-0 translate-y-6" : "opacity-0"
      } ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
