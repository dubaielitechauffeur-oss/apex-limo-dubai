const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** Lowercase, hyphenated, ASCII-only — matches every existing slug already
 *  in `data/*.ts` (e.g. "airport-transfers", "downtown-dubai"). Used both
 *  server-side (validating a submitted slug) and by the client-side
 *  "generate from name" button. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "") // strip accents (e.g. "é" -> "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
