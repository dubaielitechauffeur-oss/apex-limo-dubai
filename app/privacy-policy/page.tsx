import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Privacy Policy",
    description:
      "How Apex Limo & Chauffeur Dubai collects, uses, and protects the personal data of clients booking chauffeur, airport transfer, corporate travel, and event transportation services in Dubai and the UAE.",
    path: "/privacy-policy",
  });
}

const LAST_UPDATED = "July 9, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: "Privacy Policy", path: "/privacy-policy" }])
          ),
        }}
      />
      <Section tone="ivory" separator={false}>
      <Container className="max-w-3xl">
        <span className="label-eyebrow text-graphite">Legal</span>
        <h1 className="mt-4 font-display text-3xl text-obsidian sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-xs uppercase tracking-wide text-graphite">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-graphite sm:text-base">
          {SITE.name} operates a chauffeur-driven transportation service
          across Dubai and the United Arab Emirates, including airport
          transfers, corporate travel, VIP transportation, event logistics,
          and wedding chauffeur services. This Privacy Policy explains how we
          collect, use, disclose, and safeguard personal data when you visit
          our website, request a quote, make a booking, or otherwise
          communicate with us, and describes the choices and rights
          available to you regarding that data.
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-graphite sm:text-base">
          <section>
            <h2 className="font-display text-2xl text-obsidian">1. Introduction</h2>
            <p className="mt-4">
              {SITE.name} (&quot;Apex,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy
              and is committed to protecting the personal data you share with
              us when you use our website, request a quote, book a chauffeur,
              or otherwise engage with our luxury transportation services in
              Dubai and across the UAE. This policy explains what data we
              collect, why we collect it, how it is used and stored, who it
              may be shared with, and the rights you have over it. It applies
              to visitors to our website, individuals who request a quote or
              make a booking, corporate clients and their travelling
              employees, and anyone who contacts our team by phone, email, or
              WhatsApp.
            </p>
            <p className="mt-4">
              By using our website or engaging our chauffeur services, you
              acknowledge that you have read and understood this Privacy
              Policy. If you do not agree with any part of it, please do not
              use our website or services, or contact us directly to discuss
              your concerns before proceeding with a booking.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">2. Information We Collect</h2>
            <h3 className="mt-6 font-display text-lg text-obsidian">Booking &amp; Trip Data</h3>
            <p className="mt-3">
              When you make a booking or request a quote for airport
              transfers, corporate chauffeur service, luxury or VIP
              transportation, event logistics, or a wedding chauffeur, we
              collect the information necessary to plan and deliver that
              trip: your full name, phone number, email address, pickup and
              drop-off locations, travel date and time, flight number (for
              airport transfers), vehicle preference, passenger and luggage
              count, and any special requests — such as child seats,
              accessibility needs, or event-specific instructions — that you
              share with us.
            </p>
            <h3 className="mt-6 font-display text-lg text-obsidian">Contact &amp; Enquiry Data</h3>
            <p className="mt-3">
              When you contact us through our website&apos;s contact form, by
              phone, or via WhatsApp, we collect the information you provide
              in that conversation — such as your name, contact details, and
              the content of your enquiry — so that we can respond to you and
              keep a record of the exchange for quality and reference
              purposes.
            </p>
            <h3 className="mt-6 font-display text-lg text-obsidian">Corporate Account Data</h3>
            <p className="mt-3">
              For clients who set up a standing corporate account, we
              additionally collect company details, authorized booking
              contacts, billing information, and a record of trips booked
              under that account, in order to manage invoicing and account
              administration.
            </p>
            <h3 className="mt-6 font-display text-lg text-obsidian">Payment Information</h3>
            <p className="mt-3">
              Where payment is made online, card and payment details are
              processed directly by our payment processing partners under
              their own security standards; we do not store full card
              numbers on our own systems.
            </p>
            <h3 className="mt-6 font-display text-lg text-obsidian">Automatically Collected Data</h3>
            <p className="mt-3">
              Like most websites, we may automatically collect limited
              technical information — such as browser type, device type,
              approximate location, and general usage patterns — through
              cookies and similar technologies, as described in the Cookies
              Policy below.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">3. How We Use Your Information</h2>
            <ul className="mt-4 space-y-2">
              {[
                "To confirm, manage, and fulfil your booking or quote request, including matching you with an appropriate vehicle and chauffeur",
                "To communicate with you about your trip, including flight-tracking updates, driver details, and timing changes",
                "To respond to enquiries submitted via our contact form, phone, or WhatsApp",
                "To maintain records for invoicing, receipts, and corporate accounts",
                "To coordinate multi-vehicle bookings for events, weddings, and VIP or delegation transport",
                "To meet our safety, insurance, and regulatory obligations as a licensed transportation provider",
                "To improve our website, services, and the overall client experience",
                "To comply with applicable legal and regulatory obligations in the UAE",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">4. Cookies &amp; Similar Technologies</h2>
            <p className="mt-4">
              Our website may use cookies and similar technologies to
              remember preferences, understand how visitors use the site,
              measure the effectiveness of our content, and improve
              performance. This may include essential cookies required for
              the site to function, and analytics cookies that help us
              understand which pages and services visitors find most useful.
              You can control or disable cookies through your browser
              settings at any time; doing so may affect certain features of
              the site, such as saved preferences.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">5. Sharing of Information</h2>
            <p className="mt-4">
              We do not sell your personal data. We may share limited booking
              information with the chauffeur assigned to your trip (such as
              your name, pickup location, and flight number), and with
              service providers who support our operations — including
              communication tools, payment processors, and, where relevant,
              partner vehicle operators supporting a large multi-vehicle
              booking. These parties are only given the information
              necessary to perform their function and are expected to
              handle it securely. We may also disclose information where
              required by law, by a competent UAE authority, or to protect
              the safety of our clients, chauffeurs, or the public.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">6. International Data Transfers</h2>
            <p className="mt-4">
              Some of the third-party tools we use to operate our website and
              communicate with clients — such as hosting, email, or
              messaging providers — may store or process data outside the
              UAE. Where this occurs, we take reasonable steps to ensure
              those providers maintain an appropriate standard of data
              protection consistent with this policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">7. Data Retention</h2>
            <p className="mt-4">
              We retain booking, contact, and corporate account data for as
              long as necessary to fulfil the purposes described in this
              policy, including ongoing corporate accounts and standing
              client relationships, and to meet legal, accounting, insurance,
              or regulatory record-keeping requirements. When data is no
              longer required for these purposes, we take reasonable steps to
              delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">8. Your Rights</h2>
            <p className="mt-4">
              Depending on your location, you may have the right to access,
              correct, delete, or restrict the use of your personal data, to
              object to certain processing, and to request a copy of the data
              we hold about you in a portable format. Corporate clients may
              also request confirmation of what data is held for their
              authorized booking contacts. To exercise any of these rights,
              contact us using the details in Section 12 below — we will
              respond within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">9. Data Security</h2>
            <p className="mt-4">
              We take reasonable technical and organizational measures to
              protect your personal data against unauthorized access, loss,
              alteration, or misuse, including restricting access to booking
              and contact data to team members who need it to do their job.
              No method of transmission or storage is completely secure, and
              while we work to protect your information, we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">10. Children&apos;s Privacy</h2>
            <p className="mt-4">
              Our website and booking services are intended for use by
              adults arranging chauffeur transportation, including on behalf
              of family members and children as passengers. We do not
              knowingly collect personal data directly from children through
              our website.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">11. Changes to This Policy</h2>
            <p className="mt-4">
              We may update this Privacy Policy from time to time to reflect
              changes in our services, technology, or legal obligations. Any
              changes will be posted on this page with a revised &quot;Last
              updated&quot; date, and material changes will be highlighted where
              appropriate.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">12. Contact Us</h2>
            <p className="mt-4">
              For any questions about this Privacy Policy, to exercise your
              data rights, or to raise a concern about how your data is
              handled, contact us at{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="text-obsidian underline underline-offset-4 transition-colors hover:text-gold-deep"
              >
                {SITE.email}
              </a>{" "}
              or {SITE.phoneDisplay}. Our team is available 24/7 to assist
              with booking-related queries and during standard business
              hours for data protection enquiries.
            </p>
          </section>
        </div>
      </Container>
    </Section>
    </>
  );
}
