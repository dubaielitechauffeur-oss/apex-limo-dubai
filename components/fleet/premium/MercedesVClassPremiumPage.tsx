import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Briefcase,
  BadgeCheck,
  ChevronDown,
  ArrowLeft,
  Clock,
  Plane,
  Droplet,
  Wifi,
  BatteryCharging,
  Armchair,
  Snowflake,
  EyeOff,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import VehicleCard from "@/components/fleet/VehicleCard";
import VehicleHeroGallery from "@/components/fleet/premium/VehicleHeroGallery";
import BookingCTA from "@/components/home/BookingCTA";
import { getWhatsAppLink } from "@/lib/constants";
import type { FleetVehicle } from "@/data/fleet";
import type { Service } from "@/data/services";
import type { Location } from "@/data/locations";

interface MercedesVClassPremiumPageProps {
  vehicle: FleetVehicle;
  otherVehicles: FleetVehicle[];
  relatedService?: Service;
  relatedLocation?: Location;
}

const formatAed = (amount: number) => `AED ${amount.toLocaleString("en-US")}`;

const AMENITIES: { icon: LucideIcon; label: string }[] = [
  { icon: Droplet, label: "Complimentary Water" },
  { icon: Wifi, label: "Onboard Wi-Fi" },
  { icon: BatteryCharging, label: "Phone Charger" },
  { icon: Armchair, label: "Leather Seating" },
  { icon: Snowflake, label: "Rear Climate Control" },
  { icon: EyeOff, label: "Privacy Glass" },
  { icon: BadgeCheck, label: "Professional Chauffeur" },
  { icon: Handshake, label: "Meet & Greet" },
];

const WHY_CHOOSE_CARDS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Briefcase,
    title: "Corporate Roadshows",
    description:
      "Move an entire team between meetings in one coordinated vehicle, without splitting across multiple cars.",
  },
  {
    icon: Plane,
    title: "Airport Transfers",
    description:
      "Group luggage and passengers handled together, with the same live flight tracking as every Apex transfer.",
  },
  {
    icon: Users,
    title: "Family Travel",
    description:
      "Sliding doors, individual reading lights, and an onboard screen make longer family trips genuinely comfortable.",
  },
  {
    icon: BadgeCheck,
    title: "VIP Group Transport",
    description: "A discreet, coordinated way to move a delegation or wedding party as a single unit.",
  },
];

export default function MercedesVClassPremiumPage({
  vehicle,
  otherVehicles,
  relatedService,
  relatedLocation,
}: MercedesVClassPremiumPageProps) {
  const whatsappMessage = `Hello Apex Limo, I'd like to book the ${vehicle.name}.`;
  const images = vehicle.images!;
  const longDescriptionParagraphs = vehicle.longDescription.split("\n\n");

  const pricingPackages = [
    {
      title: "Airport Transfer",
      icon: Plane,
      price: vehicle.rates.airport,
      unit: "one way",
      description: "Meet-and-greet pickup or drop-off at DXB or DWC, with live flight tracking included.",
    },
    {
      title: "Half Day",
      icon: Clock,
      price: vehicle.rates.fiveHours,
      unit: "5 hours",
      description: "Ideal for a morning of meetings, a shopping trip, or a half-day city itinerary.",
    },
    {
      title: "Full Day",
      icon: Clock,
      price: vehicle.rates.tenHours,
      unit: "10 hours",
      description: "The vehicle and chauffeur are yours for the day — unlimited stops, one fixed price.",
    },
  ];

  return (
    <div>
      {/* Hero zone */}
      <Section tone="obsidian" padding="sm" separator={false}>
        <Container>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-smoke transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to Fleet
          </Link>

          <div className="mt-8 grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <VehicleHeroGallery images={images} vehicleName={vehicle.name} />

            <div>
              <span className="label-eyebrow">{vehicle.category}</span>
              <h1 className="mt-4 font-display text-3xl text-heading sm:text-5xl">{vehicle.name}</h1>
              <p className="mt-2 text-sm italic text-gold/90 sm:text-base">{vehicle.tagline}</p>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
                {vehicle.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-6 border-y border-gold/15 py-4 text-sm text-smoke">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  {vehicle.passengers} passengers
                </span>
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  {vehicle.luggage} bags
                </span>
                <span className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  Chauffeur Included
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <CTAButton href={`/booking?vehicle=${vehicle.slug}`}>Book Now</CTAButton>
                <CTAButton href={`/quote?vehicle=${vehicle.slug}`} variant="outline">
                  Get Quote
                </CTAButton>
                <CTAButton href={getWhatsAppLink(whatsappMessage)} variant="outline" external>
                  WhatsApp Us
                </CTAButton>
              </div>

              {relatedService || relatedLocation ? (
                <p className="mt-6 text-sm text-smoke">
                  {relatedService ? (
                    <>
                      Popular for{" "}
                      <Link
                        href={`/services/${relatedService.slug}`}
                        className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
                      >
                        {relatedService.name}
                      </Link>
                    </>
                  ) : null}
                  {relatedService && relatedLocation ? " in " : null}
                  {relatedLocation ? (
                    <Link
                      href={`/locations/${relatedLocation.slug}`}
                      className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
                    >
                      {relatedLocation.name}
                    </Link>
                  ) : null}
                  .
                </p>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      {/* Pricing packages */}
      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="Pricing Packages"
            title={`Book the ${vehicle.name}`}
            subtitle="Transparent, fixed pricing — no surge charges, no hidden fees."
            tone="light"
          />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {pricingPackages.map((pkg) => (
              <div
                key={pkg.title}
                className="flex flex-col rounded-2xl border border-gold/15 bg-ivory p-8 shadow-[0_16px_35px_-26px_rgba(10,10,10,0.3)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-20px_rgba(10,10,10,0.35)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                  <pkg.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-display text-xl text-obsidian">{pkg.title}</h3>
                <p className="mt-3 font-display text-3xl text-gold-deep">
                  {formatAed(pkg.price)}
                  <span className="ml-2 text-sm font-body font-normal text-graphite">/ {pkg.unit}</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{pkg.description}</p>
                <CTAButton href={`/booking?vehicle=${vehicle.slug}`} className="mt-6 w-full justify-center">
                  Book Now
                </CTAButton>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* About this vehicle */}
      <Section tone="linen">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="About This Vehicle"
              title={`The ${vehicle.name}, in Detail`}
              align="left"
              tone="light"
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-graphite sm:text-base">
              {longDescriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Specs */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Category", value: vehicle.category },
              { label: "Passengers", value: `${vehicle.passengers}` },
              { label: "Luggage", value: `${vehicle.luggage} bags` },
              { label: "Ideal For", value: vehicle.idealFor },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gold/15 bg-ivory p-5">
                <p className="text-[10px] uppercase tracking-wide text-graphite">{stat.label}</p>
                <p className="mt-2 font-display text-lg text-gold-deep">{stat.value}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Amenities — premium icon cards */}
      <Section tone="ivory">
        <Container>
          <SectionHeading eyebrow="Onboard" title="Amenities" align="left" tone="light" />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {AMENITIES.map((amenity) => (
              <div
                key={amenity.label}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gold/15 bg-ivory p-6 text-center transition-shadow duration-300 hover:shadow-[0_16px_35px_-26px_rgba(10,10,10,0.3)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                  <amenity.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
                </span>
                <p className="text-sm font-medium text-obsidian">{amenity.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Why choose this vehicle — 4 premium cards */}
      <Section tone="linen">
        <Container>
          <SectionHeading
            eyebrow="Why This Vehicle"
            title={`Why Choose the ${vehicle.name}`}
            tone="light"
          />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col items-start rounded-2xl border border-gold/15 bg-ivory p-7 shadow-[0_16px_35px_-26px_rgba(10,10,10,0.3)]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
                  <card.icon className="h-6 w-6 text-gold-deep" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-display text-lg text-obsidian">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{card.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Gallery */}
      <Section tone="ivory">
        <Container>
          <SectionHeading eyebrow="Gallery" title={`${vehicle.name} Gallery`} tone="light" />
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {(["exterior", "interior", "detail"] as const).map((key) => {
              const image = images[key];
              return (
                <div
                  key={key}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_16px_35px_-26px_rgba(10,10,10,0.3)]"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* FAQ + related vehicles zone */}
      <Section tone="linen">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="Common Questions"
              title={`${vehicle.name} FAQs`}
              align="left"
              tone="light"
            />
            <div className="mt-8 divide-y divide-obsidian/10 border-y border-obsidian/10">
              {vehicle.faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-display text-lg text-obsidian marker:content-none [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-gold-deep transition-transform duration-200 group-open:rotate-180"
                      strokeWidth={1.5}
                    />
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-graphite sm:text-base">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Related vehicles — existing functionality, unchanged */}
          <div className="mt-24">
            <SectionHeading eyebrow="Explore More" title="Other Vehicles in the Fleet" tone="light" />
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {otherVehicles.map((related) => (
                <VehicleCard key={related.slug} vehicle={related} tone="light" />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
