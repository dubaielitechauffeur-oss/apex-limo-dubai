import type { FAQItem } from "@/components/shared/FAQAccordion";

/**
 * FAQ set for the /services listing page — broader booking/policy
 * questions than the per-service FAQs in data/services.ts, and
 * distinct from the homepage's data/faqs.ts so each page has unique
 * FAQ content rather than repeating the same six questions.
 */
export const SERVICES_FAQS: FAQItem[] = [
  {
    question: "How do I book a chauffeur service in Dubai?",
    answer:
      "Book directly on our website, request an instant quote, or WhatsApp us with your trip details — pickup location, time, and vehicle preference. We confirm every booking with a named chauffeur and vehicle before your trip.",
  },
  {
    question: "How much does a chauffeur service cost?",
    answer:
      "Pricing depends on the vehicle, duration, and trip type — airport transfers and one-way trips are priced per journey, while city travel is available hourly or for a full day. Request a quote for an exact rate; there are no hidden fees or surge pricing.",
  },
  {
    question: "What types of vehicles are available?",
    answer:
      "Our fleet spans executive sedans (Mercedes S-Class, BMW 7 Series), SUVs (Range Rover, Cadillac Escalade), group vans (Mercedes V-Class), and ultra-luxury vehicles (Rolls-Royce Phantom) — matched to the occasion when you book.",
  },
  {
    question: "Do you track flights for airport pickups?",
    answer:
      "Yes. Every airport transfer includes live flight tracking, so your chauffeur adjusts pickup time automatically for early or delayed arrivals — at no extra charge.",
  },
  {
    question: "Which airports and terminals do you cover?",
    answer:
      "We serve both Dubai International Airport (DXB), all terminals, and Al Maktoum International Airport (DWC), with meet-and-greet and name-sign pickup in the arrivals hall.",
  },
  {
    question: "Can we set up a corporate account?",
    answer:
      "Yes, we set up standing corporate accounts with monthly invoicing, priority booking, and a dedicated account contact for HR and travel teams — ideal for regular business travel or staff transport.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Most bookings can be cancelled or rescheduled free of charge up to 12 hours before pickup. Later cancellations may incur a fee — full terms are confirmed at the time of booking.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards, bank transfer, and cash on request. Corporate accounts are billed via monthly invoice.",
  },
  {
    question: "Which areas of Dubai and the UAE do you serve?",
    answer:
      "We operate across all of Dubai — Downtown, Dubai Marina, Palm Jumeirah, Business Bay, and beyond — as well as intercity trips to Abu Dhabi, Sharjah, and other Emirates on request.",
  },
  {
    question: "Are your chauffeurs licensed and background-checked?",
    answer:
      "Yes. Every chauffeur holds a valid UAE commercial driving license, passes a background check, and is trained in professional etiquette, discretion, and defensive driving.",
  },
  {
    question: "How much luggage can each vehicle carry?",
    answer:
      "Sedans typically hold 2–3 standard suitcases plus carry-ons, SUVs 3–4, and vans up to 8. Let us know your luggage count when booking and we'll recommend the right vehicle.",
  },
  {
    question: "Are child seats available?",
    answer:
      "Yes, infant, toddler, and booster seats are available on request at no extra charge — just mention the child's age when booking so we fit the correct seat.",
  },
  {
    question: "Can I book a trip with multiple stops?",
    answer:
      "Absolutely. Multi-stop itineraries are common for corporate travel, city touring, and events — let your chauffeur or our booking team know your planned stops in advance.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend at least 24 hours ahead for standard transfers, and 2–3 weeks ahead for weddings, events, or peak season. Same-day bookings are often possible — WhatsApp us to check availability.",
  },
  {
    question: "Do you handle wedding and event transportation?",
    answer:
      "Yes — from a single bridal car to a fully coordinated convoy for the wedding party and guests, plus multi-vehicle fleets for conferences and galas. Every wedding or event booking includes a timing rehearsal with your planner.",
  },
  {
    question: "Is your service available 24/7?",
    answer:
      "Yes, chauffeurs and vehicles are available around the clock, including early flights, late-night events, and last-minute bookings.",
  },
];
