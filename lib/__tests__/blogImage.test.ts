import { describe, it, expect } from "vitest";
import { blogImageExists } from "@/lib/blogImage";

/**
 * The remote-URL case is the one that broke in production: a blog post
 * whose featured image was uploaded through the CMS is stored as an
 * absolute Vercel Blob URL, and statting that under `public/` can only ever
 * fail — so every CMS-uploaded blog image rendered as the "image pending"
 * placeholder on the public site while the file itself had uploaded fine.
 */
describe("blogImageExists", () => {
  it("accepts a CMS upload stored as an absolute URL", () => {
    expect(
      blogImageExists("https://ygHPuYwlX0pCimn5.public.blob.vercel-storage.com/2026/09/photo.jpg")
    ).toBe(true);
  });

  it("accepts http and protocol-relative URLs too", () => {
    expect(blogImageExists("http://example.com/photo.jpg")).toBe(true);
    expect(blogImageExists("//example.com/photo.jpg")).toBe(true);
  });

  it("still resolves a static path that really is in public/", () => {
    // Shipped with the repo — see data/blog.ts.
    expect(blogImageExists("/images/blog/dubai-airport-transfer-vs-taxi.png")).toBe(true);
  });

  it("still reports a missing static path, which is what shows the placeholder", () => {
    // The deliberate case: a post's copy is written but its photo hasn't
    // been added to the repo yet, so the frame names the file to add.
    expect(blogImageExists("/images/blog/not-added-yet.png")).toBe(false);
  });

  it("treats a post with no featured image as having none", () => {
    expect(blogImageExists("")).toBe(false);
  });
});
