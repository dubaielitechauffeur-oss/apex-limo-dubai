import Image from "next/image";
import Link from "next/link";
import { Car, Clock, Plane, type LucideIcon } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";

interface FleetCarouselCardProps {
  vehicle: FleetVehicle;
}

const formatAed = (amount: number) => `AED ${amount.toLocaleString("en-US")}`;

/**
 * Compact vertical card for the homepage fleet carousel — image with a
 * gold brand badge, black brand bar, gold model bar, a four-tile rate
 * row (10h / 5h / 1h / airport), and the View Car / Contact Us actions.
 * Rates come from vehicle.rates in data/fleet.ts (currently placeholder
 * sample figures — see the VehicleRates doc comment there).
 */
export default function FleetCarouselCard({ vehicle }: FleetCarouselCardProps) {
  const cover = vehicle.images?.exterior;
  const rateTiles: { icon: LucideIcon; label: string; amount: number }[] = [
    { icon: Clock, label: "10 Hours", amount: vehicle.rates.tenHours },
    { icon: Clock, label: "5 Hours", amount: vehicle.rates.fiveHours },
    { icon: Clock, label: "1 Hour", amount: vehicle.rates.oneHour },
    { icon: Plane, label: "Airport", amount: vehicle.rates.airport },
  ];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gold/15 bg-ivory shadow-[0_16px_35px_-22px_rgba(10,10,10,0.35)] transition-shadow duration-300 hover:shadow-[0_22px_45px_-18px_rgba(10,10,10,0.4)]">
      {/* Image with brand badge */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-charcoal via-obsidian to-charcoal">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2.5">
            <Car className="h-12 w-12 text-gold/50" strokeWidth={1} aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-widest text-smoke">
              Image Coming Soon
            </span>
          </div>
        )}
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-obsidian shadow-sm">
          {vehicle.brand}
        </span>
      </div>

      {/* Brand bar */}
      <div className="bg-obsidian py-2 text-center text-[11px] uppercase tracking-widest text-ivory">
        {vehicle.brand}
      </div>

      {/* Model bar */}
      <div className="bg-gold py-2.5 text-center text-base font-semibold uppercase tracking-wide text-obsidian">
        {vehicle.model}
      </div>

      {/* Rates */}
      <div className="grid grid-cols-4 gap-1 px-3 py-5">
        {rateTiles.map(({ icon: Icon, label, amount }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15">
              <Icon className="h-4 w-4 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-[10px] uppercase tracking-wide text-graphite">{label}</span>
            <span className="text-xs font-semibold text-obsidian">{formatAed(amount)}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-auto grid grid-cols-2 gap-3 px-4 pb-5">
        <Link
          href={`/fleet/${vehicle.slug}`}
          className="inline-flex items-center justify-center rounded-sm bg-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:bg-gold-deep"
        >
          View Car
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-sm border border-obsidian/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:border-obsidian hover:bg-obsidian hover:text-ivory"
        >
          Contact Us
        </Link>
      </div>
    </article>
  );
}
