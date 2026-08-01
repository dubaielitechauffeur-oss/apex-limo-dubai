"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import CTAButton from "@/components/shared/CTAButton";

export default function NotFound() {
  const t = useTranslations("common.notFound");
  return (
    <Section tone="obsidian" className="flex min-h-[60vh] items-center">
      <Container className="text-center">
        <span className="label-eyebrow">404</span>
        <h1 className="mt-4 font-display text-4xl text-heading sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CTAButton href="/">{t("backToHome")}</CTAButton>
          <Link
            href="/fleet"
            className="text-sm text-smoke underline underline-offset-4 transition-colors hover:text-gold"
          >
            {t("browseFleet")}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
