import type { Metadata } from "next";
import { Info } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import Card from "@/components/shared/Card";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Terms & Conditions",
    description:
      "Terms and conditions for Apex Limo & Chauffeur Dubai, including booking terms, cancellation policy, waiting time policy, airport transfer terms, and payment terms.",
    path: "/terms",
  });
}

const LAST_UPDATED = "July 9, 2026";

export default function TermsPage() {
  return (
    <Section tone="ivory" separator={false}>
      <Container className="max-w-3xl">
        <span className="label-eyebrow text-graphite">Legal</span>
        <h1 className="mt-4 font-display text-3xl text-obsidian sm:text-5xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-xs uppercase tracking-wide text-graphite">
          Last updated: {LAST_UPDATED}
        </p>

        <Card tone="light" className="mt-8 flex items-start gap-3 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} />
          <p className="text-sm leading-relaxed text-graphite">
            This page is a template and does not constitute legal advice.
            Before publishing, have these terms reviewed by qualified legal
            counsel to confirm they meet applicable UAE consumer protection
            and transportation regulations, and reflect your actual
            operating policies.
          </p>
        </Card>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-graphite sm:text-base">
          <section>
            <h2 className="font-display text-2xl text-obsidian">1. Booking Terms</h2>
            <p className="mt-4">
              By booking a chauffeur service with {SITE.name}, you confirm
              that the details provided — including pickup and drop-off
              locations, date, time, vehicle selection, and passenger count —
              are accurate. A booking is considered confirmed once you
              receive confirmation from our team by phone, email, or
              WhatsApp, referencing your booking reference number.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">2. Cancellation Policy</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Cancellations made more than 24 hours before pickup are eligible for a full refund or free rescheduling.",
                "Cancellations made within 24 hours of pickup may be subject to a cancellation fee.",
                "No-shows, where the client is not reachable at the pickup location, may be charged in full.",
                "Weddings and event bookings may carry a separate cancellation policy, confirmed at the time of booking.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">3. Waiting Time Policy</h2>
            <p className="mt-4">
              For airport pickups, complimentary waiting time is included to
              account for immigration and baggage claim, tracked from actual
              flight landing time. For all other pickups, a short
              complimentary grace period is included from the scheduled
              pickup time. Waiting time beyond the complimentary period may
              be charged at an hourly rate, communicated at the time of
              booking or on request.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">4. Airport Transfer Terms</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Flight numbers must be provided at the time of booking so we can track your flight.",
                "Pickup time for arrivals is calculated automatically based on live flight tracking, not the originally scheduled landing time.",
                "For departures, clients should be ready at the confirmed pickup time to allow for check-in and security at the airport.",
                "Meet-and-greet service includes name signage in the arrivals hall and assistance with luggage to the vehicle.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">5. Customer Responsibilities</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Provide accurate contact details, locations, and timing at the time of booking.",
                "Ensure passenger count and luggage do not exceed the selected vehicle's capacity.",
                "Behave respectfully toward chauffeurs; abusive or unsafe behavior may result in the trip being ended.",
                "Inform us in advance of any special requirements, such as child seats or accessibility needs.",
                "Be responsible for the conduct of all passengers travelling under a single booking.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">6. Payment Terms</h2>
            <p className="mt-4">
              Pricing is confirmed at the time of booking or quote and is
              fixed for the agreed itinerary, except where the scope of the
              trip changes (such as additional stops, extended waiting time,
              or extra hours). Corporate accounts may be invoiced monthly
              under separately agreed terms. Accepted payment methods are
              confirmed at the time of booking.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">7. Liability</h2>
            <p className="mt-4">
              {SITE.name} carries commercial insurance for its fleet and
              chauffeurs. Our liability for any claim arising from a booking
              is limited to the value of that booking, except where liability
              cannot be limited under applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">8. Governing Law</h2>
            <p className="mt-4">
              These terms are governed by the laws of the United Arab
              Emirates, and any disputes will be subject to the exclusive
              jurisdiction of the courts of Dubai.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">9. Contact Us</h2>
            <p className="mt-4">
              For questions about these Terms &amp; Conditions, contact us at{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="text-obsidian underline underline-offset-4 transition-colors hover:text-gold-deep"
              >
                {SITE.email}
              </a>{" "}
              or {SITE.phoneDisplay}.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
