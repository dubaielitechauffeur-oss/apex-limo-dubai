import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  BadgeCheck,
  HeartHandshake,
  Award,
  Car,
  Users,
  Star,
  Globe,
  Wallet,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import LocationsShowcase from "@/components/home/LocationsShowcase";
import FleetCarouselCard from "@/components/home/FleetCarouselCard";
import BookingCTA from "@/components/home/BookingCTA";
import AboutHero from "@/components/about/AboutHero";
import { buildMetadata } from "@/lib/seo";
import { FLEET } from "@/data/fleet";
import { FLEET_SIZE } from "@/lib/constants";
import { LOCATIONS } from "@/data/locations";
import { TESTIMONIALS } from "@/data/testimonials";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "About Us",
    description:
      "Learn about Apex Limo & Chauffeur Dubai — our mission, values, professional chauffeur standards, luxury fleet, and the areas we serve across Dubai and the UAE.",
    path: "/about",
  });
}

const VALUES = [
  {
    icon: Clock,
    title: "Punctuality",
    description:
      "Every booking is planned with a realistic buffer, not an optimistic one. On time means on time.",
  },
  {
    icon: ShieldCheck,
    title: "Discretion & Trust",
    description:
      "Our chauffeurs work quietly around business calls, private conversations, and confidential travel.",
  },
  {
    icon: BadgeCheck,
    title: "Safety & Compliance",
    description:
      "Licensed drivers, insured vehicles, and maintenance schedules that are never left to chance.",
  },
  {
    icon: HeartHandshake,
    title: "Genuine Hospitality",
    description:
      "A warm, professional welcome on every trip — not a transaction, a level of service you can rely on.",
  },
];

const STANDARDS = [
  "Valid UAE commercial driving licenses, verified before onboarding",
  "Background-checked prior to joining the Apex chauffeur team",
  "Trained in professional etiquette, discretion, and client communication",
  "Uniformed and presentable for every booking, from transfers to weddings",
  "Assessed regularly on punctuality, driving standards, and client feedback",
];

const BY_THE_NUMBERS = [
  { icon: Award, value: "10+", label: "Years of Experience" },
  { icon: Car, value: `${FLEET_SIZE}`, label: "Luxury Vehicles" },
  { icon: Users, value: "1000+", label: "Happy Clients" },
  { icon: Star, value: "5.0", label: "Average Rating" },
];

const FEATURED_FLEET_SLUGS = [
  "rolls-royce-phantom",
  "mercedes-s-class",
  "range-rover-autobiography",
  "mercedes-v-class",
];

const WHY_CLIENTS_CHOOSE = [
  {
    icon: Award,
    title: "A Decade of Trusted Service",
    description: "Over 10 years serving Dubai's residents, visitors, and businesses.",
  },
  {
    icon: Users,
    title: "1000+ Successful Bookings",
    description: "From single airport transfers to full wedding convoys, delivered reliably.",
  },
  {
    icon: Star,
    title: "5-Star Client Reviews",
    description: "Consistently rated 5.0 by verified clients across every service we offer.",
  },
  {
    icon: HeartHandshake,
    title: "Corporate & Hotel Partnerships",
    description: "Standing relationships with businesses and hospitality partners citywide.",
  },
  {
    icon: Globe,
    title: "Multilingual Chauffeur Team",
    description: "Drivers who speak multiple languages for a genuinely personal experience.",
  },
  {
    icon: Wallet,
    title: "Full Transparency, No Surprises",
    description: "The price you're quoted is exactly what you pay, every single time.",
  },
];

const ABOUT_TESTIMONIALS = TESTIMONIALS.filter((t) =>
  ["review-002", "review-004", "review-005"].includes(t.id)
);

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <AboutHero />

      {/* Company introduction */}
      <Section tone="ivory" padding="sm">
        <Container className="max-w-3xl">
          <h2 className="font-display text-2xl text-obsidian sm:text-3xl">Our Story</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-graphite sm:text-base">
            <p>
              Dubai's roads move fast, and so do the schedules of the people
              who rely on us — executives between meetings, families landing
              after a long flight, couples on the most important day of their
              lives. Apex Limo & Chauffeur Dubai was formed around a
              straightforward goal: give every one of them a vehicle and
              driver they don't have to think twice about.
            </p>
            <p>
              That means transparent, fixed pricing agreed before you travel.
              It means chauffeurs who track your flight rather than just your
              booking time. And it means a fleet that's inspected and detailed
              before every single trip, not just when it looks worn. We'd
              rather be the quietly reliable choice than the flashiest one —
              though our fleet tends to cover both.
            </p>
          </div>
        </Container>
      </Section>

      {/* By The Numbers */}
      <Section tone="obsidian" padding="sm">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
            {BY_THE_NUMBERS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
                <stat.icon className="h-5 w-5 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-display text-3xl text-heading sm:text-4xl">{stat.value}</span>
                <span className="text-xs uppercase tracking-wide text-smoke">{stat.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Mission & Values — luxury icon-based redesign */}
      <Section tone="linen">
        <Container>
          <SectionHeading
            eyebrow="What Drives Us"
            title="Our Mission &amp; Values"
            subtitle="Four principles that shape every booking, from a single airport pickup to a full-scale event fleet."
            tone="light"
          />
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="flex flex-col items-start rounded-2xl border border-gold/15 bg-ivory p-7 shadow-[0_16px_35px_-26px_rgba(10,10,10,0.3)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-20px_rgba(10,10,10,0.35)]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
                  <value.icon className="h-6 w-6 text-gold-deep" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-display text-lg text-obsidian">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Reused: why choose Apex */}
      <WhyChooseUs />

      {/* Chauffeur image + standards split layout */}
      <Section tone="ivory">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(0,0,0,0.4)] lg:order-2">
              <Image
                src="/images/services/luxury-chauffeur-door-service.webp"
                alt="Apex Limo chauffeur opening the car door for a client outside an office building"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="lg:order-1">
              <SectionHeading
                eyebrow="Our People"
                title="Professional Chauffeur Standards"
                align="left"
                tone="light"
              />
              <p className="mt-6 text-sm leading-relaxed text-graphite sm:text-base">
                Every chauffeur who drives for Apex meets the same baseline
                before they're assigned a single booking:
              </p>
              <ul className="mt-6 space-y-3">
                {STANDARDS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-graphite sm:text-base">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Service areas — image cards */}
      <LocationsShowcase
        eyebrow="Where We Drive"
        title="Service Areas Across Dubai &amp; the UAE"
        subtitle="Our chauffeurs know these neighborhoods in detail — pickup points, traffic patterns, and the quickest routes between them."
        tone="light"
      />
      <Section tone="pearl" padding="sm" separator={false}>
        <Container className="text-center">
          <Link href="/locations" className="btn-black">
            View All {LOCATIONS.length} Locations
          </Link>
        </Container>
      </Section>

      {/* Featured fleet showcase with vehicle images */}
      <Section tone="linen">
        <Container>
          <SectionHeading
            eyebrow="Our Fleet"
            title="A Vehicle for Every Occasion"
            subtitle={`${FLEET_SIZE} vehicles, all late-model, detailed before every trip, and matched to the journey.`}
            tone="light"
          />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_FLEET_SLUGS.map((slug) => {
              const vehicle = FLEET.find((v) => v.slug === slug);
              return vehicle ? <FleetCarouselCard key={vehicle.slug} vehicle={vehicle} /> : null;
            })}
          </div>
          <div className="mt-12 text-center">
            <Link href="/fleet" className="btn-black">
              Explore the Full Fleet
            </Link>
          </div>
        </Container>
      </Section>

      {/* Why clients choose Apex — trust section */}
      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="Why Apex"
            title="Why Clients Choose Apex"
            subtitle="The trust signals that bring clients back, booking after booking."
            tone="light"
          />
          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CLIENTS_CHOOSE.map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
                  <item.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-display text-lg text-obsidian">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Premium testimonials */}
      <Section tone="linen">
        <Container>
          <SectionHeading
            eyebrow="Client Words"
            title="What Our Clients Say"
            tone="light"
          />
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {ABOUT_TESTIMONIALS.map((testimonial) => (
              <figure
                key={testimonial.id}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-ivory p-10 shadow-[0_16px_35px_-22px_rgba(10,10,10,0.35)] sm:p-12"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-6 left-8 select-none font-display text-[110px] leading-none text-gold/15"
                >
                  &ldquo;
                </span>

                <div className="relative flex h-full flex-col">
                  <div className="flex gap-0.5" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? "fill-gold-deep text-gold-deep" : "fill-transparent text-gold-deep/30"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>

                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-deep">
                    {testimonial.serviceUsed}
                  </p>

                  <blockquote className="mt-4 font-display text-xl italic leading-relaxed text-obsidian">
                    {testimonial.text}
                  </blockquote>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gold/15 pt-8">
                    <figcaption className="text-base font-semibold text-obsidian">
                      {testimonial.name}
                    </figcaption>
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-graphite">
                      <ShieldCheck className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
                      Verified Client
                    </span>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
