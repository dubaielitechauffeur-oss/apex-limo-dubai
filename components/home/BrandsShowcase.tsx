import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import BrandBadge from "./BrandBadge";
import { getBrands } from "@/lib/public/cms-content";

/**
 * "Our Brands" — a continuously auto-scrolling logo ticker beneath the
 * homepage fleet section. Glides left at a constant slow speed via a
 * looping CSS animation, no manual controls. The brand list is rendered
 * twice back-to-back and the track animates exactly -50%, so the loop
 * point is seamless (respects prefers-reduced-motion via the site-wide
 * rule in globals.css).
 */
export default async function BrandsShowcase() {
  const t = await getTranslations("home.brandsShowcase");
  const brands = await getBrands();
  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} tone="light" />
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden">
          <div className="flex w-max animate-brand-marquee">
            {[...brands, ...brands].map((brand, position) => (
              <div key={`${brand.name}-${position}`} className="flex shrink-0 justify-center px-6 sm:px-8">
                <BrandBadge brand={brand} />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Link
            href="/fleet"
            className="w-full rounded-lg bg-gold px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep sm:w-auto"
          >
            {t("viewFleet")}
          </Link>
          <Link
            href="/booking"
            className="w-full rounded-lg bg-gold px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep sm:w-auto"
          >
            {t("bookCar")}
          </Link>
          <Link
            href="/contact"
            className="w-full rounded-lg bg-gold px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep sm:w-auto"
          >
            {t("requestDetails")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
