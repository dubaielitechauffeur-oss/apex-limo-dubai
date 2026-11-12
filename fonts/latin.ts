/**
 * Display/body fonts for Latin + Cyrillic locales (en, ru, fr, de) — same
 * two families used site-wide before this migration, with latin-ext and
 * cyrillic subsets added to cover accented French/German characters and
 * Russian without introducing a new font family for those three locales.
 *
 * Self-hosted: the font files are committed under fonts/files/ and loaded with
 * next/font/local (see fonts/generated/), so `next build` never downloads
 * fonts. Families, weights, subsets and `display` are unchanged from the
 * former Google Fonts loader calls; to change them, edit and re-run
 * fonts/sync-google-fonts.mjs.
 */
export { playfairDisplay as displayFont } from "./generated/playfair-display";
export { inter as bodyFont } from "./generated/inter";
