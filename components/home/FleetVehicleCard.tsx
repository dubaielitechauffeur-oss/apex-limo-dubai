import Image from "next/image";
import {
  Car,
  Users,
  Briefcase,
  UserCheck,
  Wifi,
  GlassWater,
  BatteryCharging,
  Armchair,
  Snowflake,
  EyeOff,
  Tv,
  Sun,
  Gauge,
  Lightbulb,
  Sparkles,
  MessageCircle,
  Mail,
  type LucideIcon,
} from "lucide-react";
import CTAButton from "@/components/shared/CTAButton";
import { SITE, getWhatsAppLink } from "@/lib/constants";
import type { FleetVehicle } from "@/data/fleet";

interface FleetVehicleCardProps {
  vehicle: FleetVehicle;
}

const AMENITY_ICON_RULES: [RegExp, LucideIcon][] = [
  [/chauffeur/i, UserCheck],
  [/wi-?fi/i, Wifi],
  [/water|champagne|welcome amenities/i, GlassWater],
  [/charg/i, BatteryCharging],
  [/leather|seat|quilted/i, Armchair],
  [/climate|air suspension/i, Snowflake],
  [/privacy|tint|curtain/i, EyeOff],
  [/luggage|bag/i, Briefcase],
  [/entertainment|screen|sound/i, Tv],
  [/light/i, Lightbulb],
  [/roof|headliner/i, Sun],
  [/suspension|ride/i, Gauge],
];

function amenityIcon(text: string): LucideIcon {
  const match = AMENITY_ICON_RULES.find(([pattern]) => pattern.test(text));
  return match ? match[1] : Sparkles;
}

/**
 * Rich, horizontal vehicle card for the homepage Fleet showcase —
 * photograph on the left, details + amenities + action row on the right.
 * Distinct from components/fleet/VehicleCard.tsx (used on the /fleet
 * listing page), which keeps its existing compact layout unchanged.
 */
export default function FleetVehicleCard({ vehicle }: FleetVehicleCardProps) {
  const amenities = ["Professional Chauffeur Included", ...vehicle.features].slice(0, 7);
  const coverImage = vehicle.images?.exterior;
  const whatsappMessage = `Hello Apex Limo, I'd like to enquire about the ${vehicle.name}.`;
  const emailHref = `mailto:${SITE.email}?subject=${encodeURIComponent(
    `Enquiry: ${vehicle.name}`
  )}&body=${encodeURIComponent(
    `Hello Apex Limo,\n\nI'd like to enquire about booking the ${vehicle.name}.\n\n`
  )}`;

  return (
    <article className="grid grid-cols-1 overflow-hidden rounded-2xl border border-gold/15 bg-ivory shadow-[0_20px_45px_-25px_rgba(10,10,10,0.35)] transition-shadow duration-300 hover:shadow-[0_28px_55px_-20px_rgba(10,10,10,0.4)] lg:grid-cols-[0.85fr_1.15fr]">
      {/* Image */}
      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[320px]">
        <div className="absolute inset-3 overflow-hidden rounded-xl bg-gradient-to-br from-charcoal via-obsidian to-charcoal">
          {coverImage ? (
            <Image
              src={coverImage.src}
              alt={coverImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 45vw, 420px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Car className="h-16 w-16 text-gold/60" strokeWidth={1} aria-hidden="true" />
            </div>
          )}
        </div>

        <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-obsidian shadow-sm">
          Chauffeur Included
        </span>

        {vehicle.isPlaceholder ? (
          <span className="absolute right-6 top-6 inline-flex items-center rounded-full border border-gold/50 bg-obsidian/80 px-3 py-1 text-[10px] uppercase tracking-wide text-gold">
            Preview
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-7 sm:p-8">
        <div>
          <span className="label-eyebrow text-[11px] text-gold-deep">{vehicle.category}</span>
          <h3 className="mt-2 font-display text-2xl text-obsidian sm:text-3xl">{vehicle.name}</h3>
          <p className="mt-2 text-sm italic text-graphite">{vehicle.tagline}</p>

          <div className="route-line-sm my-5 bg-gold-deep" />

          <p className="text-sm leading-relaxed text-graphite">{vehicle.description}</p>

          {/* Capacity / availability strip — built from existing vehicle data */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-graphite">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
              {vehicle.passengers} passengers
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
              {vehicle.luggage} bags
            </span>
            <span className="inline-flex items-center rounded-full border border-gold/30 px-2.5 py-1 text-[10px] uppercase tracking-wide text-gold-deep">
              Available to Book
            </span>
          </div>

          {/* Amenities */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {amenities.map((amenity) => {
              const Icon = amenityIcon(amenity);
              return (
                <div
                  key={amenity}
                  className="flex items-center gap-2 border border-gold/15 bg-ivory-off/60 px-2.5 py-2 text-[11px] leading-tight text-graphite"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                  {amenity}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={getWhatsAppLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 border border-gold/60 bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:border-gold hover:bg-gold/10 sm:flex-none"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            WhatsApp
          </a>
          <a
            href={emailHref}
            className="inline-flex flex-1 items-center justify-center gap-2 bg-obsidian px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ivory transition-colors duration-200 hover:bg-charcoal sm:flex-none"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            Email
          </a>
          <CTAButton href={`/fleet/${vehicle.slug}`} className="flex-1 sm:flex-none">
            Vehicle Details
          </CTAButton>
        </div>
      </div>
    </article>
  );
}
