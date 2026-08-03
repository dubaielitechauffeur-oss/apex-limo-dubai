"use client";

import { Pause } from "lucide-react";

interface CarouselPauseButtonProps {
  isAutoplaying: boolean;
  onStop: () => void;
  label: string;
  className?: string;
}

/**
 * WCAG 2.2.2 (Pause, Stop, Hide) control for auto-advancing carousels —
 * renders only while autoplay is actually running, and disappears once
 * stopped (by this button or any other interaction), since there's
 * nothing left to pause at that point.
 */
export default function CarouselPauseButton({
  isAutoplaying,
  onStop,
  label,
  className = "",
}: CarouselPauseButtonProps) {
  if (!isAutoplaying) return null;

  return (
    <button
      type="button"
      onClick={onStop}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-ivory/90 text-obsidian shadow-sm transition-colors duration-200 hover:bg-gold ${className}`}
    >
      <Pause className="h-3.5 w-3.5" strokeWidth={2} fill="currentColor" />
    </button>
  );
}
