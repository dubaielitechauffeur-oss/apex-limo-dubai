import Image from "next/image";
import Link from "next/link";
import { Car, Users, Briefcase, Wifi, GlassWater, type LucideIcon } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";

interface FleetListingCardProps {
  vehicle: FleetVehicle;
}

interface SpecItemProps {
  icon: LucideIcon;
  label: string;
}

function SpecItem({ icon: Icon, label }: SpecItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
      <span className="text-xs font-medium uppercase tracking-wide text-graphite">{label}</span>
    </div>
  );
}

const formatAed = (amount: number) => `AED ${amount.toLocaleString("en-US")}`;

interface PriceItemProps {
  label: string;
  amount: number;
}

function PriceItem({ label, amount }: PriceItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-graphite">{label}</span>
      <span className="font-display text-sm font-bold text-obsidian">{formatAed(amount)}</span>
    </div>
  );
}

/**
 * Horizontal luxury showcase card used only on the /fleet listing page —
 * a large hero photograph (55% of the card on desktop) paired with a
 * lean, brochure-style info column: brand/model, a one-line benefit
 * description, a compact spec row (capacity + standard amenities), a
 * refined chauffeur-rate panel, and a two-tier View Details / Get Quote
 * action row. Deliberately a separate component from VehicleCard (used
 * on the vehicle detail page's "related vehicles" grid) and
 * FleetCarouselCard (homepage carousel), so this redesign never touches
 * either of those.
 */
export default function FleetListingCard({ vehicle }: FleetListingCardProps) {
  const cover = vehicle.images?.exterior;

  const priceTiers: { label: string; amount: number }[] = [
    { label: "1 Hour", amount: vehicle.rates.oneHour },
    { label: "Airport Transfer", amount: vehicle.rates.airport },
    { label: "5 Hours", amount: vehicle.rates.fiveHours },
    { label: "10 Hours", amount: vehicle.rates.tenHours },
    { label: "Additional Hour", amount: vehicle.rates.extraHour },
    { label: "Additional City", amount: vehicle.rates.additionalCity },
  ];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.35)] lg:min-h-[380px] lg:flex-row">
      {/* Left — hero photograph, the dominant element of the card */}
      <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-t-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 lg:aspect-auto lg:w-[55%] lg:rounded-l-2xl lg:rounded-tr-none">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <Car className="h-12 w-12 text-white/30" strokeWidth={1} aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-widest text-white/50">
              Image Coming Soon
            </span>
          </div>
        )}
        <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-obsidian shadow-sm">
          Driver Included
        </span>
        {vehicle.badge ? (
          <span className="absolute right-5 top-5 inline-flex items-center rounded-full border border-[#C9A14A]/60 bg-black/55 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#C9A14A] backdrop-blur-sm">
            {vehicle.badge}
          </span>
        ) : null}
      </div>

      {/* Right — lean brochure-style info column */}
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-6 lg:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          {vehicle.brand}
        </p>
        <h3 className="mt-1 font-display text-3xl font-bold uppercase leading-[1.05] text-obsidian sm:text-4xl">
          {vehicle.model}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-snug text-graphite">
          {vehicle.description}
        </p>

        {/* Specifications — capacity and standard amenities only */}
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-neutral-200 py-2.5">
          <SpecItem icon={Users} label={`${vehicle.passengers} Passengers`} />
          <SpecItem icon={Briefcase} label={`${vehicle.luggage} Luggage`} />
          <SpecItem icon={Wifi} label="WiFi" />
          <SpecItem icon={GlassWater} label="Water" />
        </div>

        <p className="mt-1.5 text-[11px] italic leading-snug text-graphite">
          Includes driver, fuel, tolls (Salik) &amp; VIP valet parking — excludes 5% VAT
        </p>

        {/* Chauffeur rates — a refined price panel, not a rental-style
            bordered-tile grid, sitting between specs and the CTAs. */}
        <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-gold/15 bg-linen/60 px-5 py-3 sm:grid-cols-3">
          {priceTiers.map((tier) => (
            <PriceItem key={tier.label} label={tier.label} amount={tier.amount} />
          ))}
        </div>

        {/* Actions — View Details is the primary conversion path (vehicle
            detail page); Get Quote is the secondary action. */}
        <div className="mt-3.5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/quote?vehicle=${vehicle.slug}`}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-neutral-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wide text-obsidian transition-colors duration-200 hover:border-gold-deep/50 hover:bg-neutral-50"
          >
            Get Instant Quote
          </Link>
          <Link
            href={`/fleet/${vehicle.slug}`}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-gold px-4 py-3 text-xs font-bold uppercase tracking-wide text-obsidian shadow-sm transition-colors duration-200 hover:bg-gold-deep"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
