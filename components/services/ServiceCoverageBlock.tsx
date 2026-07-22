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

/**
 * Compact service-area strip — a lightweight list of linked locations, not
 * a full Locations section. Sits just above the FAQ block on every service
 * detail page.
 */
export default function ServiceCoverageBlock() {
  return (
    <section className="border-t border-gold/10 bg-linen py-14">
      <Container className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="font-display text-lg text-obsidian sm:text-xl">
            Available Across Dubai &amp; UAE
          </h2>
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
