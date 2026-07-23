import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { SERVICES } from "@/data/services";
import { serviceCardImageClass } from "@/lib/serviceCardImage";

/**
 * "What We Offer" — a luxury editorial services showcase: large 4:5
 * portrait photo cards with a dark gradient overlay, white typography, and
 * a scoped gold accent (#C9A14A, distinct from the site's shared `gold`
 * token so this redesign stays isolated to this section). Desktop shows 3
 * per row, tablet 2, and mobile falls back to a native horizontal
 * scroll-snap swipe row — all from the same markup, no JS carousel needed.
 */
export default function ServicesGrid() {
  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <SectionHeading
          eyebrow="What We Offer"
          title="Chauffeur Services Built Around You"
          subtitle="From airport transfers to VIP transportation, every journey is planned and delivered to the highest standard."
          tone="light"
        />

        <div className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group relative aspect-[4/5] w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-18px_rgba(0,0,0,0.7)] sm:w-auto sm:shrink"
            >
              <Image
                src={service.image.src}
                alt={service.image.alt}
                fill
                sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${serviceCardImageClass(service.slug)}`}
              />

              {/* Dark gradient overlay for text legibility */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"
              />

              {/* Content */}
              <div className="relative flex h-full flex-col justify-end p-7 sm:p-8">
                <h3 className="font-display text-2xl text-white sm:text-3xl">{service.name}</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#C9A14A]/50 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-wide text-white/90 backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#C9A14A] transition-colors duration-200 group-hover:text-[#e0bd6b]">
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
