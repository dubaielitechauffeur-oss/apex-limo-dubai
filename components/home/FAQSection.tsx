import { getLocale, getTranslations } from "next-intl/server";
import FAQAccordion from "@/components/shared/FAQAccordion";
// One FAQ dataset for the whole site: the homepage slice comes from the
// same CMS rows /faqs renders, so the two can no longer publish
// contradicting answers or conflicting FAQPage schema.
import { getHomepageFaqs } from "@/lib/public/cms-content";
import type { Locale } from "@/i18n/routing";

export default async function FAQSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.faq");
  const faqs = await getHomepageFaqs(locale);

  return (
    <FAQAccordion
      faqs={faqs}
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
      viewAllLabel={t("viewAllFaqs")}
    />
  );
}
