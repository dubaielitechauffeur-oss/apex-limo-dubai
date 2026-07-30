import Image from "next/image";
import Link from "next/link";
import { Car, Clock, Plane, type LucideIcon } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";
import { getWhatsAppLink } from "@/lib/constants";

interface FleetCarouselCardProps {
  vehicle: FleetVehicle;
  /** When true, the secondary action is an "Enquire on WhatsApp" CTA
   *  instead of the default "Contact Us" link — used when this card is
   *  reused on the vehicle detail page's related-vehicles grid. Omitted
   *  (default false) on the homepage carousel, which keeps its existing
   *  Contact Us behavior unchanged. */
  whatsapp?: boolean;
  /** "light" (default) — the original ivory card, used on the homepage
   *  carousel. "dark" — a luxury-black variant for the vehicle detail
   *  page's related-vehicles grid. Same structure/content either way. */
  tone?: "light" | "dark";
}

const formatAed = (amount: number) => `AED ${amount.toLocaleString("en-US")}`;

/**
 * Compact vertical card for the homepage fleet carousel — image with a
 * gold brand badge, black brand bar, gold model bar, a four-tile rate
 * row (10h / 5h / 1h / airport), and the View Car / Contact Us actions.
 * Rates come from vehicle.rates in data/fleet.ts (currently placeholder
 * sample figures — see the VehicleRates doc comment there).
 */
export default function FleetCarouselCard({ vehicle, whatsapp = false, tone = "light" }: FleetCarouselCardProps) {
  const isDark = tone === "dark";
  const cover = vehicle.images?.[0];
  const rateTiles: { icon: LucideIcon; label: string; amount: number }[] = [
    { icon: Clock, label: "10 Hours", amount: vehicle.rates.tenHours },
    { icon: Clock, label: "5 Hours", amount: vehicle.rates.fiveHours },
    { icon: Clock, label: "1 Hour", amount: vehicle.rates.oneHour },
    { icon: Plane, label: "Airport", amount: vehicle.rates.airport },
  ];

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-gold/15 shadow-[0_16px_35px_-22px_rgba(10,10,10,0.35)] transition-shadow duration-300 hover:shadow-[0_22px_45px_-18px_rgba(10,10,10,0.4)] ${
        isDark ? "bg-charcoal" : "bg-ivory"
      }`}
    >
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
              <Icon className={`h-4 w-4 ${isDark ? "text-gold" : "text-gold-deep"}`} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? "text-smoke" : "text-obsidian/75"}`}>
              {label}
            </span>
            <span className={`text-xs font-bold ${isDark ? "text-heading" : "text-obsidian"}`}>
              {formatAed(amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-auto grid grid-cols-2 gap-3 px-4 pb-5">
        <Link
          href={`/fleet/${vehicle.slug}`}
          className="inline-flex items-center justify-center rounded-full bg-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:bg-gold-deep"
        >
          View Car
        </Link>
        {whatsapp ? (
          <a
            href={getWhatsAppLink(
              `Hello Apex Limo, I would like to enquire about the ${vehicle.name}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-[#1EBE5A]"
          >
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-white">
              <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.72-1.865A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818c-1.99 0-3.86-.55-5.457-1.507l-.392-.232-4.58 1.107 1.128-4.462-.256-.406A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818zm5.965-8.14c-.327-.164-1.936-.955-2.237-1.064-.3-.109-.518-.164-.737.164-.218.327-.845 1.064-1.036 1.282-.19.218-.382.246-.709.082-.327-.164-1.38-.508-2.629-1.62-.972-.867-1.628-1.937-1.819-2.264-.19-.327-.02-.504.144-.667.148-.147.327-.382.49-.573.164-.19.218-.327.327-.545.109-.218.055-.41-.027-.573-.082-.164-.737-1.777-1.01-2.434-.266-.64-.537-.553-.737-.563l-.628-.011c-.218 0-.573.082-.873.41-.3.327-1.145 1.12-1.145 2.73 0 1.61 1.172 3.165 1.336 3.383.164.218 2.308 3.524 5.593 4.942.782.338 1.392.54 1.868.69.785.25 1.5.215 2.065.13.63-.094 1.936-.79 2.21-1.554.273-.764.273-1.418.19-1.555-.081-.136-.3-.218-.627-.382z" />
            </svg>
            WhatsApp
          </a>
        ) : (
          <Link
            href="/contact"
            className={
              isDark
                ? "inline-flex items-center justify-center rounded-full border border-ivory/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory transition-colors duration-200 hover:border-ivory hover:bg-ivory hover:text-obsidian"
                : "inline-flex items-center justify-center rounded-full border border-obsidian/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:border-obsidian hover:bg-obsidian hover:text-ivory"
            }
          >
            Contact Us
          </Link>
        )}
      </div>
    </article>
  );
}
