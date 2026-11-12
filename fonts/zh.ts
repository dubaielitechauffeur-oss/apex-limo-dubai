/**
 * Display/body fonts for Chinese Simplified only — Playfair Display/Inter
 * have no CJK glyph coverage. Noto Serif/Sans SC are the standard, safest,
 * most complete choice for Simplified Chinese UI text.
 *
 * Self-hosted: the font files are committed under fonts/files/ and loaded with
 * next/font/local (see fonts/generated/), so `next build` never downloads
 * fonts. Families, weights, subsets and `display` are unchanged from the
 * former Google Fonts loader calls; to change them, edit and re-run
 * fonts/sync-google-fonts.mjs.
 */
export { notoSerifSc as displayFont } from "./generated/noto-serif-sc";
export { notoSansSc as bodyFont } from "./generated/noto-sans-sc";
