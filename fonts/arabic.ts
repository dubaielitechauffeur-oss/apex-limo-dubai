/**
 * Display/body fonts for Arabic only — Playfair Display/Inter have no
 * Arabic glyph coverage. Amiri (an editorial Naskh-revival face) pairs in
 * spirit with Playfair Display's serif display role; Cairo is a modern
 * geometric Arabic UI face, the closest cousin to Inter's character.
 *
 * Self-hosted: the font files are committed under fonts/files/ and loaded with
 * next/font/local (see fonts/generated/), so `next build` never downloads
 * fonts. Families, weights, subsets and `display` are unchanged from the
 * former Google Fonts loader calls; to change them, edit and re-run
 * fonts/sync-google-fonts.mjs.
 */
export { amiri as displayFont } from "./generated/amiri";
export { cairo as bodyFont } from "./generated/cairo";
