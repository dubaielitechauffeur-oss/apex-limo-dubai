/**
 * Brand wordmark font — always Latin. "APEX" never translates (it's a
 * proper noun), so this loads unconditionally regardless of locale rather
 * than being split per-script like the display/body fonts below.
 *
 * Self-hosted: the font files are committed under fonts/files/ and loaded with
 * next/font/local (see fonts/generated/), so `next build` never downloads
 * fonts. Families, weights, subsets and `display` are unchanged from the
 * former Google Fonts loader calls; to change them, edit and re-run
 * fonts/sync-google-fonts.mjs.
 */
export { saira as logoFont } from "./generated/saira";
