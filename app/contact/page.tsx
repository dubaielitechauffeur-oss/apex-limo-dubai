import type { Metadata } from "next";
import {
  Phone,
  MessageCircle,
  Clock,
  Mail,
  MapPin,
  Siren,
  Zap,
  Award,
  BadgeCheck,
  Car,
  Headphones,
  ArrowUpRight,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import LocationsShowcase from "@/components/home/LocationsShowcase";
import BookingCTA from "@/components/home/BookingCTA";
import ContactFaqAccordion from "@/components/contact/ContactFaqAccordion";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { SITE, getPhoneLink, getWhatsAppLink } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Contact Us",
    description:
      "Contact Apex Limo & Chauffeur Dubai by phone, WhatsApp, or our contact form. 24/7 availability for bookings, corporate accounts, and emergency chauffeur requests.",
    path: "/contact",
  });
}

const TRUST_BADGES = [
  { icon: Clock, label: "24/7 Availability" },
  { icon: BadgeCheck, label: "Professional Chauffeurs" },
  { icon: Car, label: "Luxury Fleet" },
  { icon: MessageCircle, label: "Instant WhatsApp Support" },
];

const QUICK_CONTACT_CARDS = [
  {
    icon: Phone,
    label: "Call Us",
    detail: SITE.phoneDisplay,
    description: "Speak with our team directly, 24 hours a day, every day of the year.",
    href: getPhoneLink(),
    cta: "Call Now",
    external: false,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    detail: "Instant response",
    description: "The fastest way to reach us — most messages are answered within minutes.",
    href: getWhatsAppLink(),
    cta: "Message Us",
    external: true,
  },
  {
    icon: Mail,
    label: "Email Us",
    detail: SITE.email,
    description: "For detailed enquiries, corporate accounts, or documentation requests.",
    href: `mailto:${SITE.email}`,
    cta: "Send Email",
    external: false,
  },
];

const WHY_CONTACT_APEX = [
  { icon: Award, title: "10+ Years Experience", description: "A decade of chauffeur-driven service across Dubai and the UAE." },
  { icon: Clock, title: "24/7 Availability", description: "Bookings, questions, and urgent requests handled around the clock." },
  { icon: BadgeCheck, title: "Professional Chauffeurs", description: "Licensed, background-checked, and trained in etiquette and discretion." },
  { icon: Car, title: "Luxury Fleet", description: "From executive sedans to the Rolls-Royce Phantom, maintained to the highest standard." },
  { icon: Zap, title: "Fast Response Times", description: "WhatsApp messages are typically answered within minutes, not hours." },
  { icon: Headphones, title: "Premium Customer Support", description: "A dedicated team that treats every enquiry like a VIP request." },
];

const CONTACT_FAQS = [
  {
    question: "How quickly will I get a response?",
    answer:
      "WhatsApp messages are typically answered within minutes. Phone calls are answered live 24/7. Contact form enquiries are answered within a few hours.",
  },
  {
    question: "Can I book a chauffeur for right now?",
    answer:
      "Yes — for urgent, same-hour requests, WhatsApp or call us directly rather than using the online form. We'll confirm availability immediately.",
  },
  {
    question: "How do I set up a corporate account?",
    answer:
      "WhatsApp or call us with your company details and typical travel needs, and our team will set up a standing account with invoicing.",
  },
  {
    question: "Can I change or cancel a booking through this page?",
    answer:
      "For changes to an existing booking, WhatsApp or call us directly with your reference number — it's the fastest way to update a live booking.",
  },
  {
    question: "What information should I include when I message you on WhatsApp?",
    answer:
      "Your pickup and drop-off locations, date and time, number of passengers, and your preferred vehicle — the more detail you share upfront, the faster we can confirm.",
  },
  {
    question: "Can I request a specific vehicle when contacting you?",
    answer:
      "Yes, mention your preferred vehicle when you contact us and we'll confirm availability along with your booking.",
  },
  {
    question: "Do you respond to enquiries from outside the UAE?",
    answer:
      "Yes, we respond to enquiries from anywhere — many of our bookings are made by travelers before they even land in Dubai.",
  },
  {
    question: "Is support available in languages other than English?",
    answer:
      "Yes, several of our team members and chauffeurs are multilingual — let us know your preferred language when you reach out.",
  },
  {
    question: "Can I request a callback instead of messaging first?",
    answer: "Yes, leave your number via WhatsApp or the contact form and our team will call you back directly.",
  },
  {
    question: "Do you charge for a quote or consultation?",
    answer: "No, quotes and consultations are completely free — you only pay once a booking is confirmed.",
  },
];

export default function ContactPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(CONTACT_FAQS)) }}
      />

      {/* SECTION 1 — Luxury Contact Hero */}
      <section className="border-b border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] py-20 sm:py-24">
        <Container className="text-center">
          <span className="label-eyebrow">Contact Apex Limo</span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl text-white sm:text-5xl">
            Let&apos;s Plan Your Next Journey
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
            Whether you need airport transfers, corporate travel, VIP transportation or a luxury
            chauffeur for a special occasion, our team is available 24/7.
          </p>

          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:gap-4">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 rounded-full border border-[rgba(201,161,74,0.2)] bg-[#151515] px-5 py-3"
              >
                <badge.icon className="h-4 w-4 shrink-0 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wide text-white sm:text-[13px]">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 2 — Quick Contact Options */}
      <section className="bg-[#161616] py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Get In Touch" title="Quick Contact Options" tone="dark" />

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_CONTACT_CARDS.map((card) => (
              <a
                key={card.label}
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className="group flex flex-col rounded-2xl border border-[rgba(201,161,74,0.15)] bg-[#121212] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A14A]/40 hover:bg-[rgba(201,161,74,0.08)]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(201,161,74,0.25)] bg-[#151515]">
                  <card.icon className="h-6 w-6 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-xl text-white">{card.label}</h3>
                <p className="mt-1 text-sm font-semibold text-[#C9A14A]">{card.detail}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#B8B8B8]">{card.description}</p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors duration-200 group-hover:text-[#C9A14A]">
                  {card.cta}
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 3 — Contact Form + Details */}
      <section className="bg-[#111111] py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Send a Message" title="Tell Us About Your Journey" tone="dark" />

          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            {/* Form */}
            <div className="rounded-2xl border border-[rgba(201,161,74,0.15)] bg-[#151515] p-6 sm:p-10 lg:p-12">
              <h3 className="font-display text-2xl text-white">Send a Message</h3>
              <p className="mt-3 text-sm text-[#B8B8B8]">
                This form isn&apos;t connected to email yet — for an immediate response, please
                use WhatsApp or call us using the details alongside.
              </p>

              <form className="mt-8 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#B8B8B8]"
                    >
                      Full Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="field-input"
                      placeholder="e.g. James Carter"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#B8B8B8]"
                    >
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="field-input"
                      placeholder="+971 5X XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#B8B8B8]"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="field-input"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#B8B8B8]"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    className="field-input"
                    placeholder="e.g. Corporate account enquiry"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#B8B8B8]"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    className="field-input resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <button type="button" className="btn-gold w-full sm:w-auto">
                  Send Message
                </button>
                <p className="text-xs text-[#999999]">
                  This form doesn&apos;t send yet — for now, please reach us via WhatsApp or
                  phone.
                </p>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Response stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[rgba(201,161,74,0.15)] bg-[#151515] p-5 text-center">
                  <Zap className="mx-auto h-5 w-5 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-3 font-display text-2xl text-white">Under 15 Min</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[#999999]">
                    Average Response Time
                  </p>
                </div>
                <div className="rounded-2xl border border-[rgba(201,161,74,0.15)] bg-[#151515] p-5 text-center">
                  <Siren className="mx-auto h-5 w-5 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-3 font-display text-2xl text-white">24/7</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[#999999]">
                    Emergency Support
                  </p>
                </div>
              </div>

              {/* Reach us directly */}
              <div className="rounded-2xl border border-[rgba(201,161,74,0.15)] bg-[#151515] p-6 sm:p-8">
                <h3 className="font-display text-lg text-white">Reach Us Directly</h3>
                <ul className="mt-5 space-y-4 text-sm text-[#B8B8B8]">
                  <li>
                    <a
                      href={getPhoneLink()}
                      className="flex items-center gap-3 transition-colors hover:text-[#C9A14A]"
                    >
                      <Phone className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} />
                      {SITE.phoneDisplay}
                    </a>
                  </li>
                  <li>
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 transition-colors hover:text-[#C9A14A]"
                    >
                      <MessageCircle className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} />
                      WhatsApp Us
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="flex items-center gap-3 transition-colors hover:text-[#C9A14A]"
                    >
                      <Mail className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} />
                      {SITE.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} />
                    Dubai, United Arab Emirates
                  </li>
                </ul>
                <div className="mt-6 flex flex-col gap-3">
                  <CTAButton href={getWhatsAppLink()} external>
                    WhatsApp Us
                  </CTAButton>
                  <CTAButton href={getPhoneLink()} variant="outline">
                    Call {SITE.phoneDisplay}
                  </CTAButton>
                </div>
              </div>

              {/* Operating hours */}
              <div className="rounded-2xl border border-[rgba(201,161,74,0.15)] bg-[#151515] p-6 sm:p-8">
                <h3 className="flex items-center gap-2 font-display text-lg text-white">
                  <Clock className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} />
                  Operating Hours
                </h3>
                <dl className="mt-5 space-y-3 text-sm text-[#B8B8B8]">
                  <div className="flex items-center justify-between">
                    <dt>Chauffeur &amp; Booking Service</dt>
                    <dd className="text-[#C9A14A]">24/7</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Customer Support Office</dt>
                    <dd>8:00 AM – 10:00 PM (GST)</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-[#999999]">
                  Bookings and urgent requests are handled around the clock, every day of the
                  year, including public holidays.
                </p>
                <a
                  href={getWhatsAppLink(
                    "Hello Apex Limo, I need a chauffeur urgently — please advise availability."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#C9A14A] transition-colors hover:text-[#e0bd6b]"
                >
                  <Siren className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Need a chauffeur right now? WhatsApp us.
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* SECTION 4 — Service Areas */}
      <LocationsShowcase
        eyebrow="Service Areas"
        title="Areas We Serve"
        subtitle="Chauffeur service available across Dubai's most important business, leisure and residential destinations."
        tone="dark"
      />

      {/* SECTION 5 — Why Clients Contact Apex */}
      <section className="bg-[#161616] py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Why Apex" title="Why Clients Contact Apex" tone="dark" />

          <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CONTACT_APEX.map((reason) => (
              <div key={reason.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(201,161,74,0.25)] bg-[#121212]">
                  <reason.icon className="h-5 w-5 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg text-white">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#B8B8B8]">{reason.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 6 — Contact FAQs */}
      <section className="bg-[#111111] py-20 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Common Questions" title="Contact FAQs" align="left" tone="dark" />
          <div className="mt-10">
            <ContactFaqAccordion faqs={CONTACT_FAQS} />
          </div>
        </Container>
      </section>

      {/* SECTION 7 — Final CTA */}
      <BookingCTA
        eyebrow="We're Here to Help"
        heading="Need a Chauffeur Today?"
        subtitle="Book online, get an instant quote, or message us on WhatsApp — our team is ready around the clock."
      />
    </div>
  );
}
