import Image from "next/image";
import Container from "@/components/shared/Container";
import CTAButton from "@/components/shared/CTAButton";
import { PRIMARY_CTA, getWhatsAppLink } from "@/lib/constants";

const STATS = [
  { value: "10+", label: "Years on Dubai roads" },
  { value: "24/7", label: "Availability" },
  { value: "6", label: "Vehicle classes" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient gold glow, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-gold/5 blur-3xl"
      />

      <Container className="relative grid grid-cols-1 items-center gap-16 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
        {/* Copy column */}
        <div>
          <span className="label-eyebrow">Dubai &amp; UAE Chauffeur Service</span>
          <h1 className="mt-5 font-display text-4xl leading-[1.08] text-ivory sm:text-5xl lg:text-6xl">
            Premium Chauffeur &amp; Limousine Service in Dubai
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-smoke sm:text-lg">
            Luxury airport transfers, corporate chauffeur services, VIP
            transportation and executive travel across Dubai and the UAE.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <CTAButton href={PRIMARY_CTA.book.href}>
              {PRIMARY_CTA.book.label}
            </CTAButton>
            <CTAButton href={PRIMARY_CTA.quote.href} variant="outline">
              {PRIMARY_CTA.quote.label}
            </CTAButton>
          </div>

          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm text-smoke underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold"
          >
            or WhatsApp us for an instant reply →
          </a>

          {/* Trust stats */}
          <dl className="mt-12 flex max-w-md items-center gap-6 sm:gap-10">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6 sm:gap-10">
                <div>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-2xl text-gold sm:text-3xl">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-xs uppercase tracking-wide text-smoke">
                    {stat.label}
                  </p>
                </div>
                {i < STATS.length - 1 ? (
                  <span className="h-10 w-px bg-gold/20" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </dl>
        </div>

        {/* Hero photograph, framed with the same bordered/shadow treatment
            used elsewhere on the site (e.g. the vehicle gallery panels). */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-gold/25 shadow-gold-lg">
            <Image
              src="/images/home/hero-homepage.webp"
              alt="Business executive working on a laptop in the back seat of an Apex Limo chauffeur-driven car in Dubai"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
