import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Terms & Conditions",
    description:
      "Terms and conditions for Apex Limo & Chauffeur Dubai, covering bookings, cancellations, refunds, payments, chauffeur services, client responsibilities, liability, and service availability across Dubai and the UAE.",
    path: "/terms",
  });
}

const LAST_UPDATED = "July 9, 2026";

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Terms & Conditions", path: "/terms" }])),
        }}
      />
      <Section tone="ivory" separator={false}>
      <Container className="max-w-3xl">
        <span className="label-eyebrow text-graphite">Legal</span>
        <h1 className="mt-4 font-display text-3xl text-obsidian sm:text-5xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-xs uppercase tracking-wide text-graphite">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-graphite sm:text-base">
          These Terms &amp; Conditions govern your use of the {SITE.name}{" "}
          website and your booking of any chauffeur-driven transportation
          service with us, including airport transfers, corporate chauffeur
          service, luxury and VIP transportation, event transportation, and
          wedding chauffeur service across Dubai and the wider UAE. By
          requesting a quote, making a booking, or otherwise engaging our
          services, you agree to be bound by these terms.
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-graphite sm:text-base">
          <section>
            <h2 className="font-display text-2xl text-obsidian">1. Bookings</h2>
            <p className="mt-4">
              By requesting a quote or booking a chauffeur service with{" "}
              {SITE.name}, you confirm that the details provided — including
              pickup and drop-off locations, date, time, flight number where
              applicable, vehicle selection, and passenger and luggage count —
              are accurate to the best of your knowledge. A booking is
              considered confirmed only once you receive confirmation from
              our team by phone, email, or WhatsApp, referencing your booking
              reference number; a submitted enquiry or quote request alone
              does not constitute a confirmed booking.
            </p>
            <p className="mt-4">
              Bookings may be made for a one-way or return airport transfer,
              hourly or full-day hire, a multi-vehicle event or wedding
              booking, or a standing corporate account. Where a booking
              involves multiple vehicles or an extended itinerary, final
              vehicle assignments and timing are confirmed directly with your
              point of contact ahead of the trip.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">2. Cancellations</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Cancellations made more than 24 hours before scheduled pickup are eligible for a full refund or free rescheduling.",
                "Cancellations made within 24 hours of scheduled pickup may be subject to a cancellation fee, communicated at the time of booking.",
                "No-shows, where the client cannot be reached or located at the confirmed pickup point within the applicable waiting time, may be charged in full.",
                "Weddings, events, and multi-vehicle bookings may carry a separate cancellation policy — including a longer notice period or a non-refundable deposit — confirmed in writing at the time of booking.",
                "Corporate accounts may cancel or amend standing bookings under the notice terms agreed when the account was set up.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">3. Refunds</h2>
            <p className="mt-4">
              Where a cancellation qualifies for a refund under Section 2
              above, or where {SITE.name} is unable to fulfil a confirmed
              booking due to circumstances within our control, any amount
              already paid will be refunded to the original payment method
              within a reasonable timeframe, typically within 5–10 business
              days depending on the payment method and provider. Deposits
              paid for weddings, events, or multi-vehicle bookings may be
              non-refundable once a specific vehicle or date has been
              reserved on your behalf, as disclosed at the time of booking.
              Refund requests should be sent to the contact details in
              Section 12 with your booking reference number.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">4. Payments</h2>
            <p className="mt-4">
              Pricing is confirmed at the time of booking or quote and is
              fixed for the agreed itinerary, except where the scope of the
              trip changes — such as additional stops, extended waiting time,
              extra hours, or an added vehicle. Standard toll charges are
              included in quoted city-transfer pricing. Corporate accounts
              may be invoiced monthly under separately agreed terms rather
              than paying per trip. Accepted payment methods (card, bank
              transfer, or cash for select bookings) are confirmed at the
              time of booking, and a deposit may be requested for larger
              event, wedding, or multi-vehicle bookings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">5. Chauffeur Services</h2>
            <p className="mt-4">
              Every booking is fulfilled by a professional, licensed
              chauffeur employed or contracted by {SITE.name}; none of our
              vehicles are made available for self-drive hire. Chauffeurs are
              trained in professional etiquette, discretion, and safe
              driving, and are expected to conduct themselves accordingly on
              every trip. While we make every reasonable effort to assign the
              specific vehicle model requested, {SITE.name} reserves the
              right to substitute a comparable or superior vehicle in the
              event of unforeseen mechanical issues, maintenance
              requirements, or operational necessity, without reducing the
              standard of service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">6. Waiting Time Policy</h2>
            <p className="mt-4">
              For airport pickups, complimentary waiting time is included to
              account for immigration and baggage claim, tracked from actual
              flight landing time via live flight tracking rather than the
              originally scheduled landing time. For all other pickups, a
              short complimentary grace period is included from the
              scheduled pickup time. Waiting time beyond the complimentary
              period may be charged at an hourly rate, communicated at the
              time of booking or on request.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">7. Airport Transfer Terms</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Flight numbers must be provided at the time of booking so we can track your flight for arrivals.",
                "Pickup time for arrivals is calculated automatically based on live flight tracking, not the originally scheduled landing time.",
                "For departures, clients should be ready at the confirmed pickup time to allow for check-in and security at the airport.",
                "Meet-and-greet service includes name signage in the arrivals hall and assistance with luggage to the vehicle.",
                "Coverage includes Dubai International Airport (DXB) and Al Maktoum International (DWC), and other UAE airports on request.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">8. Client Responsibilities</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Provide accurate contact details, locations, and timing at the time of booking, and update us promptly if any of these change.",
                "Ensure passenger count and luggage do not exceed the selected vehicle's stated capacity.",
                "Behave respectfully toward chauffeurs; abusive, unsafe, or unlawful behavior may result in the trip being ended without a refund.",
                "Inform us in advance of any special requirements, such as child seats, accessibility needs, or event-specific instructions.",
                "Be responsible for the conduct of all passengers travelling under a single booking, including any damage caused to the vehicle.",
                "Comply with all applicable laws while travelling, including seatbelt use and any restrictions communicated by the chauffeur for safety reasons.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">9. Service Availability</h2>
            <p className="mt-4">
              Chauffeur and booking services are available 24 hours a day,
              seven days a week, including public holidays, across Dubai and
              the wider UAE. While we make every effort to honor confirmed
              bookings without exception, availability of a specific vehicle
              model cannot be guaranteed for same-day or last-minute
              requests, and may be more limited during peak periods such as
              major public holidays or large city-wide events. {SITE.name}{" "}
              is not liable for delays or service interruptions caused by
              circumstances beyond our reasonable control, including but not
              limited to severe weather, road closures, force majeure
              events, or actions of third parties such as airport or airline
              operations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">10. Liability</h2>
            <p className="mt-4">
              {SITE.name} carries commercial insurance for its fleet and
              chauffeurs, covering passenger transport in the ordinary course
              of business. Our liability for any claim arising from a
              booking is limited to the value of that booking, except where
              liability cannot be limited or excluded under applicable UAE
              law (such as liability for death or personal injury caused by
              negligence). We are not liable for indirect or consequential
              losses, including missed flights, connections, or events,
              except where such loss arises directly from our own
              negligence in providing the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">11. Governing Law</h2>
            <p className="mt-4">
              These terms are governed by the laws of the United Arab
              Emirates, and any disputes arising from or in connection with a
              booking will be subject to the exclusive jurisdiction of the
              courts of Dubai.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-obsidian">12. Contact Us</h2>
            <p className="mt-4">
              For questions about these Terms &amp; Conditions, or to discuss
              a specific booking, cancellation, or refund, contact us at{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="text-obsidian underline underline-offset-4 transition-colors hover:text-gold-deep"
              >
                {SITE.email}
              </a>{" "}
              or {SITE.phoneDisplay}, available 24/7.
            </p>
          </section>
        </div>
      </Container>
    </Section>
    </>
  );
}
