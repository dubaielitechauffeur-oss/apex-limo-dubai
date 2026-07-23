import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/data/services";

interface LocationServiceCardProps {
  service: Service;
  /** Extra classes for sizing/shrink behavior — differs between the mobile
   *  scroll-snap row and the desktop carousel. */
  className?: string;
}

/**
 * The exact card design used by the homepage ServicesGrid — large 4:5
 * portrait photo, dark gradient overlay, white type, gold tag chips —
 * duplicated here (rather than imported) so the location-page "Our
 * Services" section can be restructured (desktop carousel) without ever
 * touching the homepage component.
 */
export default function LocationServiceCard({ service, className = "" }: LocationServiceCardProps) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className={`group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-18px_rgba(0,0,0,0.7)] ${className}`}
    >
      <Image
        src={service.image.src}
        alt={service.image.alt}
        fill
        sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"
      />

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
  );
}
