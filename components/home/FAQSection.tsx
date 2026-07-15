import FAQAccordion from "@/components/shared/FAQAccordion";
import { FAQS } from "@/data/faqs";

export default function FAQSection() {
  return (
    <FAQAccordion
      faqs={FAQS}
      eyebrow="Good to Know"
      title="Frequently Asked Questions"
      subtitle="Answers to the questions we hear most from first-time and returning clients."
    />
  );
}
