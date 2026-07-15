import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  BadgeCheck,
  HeartHandshake,
  MapPin,
  Award,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import BookingCTA from "@/components/home/BookingCTA";
import AboutHero from "@/components/about/AboutHero";
import { buildMetadata } from "@/lib/seo";
import { FLEET } from "@/data/fleet";
import { LOCATIONS } from "@/data/locations";

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

      {/* Mission & Values */}
      <Section tone="linen">
        <Container>
          <SectionHeading
            eyebrow="What Drives Us"
            title="Our Mission &amp; Values"
            subtitle="Four principles that shape every booking, from a single airport pickup to a full-scale event fleet."
            tone="light"
          />
          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div key={value.title} className="flex flex-col items-start">
                <value.icon className="h-7 w-7 text-gold-deep" strokeWidth={1.5} />
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

      {/* Service areas */}
      <Section tone="pearl">
        <Container>
          <SectionHeading
            eyebrow="Where We Drive"
            title="Service Areas Across Dubai &amp; the UAE"
            subtitle="Our chauffeurs know these neighborhoods in detail — pickup points, traffic patterns, and the quickest routes between them."
            tone="light"
          />
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((location) => (
              <Link key={location.slug} href={`/locations/${location.slug}`} className="btn-gold">
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {location.name}
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/locations" className="btn-black">
              View All Locations
            </Link>
          </div>
        </Container>
      </Section>

      {/* Chauffeur standards */}
      <Section tone="ivory">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Our People"
            title="Professional Chauffeur Standards"
            align="left"
            tone="light"
          />
          <p className="mt-6 text-sm leading-relaxed text-graphite sm:text-base">
            Every chauffeur who drives for Apex meets the same baseline before
            they're assigned a single booking:
          </p>
          <ul className="mt-6 space-y-3">
            {STANDARDS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-graphite sm:text-base">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Fleet overview */}
      <Section tone="linen">
        <Container>
          <SectionHeading
            eyebrow="Our Fleet"
            title="A Vehicle for Every Occasion"
            subtitle="Fifteen vehicles, all late-model, detailed before every trip, and matched to the journey."
            tone="light"
          />
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {FLEET.map((vehicle) => (
              <Link key={vehicle.slug} href={`/fleet/${vehicle.slug}`} className="btn-gold">
                {vehicle.name}
                <span className="text-xs font-normal normal-case tracking-normal text-obsidian/70">
                  {vehicle.category}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/fleet" className="btn-black">
              Explore the Full Fleet
            </Link>
          </div>
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
