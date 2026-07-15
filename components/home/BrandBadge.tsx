import type { Brand } from "@/data/brands";

interface BrandBadgeProps {
  brand: Brand;
}

/**
 * Circular brand badge — thin gold ring, the manufacturer's own logo
 * centered inside, and a small decorative wing flourish beneath it,
 * echoing the Apex crest. Logo artwork credited in data/brands.ts.
 *
 * Plain <img> rather than next/image: several logos are local SVGs, and
 * Next's image optimizer rejects SVG sources by default (its `images`
 * config would need `dangerouslyAllowSVG` site-wide to route these
 * through it) — a native <img> avoids that for a handful of small,
 * trusted static files.
 */
export default function BrandBadge({ brand }: BrandBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-gold/50 bg-ivory shadow-[0_8px_20px_-12px_rgba(10,10,10,0.25)] sm:h-32 sm:w-32">
        <div className="relative flex h-14 w-20 items-center justify-center sm:h-16 sm:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Decorative wing flourish */}
        <svg
          viewBox="0 0 64 16"
          aria-hidden="true"
          className="absolute bottom-2 h-3 w-14 text-gold-deep"
        >
          <path
            d="M32 8c-4-6-14-7-20-3 5 0 10 2 14 5-6 0-12 1-16 4 6 1 12 0 17-2 1.5 1 3.5 1 5 0 5 2 11 3 17 2-4-3-10-4-16-4 4-3 9-5 14-5-6-4-16-3-20 3"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className="text-xs uppercase tracking-widest text-graphite">{brand.name}</span>
    </div>
  );
}
