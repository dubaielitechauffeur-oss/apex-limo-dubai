import type { Metadata } from "next";
import {
  Phone,
  MessageCircle,
  Clock,
  Mail,
  MapPin,
  Siren,
  Zap,
  Award,
  BadgeCheck,
  Car,
  Headphones,
  ArrowUpRight,
} from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import Reveal from "@/components/shared/Reveal";
import LocationsShowcase from "@/components/home/LocationsShowcase";
import BookingCTA from "@/components/home/BookingCTA";
import ContactFaqAccordion from "@/components/contact/ContactFaqAccordion";
import ContactForm from "@/components/contact/ContactForm";
import Ltr from "@/components/shared/Ltr";
import { buildMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { SITE, getPhoneLink, getWhatsAppLink } from "@/lib/constants";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.contact" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/contact",
  });
}

/** Icon order matches trustBadges in messages/{locale}/contact.json. */
const TRUST_BADGE_ICONS = [Clock, BadgeCheck, Car, MessageCircle];

/** Data-only fields per card — label/detail(WhatsApp only)/description/cta
 *  come from messages/{locale}/contact.json's quickContact.cards, indexed
 *  by position. Phone/email are real contact data, never translated. Built
 *  as a function (rather than a module-level const) since the WhatsApp
 *  href needs the current locale's translated prefill message. */
function getQuickContactCardMeta(whatsappMessage: string) {
  return [
    { icon: Phone, href: getPhoneLink(), external: false, dataDetail: SITE.phoneDisplay },
    { icon: MessageCircle, href: getWhatsAppLink(whatsappMessage), external: true, dataDetail: undefined },
    { icon: Mail, href: `mailto:${SITE.email}`, external: false, dataDetail: SITE.email },
  ];
}

/** Icon order matches whyContact.items in messages/{locale}/contact.json. */
const WHY_CONTACT_ICONS = [Award, Clock, BadgeCheck, Car, Zap, Headphones];

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("contact");
  const tNav = await getTranslations("common.nav");
  const tCommon = await getTranslations("common");
  const quickContactCardMeta = getQuickContactCardMeta(tCommon("whatsappGenericMessage"));
  const trustBadges = t.raw("trustBadges") as string[];
  const quickContactCards = t.raw("quickContact.cards") as {
    label: string;
    detail?: string;
    description: string;
    cta: string;
  }[];
  const whyContactItems = t.raw("whyContact.items") as { title: string; description: string }[];
  const contactFaqs = t.raw("faqs") as { question: string; answer: string }[];
  return (
    <div>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(contactFaqs, locale as Locale)) }}
      />
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: tNav("contact"), path: "/contact" }], locale as Locale, tNav("home"))
          ),
        }}
      />

      {/* SECTION 1 — Luxury Contact Hero */}
      <section className="border-b border-gold/15 bg-obsidian py-20 sm:py-24">
        <Container className="text-center">
          <span className="animate-fade-in label-eyebrow">{t("hero.eyebrow")}</span>
          <h1 className="mx-auto mt-5 max-w-3xl animate-slide-in-left font-display text-4xl text-white [animation-delay:100ms] sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-in text-sm leading-relaxed text-smoke [animation-delay:250ms] sm:text-base">
            {t("hero.subtitle")}
          </p>

          <div className="mx-auto mt-10 flex max-w-3xl animate-fade-in flex-wrap items-center justify-center gap-3 [animation-delay:400ms] sm:gap-4">
            {trustBadges.map((label, index) => {
              const Icon = TRUST_BADGE_ICONS[index];
              return (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-full border border-gold/20 bg-obsidian-light px-5 py-3"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-white sm:text-[13px]">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* SECTION 2 — Quick Contact Options */}
      <section className="bg-obsidian-light py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t("quickContact.eyebrow")} title={t("quickContact.title")} tone="dark" />
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quickContactCards.map((card, index) => {
              const meta = quickContactCardMeta[index];
              return (
                <Reveal key={card.label} delay={index * 100}>
                <a
                  href={meta.href}
                  target={meta.external ? "_blank" : undefined}
                  rel={meta.external ? "noopener noreferrer" : undefined}
                  className="group flex flex-col rounded-2xl border border-gold/15 bg-obsidian-light p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-gold/8"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-obsidian-light">
                    <meta.icon className="h-6 w-6 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-display text-xl text-white">{card.label}</h3>
                  {meta.dataDetail ? (
                    <p className="mt-1 text-sm font-semibold text-gold"><Ltr>{meta.dataDetail}</Ltr></p>
                  ) : card.detail ? (
                    <p className="mt-1 text-sm font-semibold text-gold">{card.detail}</p>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-smoke">{card.description}</p>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors duration-200 group-hover:text-gold">
                    {card.cta}
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </a>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* SECTION 3 — Contact Form + Details */}
      <section className="bg-ink py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t("form.eyebrow")} title={t("form.title")} tone="dark" />
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            {/* Form */}
            <Reveal className="rounded-2xl border border-gold/15 bg-obsidian-light p-6 sm:p-10 lg:p-12">
              <h3 className="font-display text-2xl text-white">{t("form.panelTitle")}</h3>
              <p className="mt-3 text-sm text-smoke">{t("form.intro")}</p>

              <ContactForm />
            </Reveal>

            {/* Sidebar */}
            <Reveal as="aside" delay={150} className="space-y-6">
              {/* Response stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gold/15 bg-obsidian-light p-5 text-center">
                  <Zap className="mx-auto h-5 w-5 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-3 font-display text-2xl text-white">{t("sidebar.responseTime")}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-smoke">
                    {t("sidebar.responseTimeLabel")}
                  </p>
                </div>
                <div className="rounded-2xl border border-gold/15 bg-obsidian-light p-5 text-center">
                  <Siren className="mx-auto h-5 w-5 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-3 font-display text-2xl text-white">24/7</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-smoke">
                    {t("sidebar.emergencyLabel")}
                  </p>
                </div>
              </div>

              {/* Reach us directly */}
              <div className="rounded-2xl border border-gold/15 bg-obsidian-light p-6 sm:p-8">
                <h3 className="font-display text-lg text-white">{t("sidebar.reachUsDirectly")}</h3>
                <ul className="mt-5 space-y-4 text-sm text-smoke">
                  <li>
                    <a
                      href={getPhoneLink()}
                      className="flex items-center gap-3 transition-colors hover:text-gold"
                    >
                      <Phone className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      <Ltr>{SITE.phoneDisplay}</Ltr>
                    </a>
                  </li>
                  <li>
                    <a
                      href={getWhatsAppLink(tCommon("whatsappGenericMessage"))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 transition-colors hover:text-gold"
                    >
                      <MessageCircle className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      {t("sidebar.whatsappUs")}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="flex items-center gap-3 transition-colors hover:text-gold"
                    >
                      <Mail className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      {SITE.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    {t("sidebar.address")}
                  </li>
                </ul>
                <div className="mt-6 flex flex-col gap-3">
                  <CTAButton href={getWhatsAppLink(tCommon("whatsappGenericMessage"))} external>
                    {t("sidebar.whatsappUs")}
                  </CTAButton>
                  <CTAButton href={getPhoneLink()} variant="outline">
                    {t("sidebar.callCta")} <Ltr>{SITE.phoneDisplay}</Ltr>
                  </CTAButton>
                </div>
              </div>

              {/* Operating hours */}
              <div className="rounded-2xl border border-gold/15 bg-obsidian-light p-6 sm:p-8">
                <h3 className="flex items-center gap-2 font-display text-lg text-white">
                  <Clock className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  {t("sidebar.operatingHours")}
                </h3>
                <dl className="mt-5 space-y-3 text-sm text-smoke">
                  <div className="flex items-center justify-between">
                    <dt>{t("sidebar.chauffeurService")}</dt>
                    <dd className="text-gold">24/7</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>{t("sidebar.supportOffice")}</dt>
                    <dd>{t("sidebar.supportHours")}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-smoke">{t("sidebar.hoursDisclaimer")}</p>
                <a
                  href={getWhatsAppLink(t("sidebar.urgentWhatsappMessage"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold transition-colors hover:text-gold-pale"
                >
                  <Siren className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {t("sidebar.urgentWhatsapp")}
                </a>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* SECTION 4 — Service Areas */}
      <LocationsShowcase
        eyebrow={t("serviceAreas.eyebrow")}
        title={t("serviceAreas.title")}
        subtitle={t("serviceAreas.subtitle")}
        tone="dark"
      />

      {/* SECTION 5 — Why Clients Contact Apex */}
      <section className="bg-obsidian-light py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t("whyContact.eyebrow")} title={t("whyContact.title")} tone="dark" />
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {whyContactItems.map((item, index) => {
              const Icon = WHY_CONTACT_ICONS[index];
              return (
                <Reveal
                  key={item.title}
                  delay={Math.min(index * 80, 320)}
                  className="flex flex-col items-center text-center sm:items-start sm:text-start"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/25 bg-obsidian-light">
                    <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-lg text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">{item.description}</p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* SECTION 6 — Contact FAQs */}
      <section className="bg-ink py-20 sm:py-24">
        <Container className="max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow={t("faqSection.eyebrow")} title={t("faqSection.title")} align="left" tone="dark" />
          </Reveal>
          <div className="mt-10">
            <ContactFaqAccordion faqs={contactFaqs} />
          </div>
        </Container>
      </section>

      {/* SECTION 7 — Final CTA */}
      <BookingCTA
        eyebrow={t("finalCta.eyebrow")}
        heading={t("finalCta.heading")}
        subtitle={t("finalCta.subtitle")}
      />
    </div>
  );
}
