import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Users,
  Briefcase,
  Star,
  ChevronDown,
  ArrowLeft,
  Crown,
  Compass,
  Wifi,
  GlassWater,
  Snowflake,
  EyeOff,
  Lightbulb,
  MonitorPlay,
  Sun,
  DoorOpen,
  Gauge,
  Volume2,
  Baby,
  Gem,
  Shirt,
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import Card from "@/components/shared/Card";
import VehicleGallery from "@/components/fleet/VehicleGallery";
import VehicleCard from "@/components/fleet/VehicleCard";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, faqJsonLd, organizationId, breadcrumbJsonLd } from "@/lib/seo";
import { SITE, getWhatsAppLink } from "@/lib/constants";
import { FLEET } from "@/data/fleet";
import { SERVICES } from "@/data/services";
import { LOCATIONS } from "@/data/locations";
import { VEHICLE_CROSS_LINKS } from "@/lib/cross-links";

interface PageProps {
  params: Promise<{ vehicle: string }>;
}

export async function generateStaticParams() {
  return FLEET.map((vehicle) => ({ vehicle: vehicle.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vehicle: slug } = await params;
  const vehicle = FLEET.find((v) => v.slug === slug);

  if (!vehicle) {
    return buildMetadata({
      title: "Vehicle Not Found",
      description: "This vehicle could not be found in the Apex Limo fleet.",
      path: `/fleet/${slug}`,
    });
  }

  return buildMetadata({
    title: `${vehicle.name} | Chauffeur-Driven ${vehicle.category} in Dubai`,
    description: `Book the ${vehicle.name} with a professional chauffeur in Dubai. ${vehicle.description}`,
    path: `/fleet/${vehicle.slug}`,
  });
}

/** Car + FAQPage JSON-LD for this specific vehicle. */
function vehicleJsonLd(vehicle: (typeof FLEET)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.name,
    description: vehicle.longDescription,
    vehicleSeatingCapacity: vehicle.passengers,
    url: `${SITE.url}/fleet/${vehicle.slug}`,
    provider: {
      "@type": "LocalBusiness",
      "additionalType": "https://schema.org/LimousineService",
      "@id": organizationId(),
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: {
      "@type": "City",
      name: "Dubai",
    },
  };
}

const formatAed = (amount: number) => `AED ${amount.toLocaleString("en-US")}`;

/** Best-effort keyword match from a plain-text feature/amenity string to a
 *  representative icon, purely presentational — the underlying
 *  `vehicle.features` data is untouched. */
function amenityIcon(feature: string): LucideIcon {
  const f = feature.toLowerCase();
  if (f.includes("wifi") || f.includes("wi-fi")) return Wifi;
  if (f.includes("child seat")) return Baby;
  if (f.includes("diamond")) return Gem;
  if (f.includes("starlight") || f.includes("headliner")) return Sparkles;
  if (f.includes("attire") || f.includes("red carpet")) return Shirt;
  if (f.includes("climate") || f.includes("insulation")) return Snowflake;
  if (f.includes("privacy") || f.includes("curtain") || f.includes("tinted") || f.includes("glass"))
    return EyeOff;
  if (f.includes("light")) return Lightbulb;
  if (f.includes("entertainment") || f.includes("screen")) return MonitorPlay;
  if (f.includes("roof") || f.includes("sky lounge")) return Sun;
  if (f.includes("door")) return DoorOpen;
  if (f.includes("suspension") || f.includes("ride height") || f.includes("elevated")) return Gauge;
  if (f.includes("sound") || f.includes("audio")) return Volume2;
  if (f.includes("luggage")) return Briefcase;
  if (f.includes("water") || f.includes("champagne") || f.includes("amenities")) return GlassWater;
  if (
    f.includes("seat") ||
    f.includes("leg") ||
    f.includes("lounge") ||
    f.includes("captain") ||
    f.includes("bench") ||
    f.includes("ottoman")
  )
    return Sparkles;
  if (f.includes("leather") || f.includes("handcrafted") || f.includes("quilted")) return Sparkles;
  return CheckCircle2;
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { vehicle: slug } = await params;
  const vehicle = FLEET.find((v) => v.slug === slug);

  if (!vehicle) {
    notFound();
  }

  // "Similar" prioritizes same-category vehicles first, then fills any
  // remaining slots from the rest of the fleet — still existing fleet data,
  // just a more meaningful match than an arbitrary slice.
  const sameCategory = FLEET.filter((v) => v.slug !== vehicle.slug && v.category === vehicle.category);
  const otherCategory = FLEET.filter((v) => v.slug !== vehicle.slug && v.category !== vehicle.category);
  const similarVehicles = [...sameCategory, ...otherCategory].slice(0, 3);

  const whatsappMessage = `Hello Apex Limo, I'd like to book the ${vehicle.name}.`;

  const crossLinks = VEHICLE_CROSS_LINKS[vehicle.slug];
  const relatedService = crossLinks
    ? SERVICES.find((s) => s.slug === crossLinks.serviceSlug)
    : undefined;
  const relatedLocation = crossLinks
    ? LOCATIONS.find((l) => l.slug === crossLinks.locationSlug)
    : undefined;

  const quickFacts = [
    { label: "Category", value: vehicle.category, icon: Crown },
    { label: "Passengers", value: `${vehicle.passengers} Passengers`, icon: Users },
    { label: "Luggage", value: `${vehicle.luggage} Luggage`, icon: Briefcase },
    { label: "Best For", value: vehicle.idealFor, icon: Compass },
  ];

  const priceTiers = [
    { label: "1 Hour", amount: vehicle.rates.oneHour },
    { label: "Airport Transfer", amount: vehicle.rates.airport },
    { label: "5 Hours", amount: vehicle.rates.fiveHours },
    { label: "10 Hours", amount: vehicle.rates.tenHours },
    { label: "Additional Hour", amount: vehicle.rates.extraHour },
    { label: "Additional City", amount: vehicle.rates.additionalCity },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd(vehicle)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(vehicle.faqs)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Fleet", path: "/fleet" },
              { name: vehicle.name, path: `/fleet/${vehicle.slug}` },
            ])
          ),
        }}
      />

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
          <VehicleGallery vehicle={vehicle} priority showThumbnails />

          <div>
            <span className="label-eyebrow">{vehicle.category}</span>
            <h1 className="mt-4 font-display text-3xl text-heading sm:text-5xl">
              {vehicle.name}
            </h1>
            <p className="mt-2 text-sm italic text-gold/90 sm:text-base">
              {vehicle.tagline}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
              {vehicle.description}
            </p>

            <div className="mt-6 flex items-center gap-6 border-y border-gold/15 py-4 text-sm text-smoke">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {vehicle.passengers} passengers
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {vehicle.luggage} bags
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

      {/* Body zone */}
      <Section tone="ivory">
      <Container>
        {/* Quick Facts — compact, immediately below the hero */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickFacts.map((fact) => (
            <Card key={fact.label} tone="light" className="p-5">
              <fact.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
              <p className="mt-3 text-[10px] uppercase tracking-wide text-graphite">
                {fact.label}
              </p>
              <p className="mt-1 font-display text-lg text-obsidian">{fact.value}</p>
            </Card>
          ))}
        </div>

        {/* Pricing — surfaced directly after Quick Facts for visibility */}
        <div className="mt-14">
          <h2 className="font-display text-2xl text-obsidian sm:text-3xl">
            {vehicle.name} Rates
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-graphite sm:text-base">
            Transparent chauffeur rates, fixed once your booking is confirmed.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-gold/15 bg-linen/60 px-6 py-6 sm:grid-cols-3">
            {priceTiers.map((tier) => (
              <div key={tier.label} className="flex flex-col gap-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-graphite">
                  {tier.label}
                </span>
                <span className="font-display text-lg font-bold text-gold-deep">
                  {formatAed(tier.amount)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs italic text-graphite">
            Includes professional chauffeur, fuel, tolls (Salik) &amp; VIP valet parking — excludes 5% VAT.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CTAButton href={`/booking?vehicle=${vehicle.slug}`}>Book Now</CTAButton>
            <CTAButton href={`/quote?vehicle=${vehicle.slug}`} variant="outline" tone="light">
              Get Quote
            </CTAButton>
          </div>
        </div>

        {/* About this vehicle */}
        <div className="mt-20 max-w-3xl">
          <h2 className="font-display text-2xl text-obsidian sm:text-3xl">
            About the {vehicle.name}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-graphite sm:text-base">
            {vehicle.longDescription}
          </p>
        </div>

        {/* Features */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Onboard"
            title="Features & Amenities"
            align="left"
            tone="light"
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.features.map((feature) => {
              const Icon = amenityIcon(feature);
              return (
                <Card key={feature} tone="light" className="flex items-start gap-3 p-4">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                  <span className="text-sm text-graphite">{feature}</span>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Why choose this vehicle */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Why This Vehicle"
            title={`Why Choose the ${vehicle.name}`}
            align="left"
            tone="light"
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {vehicle.whyChoose.map((reason) => (
              <Card key={reason} tone="light" className="flex items-start gap-3 p-5">
                <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-graphite">{reason}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
      </Section>

      {/* FAQ + related vehicles zone */}
      <Section tone="linen">
      <Container>
        {/* FAQ — native <details>/<summary> keeps this interactive without
            requiring a client component, so the page stays fully server-rendered. */}
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
                <p className="mt-4 text-sm leading-relaxed text-graphite sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Similar vehicles */}
        <div className="mt-24">
          <SectionHeading
            eyebrow="Explore More"
            title="Explore Similar Vehicles"
            tone="light"
          />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {similarVehicles.map((related) => (
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
