import { useTranslations } from "next-intl";
import { Star, Car, BadgeCheck, Clock, Zap } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import Ltr from "@/components/shared/Ltr";
import { RATING, FLEET_SIZE } from "@/lib/constants";

/**
 * Luxury sidebar trust panel shown beside the booking/quote forms — a
 * black-and-gold rating/trust summary plus a "What Happens Next" process,
 * replacing the old phone/WhatsApp quick-contact boxes.
 */
export default function ConversionTrustPanel() {
  const t = useTranslations("forms.conversion");
  const tPanel = useTranslations("forms.conversion.trustPanel");

  const trustBullets = [
    { icon: Car, label: t("fleetSizeVehicles", { count: FLEET_SIZE }) },
    { icon: BadgeCheck, label: tPanel("professionalChauffeurs") },
    { icon: Clock, label: tPanel("availability247") },
    { icon: Zap, label: tPanel("fastResponseTimes") },
  ];

  const nextSteps = [
    tPanel("step1"),
    tPanel("step2"),
    tPanel("step3"),
    tPanel("step4"),
  ];

  return (
    <Reveal className="rounded-2xl border border-[rgba(201,161,74,0.2)] bg-[#111111] p-6 sm:p-8">
      <div className="flex gap-0.5" role="img" aria-label={`${RATING} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-[#C9A14A] text-[#C9A14A]" strokeWidth={1.5} />
        ))}
      </div>
      <p className="mt-2 font-display text-xl text-white"><Ltr>{t("ratingLabel", { rating: RATING })}</Ltr></p>
      <p className="mt-3 text-sm leading-relaxed text-[#B8B8B8]">
        {tPanel("trustedByTemplate")}
      </p>

      <ul className="mt-6 space-y-4 border-t border-[rgba(201,161,74,0.15)] pt-6">
        {trustBullets.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-sm text-[#E5E5E5]">
            <item.icon className="h-4 w-4 shrink-0 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
            <Ltr>{item.label}</Ltr>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-[rgba(201,161,74,0.15)] pt-6">
        <span className="label-eyebrow">{tPanel("whatHappensNext")}</span>
        <ol className="mt-4 space-y-4">
          {nextSteps.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9A14A]/40 text-xs font-semibold text-[#C9A14A]">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm text-[#B8B8B8]">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
