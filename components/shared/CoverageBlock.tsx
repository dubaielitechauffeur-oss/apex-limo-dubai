import Link from "next/link";
import { MapPin } from "lucide-react";
import Container from "@/components/shared/Container";

const COVERAGE_LOCATIONS = [
  { name: "Downtown Dubai", slug: "downtown-dubai" },
  { name: "Dubai Marina", slug: "dubai-marina" },
  { name: "Business Bay", slug: "business-bay" },
  { name: "Palm Jumeirah", slug: "palm-jumeirah" },
  { name: "Jumeirah", slug: "jbr" },
  { name: "Dubai Airport", slug: "dubai-international-airport-dxb" },
];

interface CoverageBlockProps {
  title?: string;
}

/**
 * Compact area-coverage strip — a lightweight list of linked locations, not
 * a full Locations section. Shared between the service detail pages (sits
 * just above the FAQ) and the Fleet page (sits just after the listings).
 */
export default function CoverageBlock({
  title = "Available Across Dubai & UAE",
}: CoverageBlockProps) {
  return (
    <section className="border-t border-gold/10 bg-linen py-14">
      <Container className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="font-display text-lg text-obsidian sm:text-xl">{title}</h2>
        </div>

        <nav aria-label="Areas covered" className="flex flex-wrap justify-center gap-2 sm:justify-end">
          {COVERAGE_LOCATIONS.map((location) => (
            <Link
              key={location.slug}
              href={`/locations/${location.slug}`}
              className="rounded-full border border-obsidian/10 bg-ivory px-4 py-2 text-xs font-medium text-graphite transition-colors duration-200 hover:border-gold-deep/40 hover:text-obsidian"
            >
              {location.name}
            </Link>
          ))}
        </nav>
      </Container>
    </section>
  );
}
