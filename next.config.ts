import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * All content today ships from data/*.ts as local /public paths — verified
 * zero external image URLs in use (see data/fleet.ts, data/blog.ts, etc.).
 * Scoped to Google's own image/beacon hosts (which next/image never
 * proxies) plus self; the previous hostname: "**" allowed the Image
 * Optimizer to fetch from any HTTPS host, which was unused in practice but
 * a real SSRF-adjacent misconfiguration for whoever adds a CMS-driven
 * image field later.
 */
const IMAGE_REMOTE_PATTERNS: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

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
  "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
