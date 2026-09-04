import fs from "node:fs";
import path from "node:path";

/**
 * Whether there is a real image to render for a blog post.
 *
 * Two kinds of source now sit side by side, and they need different answers:
 *
 *  - **A CMS upload**, stored as an absolute URL (Vercel Blob). There is
 *    nothing local to stat, and `MediaItem.url` is only ever written after
 *    the upload succeeded — so these always render. Statting them was the
 *    bug this guards against: `path.join(cwd, "public", "https://…")` is a
 *    path that can never exist, so every CMS-uploaded blog image fell back
 *    to the "image pending" placeholder on the public site even though the
 *    file had uploaded perfectly.
 *
 *  - **A static path under `public/`** (the posts in data/blog.ts). These
 *    keep the original filesystem check, which is what drives that
 *    placeholder deliberately: a post can ship with its copy written and
 *    its photo still missing, and the frame then shows exactly which file
 *    to add.
 *
 * An empty `src` — a CMS post with no featured image chosen — is not an
 * image either way, and gets the placeholder.
 *
 * Server-only: never import this from a component that could end up in a
 * client bundle, since `node:fs` can't be bundled for the browser.
 */
export function blogImageExists(src: string): boolean {
  if (!src) return false;

  // http://, https://, and protocol-relative //host/path — anything remote
  // is served by its own host, not from this repo's `public/`.
  if (/^(https?:)?\/\//i.test(src)) return true;

  try {
    return fs.existsSync(path.join(process.cwd(), "public", src));
  } catch {
    return false;
  }
}
