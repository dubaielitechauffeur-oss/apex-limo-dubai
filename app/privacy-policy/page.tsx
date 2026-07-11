import type { Metadata } from "next";
import { Info } from "lucide-react";
import Container from "@/components/shared/Container";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Privacy Policy",
    description:
      "How Apex Limo & Chauffeur Dubai collects, uses, and protects your personal data, including booking data, contact data, and cookies.",
    path: "/privacy-policy",
  });
}

const LAST_UPDATED = "July 9, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <span className="label-eyebrow">Legal</span>
        <h1 className="mt-4 font-display text-3xl text-ivory sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-xs uppercase tracking-wide text-smoke">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 flex items-start gap-3 border border-gold/20 bg-charcoal p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
          <p className="text-sm leading-relaxed text-smoke">
            This page is a template and does not constitute legal advice.
            Before publishing, have this policy reviewed by qualified legal
            counsel to confirm it meets applicable data protection
            obligations, including UAE data protection law and, where
            relevant, GDPR.
          </p>
        </div>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-smoke sm:text-base">
          <section>
            <h2 className="font-display text-2xl text-ivory">1. Introduction</h2>
            <p className="mt-4">
              {SITE.name} ("Apex," "we," "us," or "our") respects your privacy
              and is committed to protecting the personal data you share with
              us when you use our website, request a quote, or book a
              chauffeur service. This policy explains what data we collect,
              why we collect it, how it's used, and the rights you have over
              it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">2. Information We Collect</h2>
            <h3 className="mt-6 font-display text-lg text-ivory">Booking Data</h3>
            <p className="mt-3">
              When you make a booking or request a quote, we collect
              information necessary to fulfil the service, including your
              full name, phone number, email address, pickup and drop-off
              locations, travel date and time, vehicle preference, passenger
              count, and any special requests you provide.
            </p>
            <h3 className="mt-6 font-display text-lg text-ivory">Contact Data</h3>
            <p className="mt-3">
              When you contact us through our website form, phone, or
              WhatsApp, we collect the information you provide in that
              conversation, such as your name, contact details, and the
              content of your enquiry, in order to respond to you.
            </p>
            <h3 className="mt-6 font-display text-lg text-ivory">Automatically Collected Data</h3>
            <p className="mt-3">
              Like most websites, we may automatically collect limited
              technical information — such as browser type, device type, and
              general usage patterns — through cookies and similar
              technologies, as described in the Cookies Policy below.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">3. How We Use Your Information</h2>
            <ul className="mt-4 space-y-2">
              {[
                "To confirm, manage, and fulfil your booking or quote request",
                "To communicate with you about your trip, including driver and timing updates",
                "To respond to enquiries submitted via our contact form, phone, or WhatsApp",
                "To maintain records for invoicing and corporate accounts",
                "To improve our website and services",
                "To comply with legal and regulatory obligations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">4. Cookies Policy</h2>
            <p className="mt-4">
              Our website may use cookies and similar technologies to
              remember preferences, understand how visitors use the site, and
              improve performance. You can control or disable cookies through
              your browser settings; doing so may affect certain features of
              the site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">5. Sharing of Information</h2>
            <p className="mt-4">
              We do not sell your personal data. We may share limited booking
              information with the chauffeur assigned to your trip, and with
              service providers who support our operations (such as
              communication or payment processing tools), solely to the
              extent necessary to deliver the service. We may also disclose
              information where required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">6. Data Retention</h2>
            <p className="mt-4">
              We retain booking and contact data for as long as necessary to
              fulfil the purposes described in this policy, including
              ongoing corporate accounts, and to meet legal, accounting, or
              reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">7. Your Rights</h2>
            <p className="mt-4">
              Depending on your location, you may have the right to access,
              correct, delete, or restrict the use of your personal data, and
              to request a copy of the data we hold about you. To exercise
              any of these rights, contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">8. Data Security</h2>
            <p className="mt-4">
              We take reasonable technical and organizational measures to
              protect your personal data against unauthorized access, loss,
              or misuse. No method of transmission or storage is completely
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">9. Changes to This Policy</h2>
            <p className="mt-4">
              We may update this Privacy Policy from time to time. Any
              changes will be posted on this page with a revised "Last
              updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ivory">10. Contact Us</h2>
            <p className="mt-4">
              For any questions about this Privacy Policy or how your data is
              handled, contact us at{" "}
              <a href={`mailto:${SITE.email}`} className="text-gold underline underline-offset-4">
                {SITE.email}
              </a>{" "}
              or {SITE.phoneDisplay}.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
