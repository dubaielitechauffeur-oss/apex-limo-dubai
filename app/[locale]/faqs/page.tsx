import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import BookingCTA from "@/components/home/BookingCTA";
import FaqHubClient from "@/components/faqs/FaqHubClient";
import { buildMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getAllFaqs, FAQ_CATEGORIES } from "@/data/faqHub";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.faqs" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/faqs",
  });
}

export default async function FaqsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("faqs");
  const tNav = await getTranslations({ locale, namespace: "common.nav" });
  const faqs = getAllFaqs(locale as Locale);
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs, locale as Locale)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: tNav("faqs"), path: "/faqs" }], locale as Locale, tNav("home"))
          ),
        }}
      />

      {/* Hero */}
      <section className="border-b border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] py-20 sm:py-24">
        <Container className="text-center">
          <span className="animate-fade-in label-eyebrow">{t("hero.eyebrow")}</span>
          <h1 className="mx-auto mt-5 max-w-3xl animate-slide-in-left font-display text-4xl text-white [animation-delay:100ms] sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-in text-sm leading-relaxed text-[#B8B8B8] [animation-delay:250ms] sm:text-base">
            {t("hero.subtitle")}
          </p>
        </Container>
      </section>

      {/* Search + category filters + FAQ accordions */}
      <section className="bg-[#161616] py-20 sm:py-24">
        <Container>
          <FaqHubClient faqs={faqs} categories={FAQ_CATEGORIES} />
        </Container>
      </section>

      <BookingCTA
        eyebrow={t("finalCta.eyebrow")}
        heading={t("finalCta.heading")}
        subtitle={t("finalCta.subtitle")}
      />
    </div>
  );
}
