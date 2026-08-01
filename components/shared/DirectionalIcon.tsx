import type { LucideIcon } from "lucide-react";

interface DirectionalIconProps {
  icon: LucideIcon;
  className?: string;
  strokeWidth?: number;
}

/**
 * Wraps a directional Lucide icon (back/forward arrows, prev/next chevrons)
 * so it mirrors automatically in RTL locales. Uses a CSS horizontal flip
 * keyed off the ancestor `dir="rtl"` — no locale check needed, and it can't
 * drift out of sync with the actual rendered direction. Only use this for
 * icons whose meaning is "back/forward" in reading order; a chevron that
 * opens/closes something downward (e.g. an accordion) isn't direction-of-
 * reading-sensitive and should stay a plain icon.
 */
export default function DirectionalIcon({ icon: Icon, className = "", strokeWidth }: DirectionalIconProps) {
  return <Icon className={`rtl:-scale-x-100 ${className}`} strokeWidth={strokeWidth} aria-hidden="true" />;
}
