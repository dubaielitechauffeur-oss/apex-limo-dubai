import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { resolveWithinRoot } from "@/lib/media/storage/local";

/**
 * Serves files written by the local storage driver (`lib/media/storage/local.ts`)
 * from a non-public directory — the whole reason `storage/media/` lives
 * outside `public/` (see DATABASE_ARCHITECTURE.md §7). This route only
 * makes sense for `storageProvider: "local"`; a `MediaItem` on the s3/r2
 * driver stores its own absolute CDN URL and is never served through here.
 *
 * Public and unauthenticated on purpose — these become real `<img>` sources
 * on the live site once future CMS phases wire vehicle/blog/hero fields to
 * MediaItem rows, exactly like any other static asset. No admin data is
 * exposed by this route: only the byte content of files that were already
 * successfully uploaded through the permission-gated admin upload flow.
 */
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

function isSafeSegment(segment: string): boolean {
  return segment.length > 0 && segment !== "." && segment !== ".." && !segment.includes("\0");
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0 || !segments.every(isSafeSegment)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = segments[segments.length - 1].split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPE_BY_EXTENSION[extension];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  let absolutePath: string;
  try {
    absolutePath = resolveWithinRoot(segments.join("/"));
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }
    const buffer = await readFile(absolutePath);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileStat.size),
        // Filenames are content-addressed (random UUID, never reused), so an
        // aggressive immutable cache is always safe.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
