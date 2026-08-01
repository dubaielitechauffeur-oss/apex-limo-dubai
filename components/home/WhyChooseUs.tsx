import { getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  Clock,
  Car,
  Wallet,
  Timer,
  Building2,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";

interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default async function WhyChooseUs() {
  const t = await getTranslations("home.whyChooseUs");

  const REASONS: Reason[] = [
    { icon: BadgeCheck, title: t("licensedTitle"), description: t("licensedDescription") },
    { icon: Car, title: t("maintainedTitle"), description: t("maintainedDescription") },
    { icon: Clock, title: t("availabilityTitle"), description: t("availabilityDescription") },
    { icon: Wallet, title: t("pricingTitle"), description: t("pricingDescription") },
    { icon: Timer, title: t("punctualityTitle"), description: t("punctualityDescription") },
    { icon: Building2, title: t("corporateTitle"), description: t("corporateDescription") },
  ];

  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
            tone="light"
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason, index) => (
            <Reveal key={index} delay={Math.min(index * 80, 320)} className="flex gap-4">
              <reason.icon
                className="mt-1 h-6 w-6 shrink-0 text-gold-deep"
                strokeWidth={1.5}
              />
              <div>
                <h3 className="font-display text-lg text-obsidian">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
