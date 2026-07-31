import { Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";

/**
 * Display/body fonts for Chinese Simplified only — Playfair Display/Inter
 * have no CJK glyph coverage. Noto Serif/Sans SC are the standard, safest,
 * most complete choice for Simplified Chinese UI text.
 */
export const displayFont = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
