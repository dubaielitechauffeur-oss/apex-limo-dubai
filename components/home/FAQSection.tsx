import { getLocale, getTranslations } from "next-intl/server";
import FAQAccordion from "@/components/shared/FAQAccordion";
import { getFaqs } from "@/data/faqs";
import type { Locale } from "@/i18n/routing";

export default async function FAQSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.faq");
  const faqs = getFaqs(locale);

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
