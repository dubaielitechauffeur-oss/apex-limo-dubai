"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import CTAButton from "@/components/shared/CTAButton";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Branded error boundary for any unexpected render/runtime error below the
 * locale layout — previously absent, so any such error fell through to
 * Next's default unstyled error screen instead of matching the rest of the
 * site's polish (custom 404, construction-notice modal, etc.).
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations("common.errorPage");

  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <Section tone="obsidian" className="flex min-h-[60vh] items-center">
      <Container className="text-center">
        <h1 className="font-display text-4xl text-heading sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn-gold">
            {t("tryAgain")}
          </button>
          <CTAButton href="/" variant="outline">
            {t("backToHome")}
          </CTAButton>
        </div>
      </Container>
    </Section>
  );
}
