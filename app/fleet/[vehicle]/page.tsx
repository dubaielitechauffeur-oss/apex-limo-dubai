import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Users,
  Briefcase,
  Star,
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
import VehicleHeroGallery from "@/components/fleet/VehicleHeroGallery";
import VehicleFaqSection from "@/components/fleet/VehicleFaqSection";
import FleetCarouselCard from "@/components/home/FleetCarouselCard";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, faqJsonLd, organizationId, breadcrumbJsonLd } from "@/lib/seo";
import { SITE, RATING, getWhatsAppLink } from "@/lib/constants";
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
  const filledStars = Math.round(parseFloat(RATING));

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

      {/* Hero zone — single premium column: breadcrumb, gallery, title,
          then the existing description/meta/CTA content, unchanged. */}
      <Section tone="obsidian" padding="sm" separator={false}>
      <Container>
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-wide text-smoke">
            <Link href="/" className="transition-colors hover:text-gold">
              Home
            </Link>
            <span className="text-smoke/40">/</span>
            <Link href="/fleet" className="transition-colors hover:text-gold">
              Fleet
            </Link>
            <span className="text-smoke/40">/</span>
            <span className="text-gold">{vehicle.name}</span>
          </nav>

          {/* Mobile-only info block — shows title/category/passengers before
              the gallery. Desktop keeps gallery-then-title (unchanged) via
              the hidden lg:block title block further down. */}
          <div className="mt-6 lg:hidden">
            <h1 className="font-display text-3xl text-heading">
              {vehicle.name} <span className="text-smoke">with Chauffeur in Dubai</span>
            </h1>
            <p className="mt-2 text-base italic text-gold/90">{vehicle.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-smoke">
              <span>{vehicle.category}</span>
              <span className="text-gold">&bull;</span>
              <span>Up to {vehicle.passengers} Passengers</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5" role="img" aria-label={`${RATING} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < filledStars ? "fill-gold text-gold" : "fill-transparent text-gold/30"}`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-sm text-smoke">{RATING} Rating</span>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <VehicleHeroGallery vehicle={vehicle} />
          </div>

          {/* Desktop-only title block — hidden on mobile since the block
              above already covers title/category/passengers there. */}
          <div className="mt-8 sm:mt-10 hidden lg:block">
            <span className="label-eyebrow">{vehicle.category}</span>
            <h1 className="mt-4 font-display text-4xl text-heading sm:text-5xl lg:text-6xl">
              {vehicle.name}
            </h1>
            <p className="mt-3 text-base italic text-gold/90 sm:text-lg">
              {vehicle.tagline}
            </p>
          </div>

          <div className="mt-8">
            <p className="text-sm leading-relaxed text-smoke sm:text-base">
              {vehicle.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-gold/15 py-4 text-sm text-smoke">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {vehicle.passengers} passengers
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {vehicle.luggage} bags
              </span>
              {/* Best For — mobile only. Desktop already surfaces this via
                  the Quick Facts cards below the hero, so showing it here
                  too would duplicate it on desktop. */}
              <span className="flex items-center gap-2 lg:hidden">
                <Compass className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {vehicle.idealFor}
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

      {/* Specs zone — deep black, refined bordered cards; Quick Facts,
          pricing, features and "why choose" all share this dark premium
          treatment, with generous rhythm between each block. */}
      <Section tone="obsidian">
      <Container className="flex flex-col gap-16 sm:gap-20">
        {/* Quick Facts — desktop only, unchanged from before (avoids
            duplicating the passengers/luggage/Best For already shown in
            the hero meta row on mobile). */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-5">
          {quickFacts.map((fact) => (
            <Card
              key={fact.label}
              tone="dark"
              interactive
              className="p-6 transition-all duration-200 hover:-translate-y-0.5"
            >
              <fact.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <p className="mt-3 text-[10px] uppercase tracking-wide text-smoke">
                {fact.label}
              </p>
              <p className="mt-1 font-display text-lg text-heading">{fact.value}</p>
            </Card>
          ))}
        </div>

        {/* Pricing */}
        <div>
          <h2 className="font-display text-2xl text-heading sm:text-3xl">
            Available Chauffeur Packages
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
            Transparent chauffeur rates, fixed once your booking is confirmed.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-gold/15 bg-charcoal px-6 py-6 shadow-[0_20px_45px_-28px_rgba(0,0,0,0.9)] sm:grid-cols-3">
            {priceTiers.map((tier) => (
              <div key={tier.label} className="flex flex-col gap-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-smoke">
                  {tier.label}
                </span>
                <span className="font-display text-lg font-bold text-gold">
                  {formatAed(tier.amount)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs italic text-smoke">
            Includes professional chauffeur, fuel, tolls (Salik) &amp; VIP valet parking — excludes 5% VAT.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CTAButton href={`/booking?vehicle=${vehicle.slug}`}>Book Now</CTAButton>
            <CTAButton href={`/quote?vehicle=${vehicle.slug}`} variant="outline">
              Get Quote
            </CTAButton>
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-gold/80">
            Professional chauffeur included &bull; No deposit required &bull; Flexible cancellation policy
          </p>
        </div>

        {/* Features & Amenities */}
        <div>
          <SectionHeading
            eyebrow="Onboard"
            title="Features & Amenities"
            align="left"
            tone="dark"
          />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.features.map((feature) => {
              const Icon = amenityIcon(feature);
              return (
                <Card
                  key={feature}
                  tone="dark"
                  interactive
                  className="flex h-full items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(212,175,55,0.4)] sm:p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10">
                    <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  </span>
                  <span className="text-sm text-smoke">{feature}</span>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Why choose this vehicle */}
        <div>
          <SectionHeading
            eyebrow="Why This Vehicle"
            title={`Why Choose the ${vehicle.name}`}
            align="left"
            tone="dark"
          />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {vehicle.whyChoose.map((reason) => (
              <Card
                key={reason}
                tone="dark"
                interactive
                className="flex items-start gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-smoke">{reason}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
      </Section>

      {/* About — light, editorial section; deliberately breaks from the
          dark specs/features block above for a premium change of pace. */}
      <Section tone="ivory">
      <Container>
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="The Vehicle"
            title={`About the ${vehicle.name}`}
            align="left"
            tone="light"
          />
          <p className="mt-6 text-base leading-relaxed text-graphite sm:text-lg">
            {vehicle.longDescription}
          </p>
        </div>
      </Container>
      </Section>

      {/* Related vehicles — reuses the homepage "Our Fleet" card exactly,
          with its WhatsApp-enquiry variant enabled. */}
      <Section tone="obsidian">
      <Container>
        <SectionHeading
          eyebrow="Explore More"
          title="Explore Similar Vehicles"
          tone="dark"
        />
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {similarVehicles.map((related) => (
            <FleetCarouselCard key={related.slug} vehicle={related} whatsapp tone="dark" />
          ))}
        </div>
      </Container>
      </Section>

      {/* FAQ — dedicated accordion section, light background matching About. */}
      <VehicleFaqSection vehicleName={vehicle.name} />

      <BookingCTA />
    </div>
  );
}
