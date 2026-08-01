import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapPin } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";

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
export default async function CoverageBlock({ title }: CoverageBlockProps) {
  const resolvedTitle = title ?? (await getTranslations("locations.coverage"))("title");
  const tA11y = await getTranslations("common.a11y");
  return (
    <section className="border-t border-gold/10 bg-linen py-14">
      <Container>
        <Reveal className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-start">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="font-display text-lg text-obsidian sm:text-xl">{resolvedTitle}</h2>
          </div>

          <nav aria-label={tA11y("areasCovered")} className="flex flex-wrap justify-center gap-2 sm:justify-end">
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
        </Reveal>
      </Container>
    </section>
  );
}
