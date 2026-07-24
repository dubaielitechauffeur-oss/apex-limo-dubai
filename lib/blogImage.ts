import fs from "node:fs";
import path from "node:path";

/**
 * Server-only check for whether a real photo has been placed at
 * `public${src}` yet. Only ever call this from a Server Component (the
 * blog pages) — never import it from a component that might end up in a
 * client bundle, since `node:fs` can't be bundled for the browser.
 */
export function blogImageExists(src: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", src));
  } catch {
    return false;
  }
}
