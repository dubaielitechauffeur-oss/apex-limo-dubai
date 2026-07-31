import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
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
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import LocationsShowcase from "@/components/home/LocationsShowcase";
import FleetCarouselCard from "@/components/home/FleetCarouselCard";
import BookingCTA from "@/components/home/BookingCTA";
import AboutHero from "@/components/about/AboutHero";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { RATING } from "@/lib/constants";
import { getAllVehicles } from "@/data/fleet";
import { FLEET_SIZE } from "@/lib/constants";
import { LOCATIONS } from "@/data/locations";
import { TESTIMONIALS } from "@/data/testimonials";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.about" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/about",
  });
}

/** Icon order matches values.items in messages/{locale}/about.json. */
const VALUE_ICONS = [Clock, ShieldCheck, BadgeCheck, HeartHandshake];

/** Value/icon order matches byTheNumbers keys in messages/{locale}/about.json. */
const BY_THE_NUMBERS = [
  { icon: Award, value: "10+", labelKey: "yearsExperience" },
  { icon: Car, value: `${FLEET_SIZE}`, labelKey: "luxuryVehicles" },
  { icon: Users, value: "1000+", labelKey: "happyClients" },
  { icon: Star, value: RATING, labelKey: "averageRating" },
];

const FEATURED_FLEET_SLUGS = [
  "rolls-royce-phantom",
  "mercedes-s-class",
  "range-rover-autobiography",
  "mercedes-v-class",
];

/** Icon order matches whyChoose.items in messages/{locale}/about.json. */
const WHY_CLIENTS_CHOOSE_ICONS = [Award, Users, Star, HeartHandshake, Globe, Wallet];

const ABOUT_TESTIMONIAL_IDS = ["review-002", "review-004", "review-005"];
const ABOUT_TESTIMONIALS = TESTIMONIALS.filter((t) => ABOUT_TESTIMONIAL_IDS.includes(t.id));

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("about");
  const tCard = await getTranslations("fleet.card");
  const valueItems = t.raw("values.items") as { title: string; description: string }[];
  const whyChooseItems = t.raw("whyChoose.items") as { title: string; description: string }[];
  const standardsItems = t.raw("standards.items") as string[];
  const vehicles = getAllVehicles(locale as Locale);
  const cardLabels = {
    imageComingSoon: tCard("imageComingSoon"),
    tenHours: tCard("tenHours"),
    fiveHours: tCard("fiveHours"),
    oneHour: tCard("oneHour"),
    airport: tCard("airport"),
    viewCar: tCard("viewCar"),
    whatsapp: tCard("whatsapp"),
    contactUs: tCard("contactUs"),
  };
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: "About", path: "/about" }], locale as Locale)
          ),
        }}
      />

      {/* Hero */}
      <AboutHero />

      {/* Company introduction */}
      <Section tone="ivory" padding="sm">
        <Reveal>
        <Container className="max-w-3xl">
          <h2 className="font-display text-2xl text-obsidian sm:text-3xl">{t("ourStory.heading")}</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-graphite sm:text-base">
            <p>{t("ourStory.paragraph1")}</p>
            <p>{t("ourStory.paragraph2")}</p>
          </div>
        </Container>
        </Reveal>
      </Section>

      {/* By The Numbers */}
      <Section tone="obsidian" padding="sm">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
            {BY_THE_NUMBERS.map((stat, index) => (
              <Reveal key={stat.labelKey} delay={index * 80} className="flex flex-col items-center gap-2 text-center">
                <stat.icon className="h-5 w-5 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-display text-3xl text-heading sm:text-4xl">{stat.value}</span>
                <span className="text-xs uppercase tracking-wide text-smoke">
                  {t(`byTheNumbers.${stat.labelKey}`)}
                </span>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Mission & Values — luxury icon-based redesign */}
      <Section tone="linen">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t("values.eyebrow")}
              title={t("values.title")}
              subtitle={t("values.subtitle")}
              tone="light"
            />
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valueItems.map((value, index) => {
              const Icon = VALUE_ICONS[index];
              return (
                <Reveal
                  key={value.title}
                  delay={index * 80}
                  className="flex flex-col items-start rounded-2xl border border-gold/15 bg-ivory p-7 shadow-[0_16px_35px_-26px_rgba(10,10,10,0.3)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-20px_rgba(10,10,10,0.35)]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
                    <Icon className="h-6 w-6 text-gold-deep" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-5 font-display text-lg text-obsidian">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    {value.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Reused: why choose Apex */}
      <WhyChooseUs />

      {/* Chauffeur image + standards split layout */}
      <Section tone="ivory">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(0,0,0,0.4)] lg:order-2">
              <Image
                src="/images/services/luxury-chauffeur-door-service.webp"
                alt="Apex Limo chauffeur opening the car door for a client outside an office building"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </Reveal>
            <Reveal delay={100} className="lg:order-1">
              <SectionHeading
                eyebrow={t("standards.eyebrow")}
                title={t("standards.title")}
                align="left"
                tone="light"
              />
              <p className="mt-6 text-sm leading-relaxed text-graphite sm:text-base">
                {t("standards.intro")}
              </p>
              <ul className="mt-6 space-y-3">
                {standardsItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-graphite sm:text-base">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Service areas — image cards */}
      <LocationsShowcase
        eyebrow={t("locations.eyebrow")}
        title={t("locations.title")}
        subtitle={t("locations.subtitle")}
        tone="light"
      />
      <Section tone="pearl" padding="sm" separator={false}>
        <Container className="text-center">
          <Link href="/locations" className="btn-black">
            {t("locations.viewAll", { count: LOCATIONS.length })}
          </Link>
        </Container>
      </Section>

      {/* Featured fleet showcase with vehicle images */}
      <Section tone="linen">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t("fleet.eyebrow")}
              title={t("fleet.title")}
              subtitle={t("fleet.subtitle", { count: FLEET_SIZE })}
              tone="light"
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_FLEET_SLUGS.map((slug, index) => {
              const vehicle = vehicles.find((v) => v.slug === slug);
              return vehicle ? (
                <Reveal key={vehicle.slug} delay={index * 100}>
                  <FleetCarouselCard vehicle={vehicle} labels={cardLabels} />
                </Reveal>
              ) : null;
            })}
          </div>
          <div className="mt-12 text-center">
            <Link href="/fleet" className="btn-black">
              {t("fleet.exploreFull")}
            </Link>
          </div>
        </Container>
      </Section>

      {/* Why clients choose Apex — trust section */}
      <Section tone="ivory">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t("whyChoose.eyebrow")}
              title={t("whyChoose.title")}
              subtitle={t("whyChoose.subtitle")}
              tone="light"
            />
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseItems.map((item, index) => {
              const Icon = WHY_CLIENTS_CHOOSE_ICONS[index];
              return (
                <Reveal key={item.title} delay={Math.min(index * 80, 320)} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
                    <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-obsidian">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-graphite">{item.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Premium testimonials */}
      <Section tone="linen">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t("testimonials.eyebrow")}
              title={t("testimonials.title")}
              tone="light"
            />
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {ABOUT_TESTIMONIALS.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={index * 100}>
              <figure
                className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold/20 bg-ivory p-10 shadow-[0_16px_35px_-22px_rgba(10,10,10,0.35)] sm:p-12"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-6 start-8 select-none font-display text-[110px] leading-none text-gold/15"
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
                      {t("testimonials.verifiedClient")}
                    </span>
                  </div>
                </div>
              </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
