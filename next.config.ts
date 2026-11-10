import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** Where CMS-uploaded media lives. Vercel Blob serves every store from
 *  `<store>.public.blob.vercel-storage.com`, so one wildcard label covers
 *  this project's store without naming its id — and without widening the
 *  allowance beyond Vercel Blob's own domain. */
const VERCEL_BLOB_HOST = "*.public.blob.vercel-storage.com";

/**
 * Static content still ships from data/*.ts as local /public paths, but
 * media uploaded through the admin Media Library is stored in Vercel Blob
 * and referenced by its absolute URL — the "CMS-driven image field later"
 * this list was previously emptied in anticipation of. next/image refuses
 * any remote URL that matches no pattern here, which is what left every
 * uploaded image broken once uploads started working.
 *
 * Scoped to exactly that one host rather than restoring the old
 * hostname: "**", which let the Image Optimizer fetch from any HTTPS host
 * (the SSRF-adjacent shape the previous change removed, and worth keeping
 * removed).
 */
const IMAGE_REMOTE_PATTERNS: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: VERCEL_BLOB_HOST },
];

/**
 * A CSP that allows exactly what this site actually loads: same-origin
 * assets, inline JSON-LD/next-intl scripts (no nonce infrastructure exists
 * yet, so 'unsafe-inline' is required — tightening this further means
 * threading a per-request nonce through every layout/page that emits an
 * inline <script>, which is a larger follow-up, not a drop-in change), and
 * Google Analytics (loaded via @next/third-parties in app/[locale]/layout.tsx).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  // The Blob host is needed even though next/image proxies through
  // /_next/image (same-origin): the vehicle gallery renders a CMS image
  // with a mobile variant as a native <picture>/<img> pointing straight at
  // the Blob URL, and the browser blocks that without an img-src entry.
  `img-src 'self' data: https://${VERCEL_BLOB_HOST} https://www.google-analytics.com https://www.googletagmanager.com`,
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

/**
 * Vehicle slugs that no longer exist, each sent (301) to its closest live
 * page — the renamed vehicle where there is one, otherwise the category page.
 * Every pair is redirected in all six locales: the old rule covered only the
 * unprefixed English URL, which left `/ar/fleet/mercedes-v-class` and its
 * siblings live.
 *
 * Search Console's crawl stats showed Googlebot repeatedly hitting the
 * retired slugs below as 404s, so they still carry inbound links worth
 * keeping. Never list a slug that is live in the CMS: the redirect runs
 * before the page and would hide it.
 */
const RETIRED_VEHICLE_REDIRECTS: ReadonlyArray<readonly [from: string, to: string]> = [
  ["mercedes-v-class", "mercedes-v-class-v300-v250"],
  // Intermediate slug between the two V-Class renames; GSC still lists
  // /ar/fleet/mercedes-v-class-v300 as crawled.
  ["mercedes-v-class-v300", "mercedes-v-class-v300-v250"],
  ["bentley-flying-spur", "ultra-luxury"],
  ["rolls-royce-ghost", "rolls-royce-phantom"],
  ["mercedes-e-class", "sedan"],
  ["toyota-land-cruiser", "suv"],
];

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: IMAGE_REMOTE_PATTERNS,
  },
  compress: true,
  experimental: {
    serverActions: {
      // Next's default Server Action body limit (1 MB) is well under
      // lib/media/validation.ts's MAX_UPLOAD_BYTES (10 MB) — without this,
      // the admin media upload action would reject a legitimate 2–10 MB
      // photo before it ever reached that validation. A small margin above
      // 10 MB accounts for multipart form overhead around the file bytes.
      bodySizeLimit: "12mb",
    },
  },

  async redirects() {
    return RETIRED_VEHICLE_REDIRECTS.flatMap(([from, to]) => [
      { source: `/fleet/${from}`, destination: `/fleet/${to}`, permanent: true },
      {
        source: `/:locale(ar|ru|zh|fr|de)/fleet/${from}`,
        destination: `/:locale/fleet/${to}`,
        permanent: true,
      },
    ]);
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  /**
   * Serves the WebP version when something still asks for a legacy `.png`
   * under `/images/fleet/` or `/images/blog/`.
   *
   * Those 48 photographs were converted to WebP (105.9 MB -> 15.9 MB) and the
   * PNG originals removed. The `data/*.ts` references were updated with them —
   * but the PUBLIC site reads vehicle and blog images from the DATABASE
   * (`MediaItem.url`, plus the raw `imageUrl`/`heroDesktopImageUrl`/
   * `heroMobileImageUrl`/`logoUrl` columns), and those rows were written by the
   * import scripts with the original `.png` paths. Every one of them 404'd the
   * moment the files went away.
   *
   * A rewrite rather than a redirect: it is transparent to `next/image`'s
   * optimizer (which fetches the source URL from this same origin) and to the
   * raw `<picture>`/`<img>` paths alike, and costs no extra round trip.
   *
   * `20260905000000_fix_media_png_paths` corrects the stored rows, so after it
   * runs this rule matches nothing. It is deliberately kept anyway: it is the
   * safety net for any environment whose database has not had that migration
   * applied yet, for CMS rows in other environments, and for external links or
   * cached HTML still pointing at a `.png`.
   *
   * Scoped to `fleet` and `blog` ONLY. `/images/brands/*.png` are real, still
   * present, and deliberately excluded — three brand logos were kept as PNG
   * because they are flat-colour marks with alpha.
   */
  async rewrites() {
    return [
      { source: "/images/fleet/:path*.png", destination: "/images/fleet/:path*.webp" },
      { source: "/images/blog/:path*.png", destination: "/images/blog/:path*.webp" },
    ];
  },
};

export default withNextIntl(nextConfig);
