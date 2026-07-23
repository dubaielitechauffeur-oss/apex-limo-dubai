import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import type { Service } from "@/data/services";
import { serviceCardImageClass } from "@/lib/serviceCardImage";

interface OtherServicesGridProps {
  services: Service[];
}

/**
 * "Other Services" — the same luxury editorial card design as the homepage
 * ServicesGrid (large photo, dark gradient, white type, gold accents;
 * desktop 3-up, mobile a native scroll-snap swipe row), reused here for a
 * service detail page's related-services rail. Shows each service's short
 * description in place of the homepage version's tag chips.
 */
export default function OtherServicesGrid({ services }: OtherServicesGridProps) {
  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <SectionHeading
          eyebrow="Explore More"
          title="Other Services"
          subtitle="Every Apex service shares the same fleet, chauffeurs, and standard of care."
          tone="light"
        />

        <div className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
          {services.map((service) => (
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

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"
              />

              <div className="relative flex h-full flex-col justify-end p-7 sm:p-8">
                <h3 className="font-display text-2xl text-white sm:text-3xl">{service.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {service.shortDescription}
                </p>

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
