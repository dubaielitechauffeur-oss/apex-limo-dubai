import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Car, Users, Briefcase, Wifi, GlassWater, type LucideIcon } from "lucide-react";
import type { PlainFleetVehicle } from "@/data/fleet";
import { getWhatsAppLink } from "@/lib/constants";

interface FleetListingCardProps {
  vehicle: PlainFleetVehicle;
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

interface PriceItemProps {
  label: string;
  priceOnRequestLabel: string;
}

/** Shows the package name only — no fabricated rate. Confirmed pricing is
 *  quoted per-trip on WhatsApp/quote request (see `disclaimer` copy below). */
function PriceItem({ label, priceOnRequestLabel }: PriceItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-graphite">{label}</span>
      {/* text-obsidian (not gold-deep) — gold-deep on this light linen
          panel measures ~3.5:1, below the 4.5:1 WCAG AA minimum for this
          text size. Obsidian gives ~19:1 and reads as a bolder price
          callout besides. */}
      <span className="font-display text-sm font-bold text-obsidian">{priceOnRequestLabel}</span>
    </div>
  );
}

/**
 * Horizontal luxury showcase card used only on the /fleet listing page —
 * a large hero photograph (55% of the card on desktop) paired with a
 * lean, brochure-style info column: brand/model, a one-line benefit
 * description, a compact spec row (capacity + standard amenities), a
 * refined chauffeur-rate panel, and a two-tier View Details / Enquire on
 * WhatsApp action row. Deliberately a separate component from
 * FleetCarouselCard (homepage carousel and the vehicle detail page's
 * "related vehicles" grid), so this redesign never touches that one.
 */
export default async function FleetListingCard({ vehicle }: FleetListingCardProps) {
  const t = await getTranslations("fleet.listingCard");
  const tSummary = await getTranslations("fleet.summaryCard");
  const cover = vehicle.images?.[0];

  const priceTierLabels: string[] = [
    t("twoHours"),
    t("airportTransfer"),
    t("fiveHours"),
    t("tenHours"),
    t("additionalHour"),
    t("additionalCity"),
  ];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.35)] lg:min-h-[380px] lg:flex-row">
      {/* Left — hero photograph, the dominant element of the card */}
      <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-t-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 lg:aspect-auto lg:w-[55%] lg:rounded-s-2xl lg:rounded-se-none">
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
              {t("imageComingSoon")}
            </span>
          </div>
        )}
        <span className="absolute start-5 top-5 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-obsidian shadow-sm">
          {t("driverIncluded")}
        </span>
        {vehicle.badge ? (
          <span className="absolute end-5 top-5 inline-flex items-center rounded-full border border-gold/60 bg-black/55 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gold backdrop-blur-sm">
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
          <SpecItem icon={Users} label={`${vehicle.passengers} ${tSummary("passengers")}`} />
          <SpecItem icon={Briefcase} label={`${vehicle.luggage} ${tSummary("luggage")}`} />
          <SpecItem icon={Wifi} label={t("wifi")} />
          <SpecItem icon={GlassWater} label={t("water")} />
        </div>

        <p className="mt-1.5 text-[11px] italic leading-snug text-graphite">
          {t("includesNote")}
        </p>

        {/* Chauffeur rates — a refined price panel, not a rental-style
            bordered-tile grid, sitting between specs and the CTAs. */}
        <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-gold/15 bg-linen/60 px-5 py-3 sm:grid-cols-3">
          {priceTierLabels.map((label) => (
            <PriceItem key={label} label={label} priceOnRequestLabel={t("priceOnRequest")} />
          ))}
        </div>

        <p className="mt-2 text-[10px] leading-snug text-graphite/70">
          {t("disclaimer")}
        </p>

        {/* Actions — View Details is the primary conversion path (vehicle
            detail page); Enquire on WhatsApp is the secondary action. */}
        <div className="mt-3.5 flex flex-col gap-3 sm:flex-row">
          <a
            href={getWhatsAppLink(t("whatsappMessage", { name: vehicle.name }))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#25D366] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-colors duration-200 hover:bg-[#1EBE5A]"
          >
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-4 w-4 shrink-0 fill-white">
              <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.72-1.865A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818c-1.99 0-3.86-.55-5.457-1.507l-.392-.232-4.58 1.107 1.128-4.462-.256-.406A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818zm5.965-8.14c-.327-.164-1.936-.955-2.237-1.064-.3-.109-.518-.164-.737.164-.218.327-.845 1.064-1.036 1.282-.19.218-.382.246-.709.082-.327-.164-1.38-.508-2.629-1.62-.972-.867-1.628-1.937-1.819-2.264-.19-.327-.02-.504.144-.667.148-.147.327-.382.49-.573.164-.19.218-.327.327-.545.109-.218.055-.41-.027-.573-.082-.164-.737-1.777-1.01-2.434-.266-.64-.537-.553-.737-.563l-.628-.011c-.218 0-.573.082-.873.41-.3.327-1.145 1.12-1.145 2.73 0 1.61 1.172 3.165 1.336 3.383.164.218 2.308 3.524 5.593 4.942.782.338 1.392.54 1.868.69.785.25 1.5.215 2.065.13.63-.094 1.936-.79 2.21-1.554.273-.764.273-1.418.19-1.555-.081-.136-.3-.218-.627-.382z" />
            </svg>
            {t("enquireWhatsapp")}
          </a>
          <Link
            href={`/fleet/${vehicle.slug}`}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-gold px-4 py-3 text-xs font-bold uppercase tracking-wide text-obsidian shadow-sm transition-colors duration-200 hover:bg-gold-deep"
          >
            {t("viewDetails")}
          </Link>
        </div>
      </div>
    </article>
  );
}
