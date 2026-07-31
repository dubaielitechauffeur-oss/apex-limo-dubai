import { Playfair_Display, Inter } from "next/font/google";

/**
 * Display/body fonts for Latin + Cyrillic locales (en, ru, fr, de) — same
 * two families used site-wide before this migration, with latin-ext and
 * cyrillic subsets added to cover accented French/German characters and
 * Russian without introducing a new font family for those three locales.
 */
export const displayFont = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});
