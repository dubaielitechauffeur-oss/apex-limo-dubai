"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Reveal once the page has scrolled roughly a viewport's worth down. */
const SHOW_AFTER_PX = 400;

/**
 * Fixed "back to top" button stacked directly above WhatsAppFloatButton.
 * Hidden near the top of the page; once the visitor has scrolled down
 * (e.g. down at the footer), tapping it smooth-scrolls back to the top.
 */
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-24 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ivory text-obsidian shadow-md transition-all duration-300 hover:bg-gold sm:bottom-28 sm:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
