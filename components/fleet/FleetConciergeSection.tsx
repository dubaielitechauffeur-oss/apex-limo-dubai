import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Phone } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";
import Ltr from "@/components/shared/Ltr";
import { SITE, getPhoneLink, getWhatsAppLink } from "@/lib/constants";

const RECOMMENDATION_SLUGS = {
  mercedesSClass: "mercedes-s-class",
  mercedesVClass: "mercedes-v-class",
  rollsRoyce: "rolls-royce-phantom",
  rangeRover: "range-rover-autobiography",
} as const;

/**
 * "Fleet Concierge" — a black/gold recommendation panel that helps
 * undecided visitors pick a vehicle type, styled to match the FAQ Hub's
 * premium dark presentation. Sits just before the closing Booking CTA.
 */
export default async function FleetConciergeSection() {
  const t = await getTranslations("fleet.concierge");

  const recommendations = (Object.keys(RECOMMENDATION_SLUGS) as (keyof typeof RECOMMENDATION_SLUGS)[]).map(
    (key) => ({
      key,
      slug: RECOMMENDATION_SLUGS[key],
      name: t(`recommendations.${key}.name`),
      blurb: t(`recommendations.${key}.blurb`),
    })
  );

  return (
    <section className="border-t border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] py-20 sm:py-24">
      <Container className="max-w-5xl text-center">
        <Reveal>
          <span className="label-eyebrow">{t("eyebrow")}</span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
            {t("subtitle")}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 text-start sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((item, index) => (
            <Reveal key={item.key} delay={index * 80}>
              <Link
                href={`/fleet/${item.slug}`}
                className="group block rounded-xl border border-[rgba(201,161,74,0.15)] bg-[#121212] p-6 transition-colors duration-200 hover:border-[#C9A14A]/50 hover:bg-[#171717]"
              >
                <h3 className="font-display text-lg text-white transition-colors duration-200 group-hover:text-[#C9A14A]">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#B8B8B8]">{item.blurb}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={getPhoneLink()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A14A] px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-black transition-colors duration-200 hover:bg-[#b8903f]"
          >
            <Phone className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            {t("call")} <Ltr>{SITE.phoneDisplay}</Ltr>
          </a>
          <a
            href={getWhatsAppLink(t("whatsappMessage"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(201,161,74,0.4)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:border-[#C9A14A] hover:text-[#C9A14A]"
          >
            {t("whatsappUs")}
          </a>
        </div>
      </Container>
    </section>
  );
}
