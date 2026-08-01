import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import Ltr from "@/components/shared/Ltr";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { formatDate } from "@/lib/format";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.terms" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/terms",
  });
}

const LAST_UPDATED_ISO = "2026-07-09";

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  const tNav = await getTranslations({ locale, namespace: "common.nav" });
  const breadcrumbLabel = t("title");
  const lastUpdated = formatDate(LAST_UPDATED_ISO, locale as Locale);
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: breadcrumbLabel, path: "/terms" }], locale as Locale, tNav("home"))
          ),
        }}
      />
      <Section tone="ivory" separator={false}>
      <Container className="max-w-3xl">
        <span className="label-eyebrow text-graphite">{t("eyebrow")}</span>
        <h1 className="mt-4 font-display text-3xl text-obsidian sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-wide text-graphite">
          {t("lastUpdatedLabel")}: {lastUpdated}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-graphite sm:text-base">
          {t("introTemplate", { siteName: SITE.name })}
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-graphite sm:text-base">
          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s1.heading")}</h2>
            <p className="mt-4">{t("s1.p1Template", { siteName: SITE.name })}</p>
            <p className="mt-4">{t("s1.p2")}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s2.heading")}</h2>
            <ul className="mt-4 space-y-2">
              {t.raw("s2.items").map((item: string) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s3.heading")}</h2>
            <p className="mt-4">{t("s3.p1Template", { siteName: SITE.name })}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s4.heading")}</h2>
            <p className="mt-4">{t("s4.p1")}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s5.heading")}</h2>
            <p className="mt-4">{t("s5.p1Template", { siteName: SITE.name })}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s6.heading")}</h2>
            <p className="mt-4">{t("s6.p1")}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s7.heading")}</h2>
            <ul className="mt-4 space-y-2">
              {t.raw("s7.items").map((item: string) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s8.heading")}</h2>
            <ul className="mt-4 space-y-2">
              {t.raw("s8.items").map((item: string) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s9.heading")}</h2>
            <p className="mt-4">{t("s9.p1Template", { siteName: SITE.name })}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s10.heading")}</h2>
            <p className="mt-4">{t("s10.p1Template", { siteName: SITE.name })}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s11.heading")}</h2>
            <p className="mt-4">{t("s11.p1")}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">{t("s12.heading")}</h2>
            <p className="mt-4">
              {t.rich("s12.p1Template", {
                email: SITE.email,
                phone: SITE.phoneDisplay,
                emailLink: (chunks) => (
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-obsidian underline underline-offset-4 transition-colors hover:text-gold-deep"
                  >
                    {chunks}
                  </a>
                ),
                phoneLink: (chunks) => <Ltr>{chunks}</Ltr>,
              })}
            </p>
          </section>
        </div>
      </Container>
    </Section>
    </>
  );
}
