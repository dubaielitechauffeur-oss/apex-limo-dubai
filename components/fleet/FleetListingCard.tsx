import Image from "next/image";
import Link from "next/link";
import { Car, Clock, Plane, User, Building2, Info, type LucideIcon } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";
import { getWhatsAppLink } from "@/lib/constants";

interface FleetListingCardProps {
  vehicle: FleetVehicle;
}

const formatAed = (amount: number) => `AED ${amount.toLocaleString("en-US")}`;

/**
 * Horizontal rate-card layout used only on the /fleet listing page —
 * image left, brand/model/includes header, description, a 6-tile pricing
 * grid, and a two-tier View Details / Get Quote action row. Deliberately a
 * separate component from VehicleCard (used on the vehicle detail page's
 * "related vehicles" grid) and FleetCarouselCard (homepage carousel), so
 * this redesign never touches either of those.
 */
export default function FleetListingCard({ vehicle }: FleetListingCardProps) {
  const cover = vehicle.images?.exterior;
  const whatsappHref = getWhatsAppLink(
    `Hello Apex Limo, I'd like to book the ${vehicle.name}.`,
  );

  const priceTiles: { icon: LucideIcon; label: string; amount: number }[] = [
    { icon: Clock, label: "10 Hours", amount: vehicle.rates.tenHours },
    { icon: Clock, label: "5 Hours", amount: vehicle.rates.fiveHours },
    { icon: Clock, label: "1 Hour", amount: vehicle.rates.oneHour },
    { icon: Plane, label: "Airport", amount: vehicle.rates.airport },
    { icon: User, label: "Ext. Hours", amount: vehicle.rates.extraHour },
    { icon: Building2, label: "Addit. City", amount: vehicle.rates.additionalCity },
  ];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] lg:flex-row">
      {/* Left — single vehicle image, given slightly more width than the
          info column so photography carries more of the card. */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 lg:aspect-auto lg:w-[45%] lg:rounded-l-2xl lg:rounded-tr-none">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
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

      {/* Right — vehicle info */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">
              {vehicle.brand}
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold uppercase leading-tight text-obsidian sm:text-3xl">
              {vehicle.model}
            </h3>
          </div>

          <div className="flex items-start gap-3">
            <p className="max-w-[220px] text-left text-[11px] italic leading-relaxed text-graphite sm:text-right">
              <span className="block">
                Includes: Car with driver, fuel, tolls (Salik), VIP Valet parking
              </span>
              <span className="mt-1 block">Excludes: 5% VAT</span>
            </p>
            <div className="flex shrink-0 gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp us about the ${vehicle.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-obsidian text-white transition-colors duration-200 hover:bg-obsidian/80"
              >
                <svg viewBox="0 0 32 32" aria-hidden="true" className="h-4 w-4 fill-white">
                  <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.72-1.865A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818c-1.99 0-3.86-.55-5.457-1.507l-.392-.232-4.58 1.107 1.128-4.462-.256-.406A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818zm5.965-8.14c-.327-.164-1.936-.955-2.237-1.064-.3-.109-.518-.164-.737.164-.218.327-.845 1.064-1.036 1.282-.19.218-.382.246-.709.082-.327-.164-1.38-.508-2.629-1.62-.972-.867-1.628-1.937-1.819-2.264-.19-.327-.02-.504.144-.667.148-.147.327-.382.49-.573.164-.19.218-.327.327-.545.109-.218.055-.41-.027-.573-.082-.164-.737-1.777-1.01-2.434-.266-.64-.537-.553-.737-.563l-.628-.011c-.218 0-.573.082-.873.41-.3.327-1.145 1.12-1.145 2.73 0 1.61 1.172 3.165 1.336 3.383.164.218 2.308 3.524 5.593 4.942.782.338 1.392.54 1.868.69.785.25 1.5.215 2.065.13.63-.094 1.936-.79 2.21-1.554.273-.764.273-1.418.19-1.555-.081-.136-.3-.218-.627-.382z" />
                </svg>
              </a>
              <Link
                href={`/fleet/${vehicle.slug}`}
                aria-label={`More information about the ${vehicle.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-obsidian text-white transition-colors duration-200 hover:bg-obsidian/80"
              >
                <Info className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-neutral-200" />

        <p className="mt-5 text-sm leading-relaxed text-graphite">{vehicle.description}</p>

        {/* Pricing tiers */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {priceTiles.map(({ icon: Icon, label, amount }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 px-2 py-4 text-center"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold">
                <Icon className="h-4 w-4 text-obsidian" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-xs font-bold leading-tight text-obsidian">{label}</span>
              <span className="text-xs font-bold leading-tight text-obsidian">
                {formatAed(amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Actions — View Details is the primary conversion path (vehicle
            detail page); Get Quote is the secondary action. */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/quote?vehicle=${vehicle.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:bg-neutral-100 sm:flex-1"
          >
            Get Quote
          </Link>
          <Link
            href={`/fleet/${vehicle.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:bg-gold-deep sm:flex-[2]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
