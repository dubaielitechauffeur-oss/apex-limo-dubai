import { Amiri, Cairo } from "next/font/google";

/**
 * Display/body fonts for Arabic only — Playfair Display/Inter have no
 * Arabic glyph coverage. Amiri (an editorial Naskh-revival face) pairs in
 * spirit with Playfair Display's serif display role; Cairo is a modern
 * geometric Arabic UI face, the closest cousin to Inter's character.
 */
export const displayFont = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
