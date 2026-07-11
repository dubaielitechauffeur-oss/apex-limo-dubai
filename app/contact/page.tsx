import type { Metadata } from "next";
import {
  Phone,
  MessageCircle,
  Clock,
  Mail,
  MapPin,
  Siren,
  ChevronDown,
} from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import BookingCTA from "@/components/home/BookingCTA";
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
];

export default function ContactPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(CONTACT_FAQS)) }}
      />

      {/* Hero */}
      <section className="py-16 sm:py-24">
        <Container className="max-w-3xl">
          <span className="label-eyebrow">Get in Touch</span>
          <h1 className="mt-4 font-display text-3xl text-ivory sm:text-5xl">
            Contact {SITE.name}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-smoke sm:text-base">
            Reach us by phone, WhatsApp, or the form below. For urgent or
            same-hour requests, WhatsApp and phone are fastest.
          </p>
        </Container>
      </section>

      {/* Form + sidebar */}
      <section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.5fr_1fr]">
            {/* Contact form placeholder */}
            <div>
              <h2 className="font-display text-2xl text-ivory">Send a Message</h2>
              <p className="mt-3 text-sm text-smoke">
                This form isn't connected to email yet — for an immediate
                response, please use WhatsApp or call us using the details
                alongside.
              </p>

              <form className="mt-8 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke"
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
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke"
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
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke"
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
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke"
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
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-smoke"
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
                <p className="text-xs text-smoke/70">
                  This form doesn't send yet — for now, please reach us via
                  WhatsApp or phone.
                </p>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="border border-gold/15 bg-charcoal p-6">
                <h2 className="font-display text-lg text-ivory">Reach Us Directly</h2>
                <ul className="mt-5 space-y-4 text-sm text-smoke">
                  <li>
                    <a
                      href={getPhoneLink()}
                      className="flex items-center gap-3 transition-colors hover:text-gold"
                    >
                      <Phone className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      {SITE.phoneDisplay}
                    </a>
                  </li>
                  <li>
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 transition-colors hover:text-gold"
                    >
                      <MessageCircle className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      WhatsApp Us
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="flex items-center gap-3 transition-colors hover:text-gold"
                    >
                      <Mail className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      {SITE.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gold" strokeWidth={1.5} />
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

              {/* Business hours */}
              <div className="border border-gold/15 bg-charcoal p-6">
                <h2 className="flex items-center gap-2 font-display text-lg text-ivory">
                  <Clock className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  Business Hours
                </h2>
                <dl className="mt-5 space-y-3 text-sm text-smoke">
                  <div className="flex items-center justify-between">
                    <dt>Chauffeur &amp; Booking Service</dt>
                    <dd className="text-gold">24/7</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Customer Support Office</dt>
                    <dd>8:00 AM – 10:00 PM (GST)</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-smoke/80">
                  Bookings and urgent requests are handled around the clock,
                  every day of the year, including public holidays.
                </p>
              </div>

              {/* Emergency booking */}
              <div className="border border-gold/30 bg-charcoal p-6">
                <h2 className="flex items-center gap-2 font-display text-lg text-ivory">
                  <Siren className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  Need a Chauffeur Right Now?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-smoke">
                  For same-hour or emergency bookings, skip the form —
                  WhatsApp or call us directly and we'll confirm availability
                  immediately.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <CTAButton
                    href={getWhatsAppLink(
                      "Hello Apex Limo, I need a chauffeur urgently — please advise availability."
                    )}
                    external
                  >
                    WhatsApp Now
                  </CTAButton>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-charcoal py-20">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Common Questions" title="Contact FAQs" align="left" />
          <div className="mt-8 divide-y divide-gold/15 border-y border-gold/15">
            {CONTACT_FAQS.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-display text-lg text-ivory marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-gold transition-transform duration-200 group-open:rotate-180"
                    strokeWidth={1.5}
                  />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-smoke sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <BookingCTA />
    </div>
  );
}
