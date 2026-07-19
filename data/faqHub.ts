import { FAQS as HOME_FAQS } from "./faqs";
import { SERVICES } from "./services";
import { LOCATIONS } from "./locations";

export interface FaqCategory {
  key: string;
  label: string;
  /** Shown on a filter chip. Omit to keep a category out of the chip row (still visible under "All"). */
  chipLabel?: string;
}

export interface FaqHubEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  { key: "booking", label: "Booking", chipLabel: "Booking" },
  { key: "airport-transfers", label: "Airport Transfers", chipLabel: "Airport Transfers" },
  { key: "pricing", label: "Pricing", chipLabel: "Pricing" },
  { key: "fleet", label: "Fleet", chipLabel: "Fleet" },
  { key: "corporate-travel", label: "Corporate Travel", chipLabel: "Corporate" },
  { key: "wedding-chauffeurs", label: "Wedding Chauffeurs", chipLabel: "Wedding" },
  { key: "vip-transportation", label: "VIP Transportation", chipLabel: "VIP" },
  { key: "locations", label: "Locations", chipLabel: "Locations" },
  { key: "safety", label: "Safety" },
  { key: "general-questions", label: "General Questions" },
];

/**
 * 100 hub-specific FAQs, ~10 per category, covering ground the individual
 * service/location pages don't already answer (cancellations, payment
 * methods, child seats, NDAs, loyalty, etc). Merged below with every FAQ
 * already written for the homepage, services, and locations, so this page
 * is a genuinely complete knowledge base rather than a duplicate of it.
 */
const NEW_FAQS: FaqHubEntry[] = [
  // Booking
  {
    id: "booking-1",
    category: "booking",
    question: "How do I book a chauffeur with Apex Limo?",
    answer:
      "Book directly through our website, via WhatsApp, or by calling our team — all three routes reach the same booking system and are confirmed within minutes.",
  },
  {
    id: "booking-2",
    category: "booking",
    question: "Can I book a chauffeur online, or do I need to call?",
    answer:
      "Both. Our website lets you book and pay online in a few steps, or you can message us on WhatsApp if you'd rather confirm the details with a person directly.",
  },
  {
    id: "booking-3",
    category: "booking",
    question: "How far in advance do I need to book?",
    answer:
      "We recommend at least 24 hours' notice for standard transfers, and 1–3 weeks ahead for weddings, events, or peak season.",
  },
  {
    id: "booking-4",
    category: "booking",
    question: "Can I make a same-day booking?",
    answer:
      "Yes, subject to vehicle and chauffeur availability — WhatsApp us for the fastest same-day confirmation.",
  },
  {
    id: "booking-5",
    category: "booking",
    question: "Can I modify my booking after it's confirmed?",
    answer:
      "Yes, changes to pickup time, location, or vehicle can be made up until shortly before the booking — contact us as soon as your plans change.",
  },
  {
    id: "booking-6",
    category: "booking",
    question: "What is your cancellation policy?",
    answer:
      "Cancellations made with reasonable notice are not charged; late cancellations close to pickup time may incur a fee — full details are confirmed at booking.",
  },
  {
    id: "booking-7",
    category: "booking",
    question: "Do I need to create an account to book?",
    answer:
      "No account is required — you can book as a guest each time, though returning clients often set up a simple profile for faster future bookings.",
  },
  {
    id: "booking-8",
    category: "booking",
    question: "Can I book on behalf of someone else, like a guest arriving separately?",
    answer:
      "Yes, you can book and pay for a chauffeur on behalf of a guest, family member, or colleague — just provide their contact details so the chauffeur can reach them directly.",
  },
  {
    id: "booking-9",
    category: "booking",
    question: "What information do I need to provide when booking?",
    answer:
      "Pickup location and time, destination, number of passengers and luggage, and your preferred vehicle — flight details too, for airport transfers.",
  },
  {
    id: "booking-10",
    category: "booking",
    question: "Can I set up a recurring or standing booking?",
    answer:
      "Yes, standing weekly or recurring bookings are common for corporate clients and regular airport travelers — set this up directly with our team.",
  },

  // Airport Transfers
  {
    id: "airport-transfers-1",
    category: "airport-transfers",
    question: "How do airport transfers work with Apex Limo?",
    answer:
      "You share your flight number and pickup or drop-off details when booking; we track the flight, position your chauffeur accordingly, and handle the rest.",
  },
  {
    id: "airport-transfers-2",
    category: "airport-transfers",
    question: "Do you track delayed flights?",
    answer:
      "Yes, every airport transfer includes live flight tracking, so delays and early arrivals are handled automatically at no extra cost.",
  },
  {
    id: "airport-transfers-3",
    category: "airport-transfers",
    question: "Can I pre-book airport pickups weeks in advance?",
    answer:
      "Yes, airport transfers can be booked weeks or months ahead — useful for confirmed travel plans and recurring business trips.",
  },
  {
    id: "airport-transfers-4",
    category: "airport-transfers",
    question: "What vehicles are available for airport transfers?",
    answer:
      "Executive sedans like the S-Class for solo and couple travel, V-Class and Escalade for groups and luggage, and Rolls-Royce options for a special arrival.",
  },
  {
    id: "airport-transfers-5",
    category: "airport-transfers",
    question: "Is there a waiting time included if my flight is early?",
    answer:
      "Yes, a reasonable waiting period is included if your flight lands early; your chauffeur is typically already positioned before scheduled landing.",
  },
  {
    id: "airport-transfers-6",
    category: "airport-transfers",
    question: "Do you charge extra for late-night or early-morning airport pickups?",
    answer: "No, our pricing is fixed and covers 24/7 availability regardless of pickup time.",
  },
  {
    id: "airport-transfers-7",
    category: "airport-transfers",
    question: "Can you pick me up from a private jet terminal?",
    answer:
      "Yes, we coordinate private jet terminal pickups at both DXB and DWC — let us know your terminal and timing in advance.",
  },
  {
    id: "airport-transfers-8",
    category: "airport-transfers",
    question: "How will my chauffeur find me at arrivals?",
    answer: "Your chauffeur waits in the arrivals hall holding name signage, positioned before your flight lands.",
  },
  {
    id: "airport-transfers-9",
    category: "airport-transfers",
    question: "Do you offer airport transfers to hotels outside central Dubai?",
    answer: "Yes, we cover hotels and residences across Dubai and the wider UAE, not just central areas.",
  },
  {
    id: "airport-transfers-10",
    category: "airport-transfers",
    question: "Can I book a return airport transfer in one booking?",
    answer:
      "Yes, round-trip airport bookings can be arranged in a single booking, with separate confirmed times for departure and return.",
  },

  // Pricing
  {
    id: "pricing-1",
    category: "pricing",
    question: "How is chauffeur pricing calculated?",
    answer:
      "Pricing is based on vehicle class, trip type (transfer, hourly, or full-day), and distance or duration — quoted clearly before you confirm.",
  },
  {
    id: "pricing-2",
    category: "pricing",
    question: "Are there any hidden fees?",
    answer:
      "No, the price you're quoted is the price you pay — no surge pricing, no surprise charges for traffic or minor delays.",
  },
  {
    id: "pricing-3",
    category: "pricing",
    question: "Do prices change based on traffic or delays?",
    answer: "No, our fixed pricing holds regardless of traffic conditions or reasonable flight delays.",
  },
  {
    id: "pricing-4",
    category: "pricing",
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit and debit cards online, along with bank transfer and cash for select bookings — details are confirmed at checkout.",
  },
  {
    id: "pricing-5",
    category: "pricing",
    question: "Is a deposit required to confirm a booking?",
    answer:
      "Most bookings can be confirmed without a deposit; larger events, weddings, or multi-vehicle bookings may require a partial deposit.",
  },
  {
    id: "pricing-6",
    category: "pricing",
    question: "Do you offer discounts for long-term or recurring bookings?",
    answer:
      "Yes, corporate accounts and regular clients on standing bookings receive preferential rates — ask our team when setting up an account.",
  },
  {
    id: "pricing-7",
    category: "pricing",
    question: "Are toll charges (Salik) included in the price?",
    answer: "Yes, standard toll charges are included in your quoted price for city transfers.",
  },
  {
    id: "pricing-8",
    category: "pricing",
    question: "Is gratuity included in the quoted price?",
    answer: "Gratuity is not automatically included and is left entirely to your discretion.",
  },
  {
    id: "pricing-9",
    category: "pricing",
    question: "Can I get a fixed quote before booking?",
    answer:
      "Yes, request a quote online or via WhatsApp with your trip details, and we'll confirm an exact fixed price before you book.",
  },
  {
    id: "pricing-10",
    category: "pricing",
    question: "Do prices differ between weekdays and weekends?",
    answer:
      "Standard pricing stays the same across the week; peak seasons and public holidays may carry a seasonal rate, confirmed at booking.",
  },

  // Fleet
  {
    id: "fleet-1",
    category: "fleet",
    question: "What is the full range of vehicles in your fleet?",
    answer:
      "Our fleet spans the Mercedes S-Class and V-Class, BMW 7 Series, Cadillac Escalade, Range Rover Autobiography, and Rolls-Royce Ghost and Phantom.",
  },
  {
    id: "fleet-2",
    category: "fleet",
    question: "What is the difference between the S-Class and the Rolls-Royce Phantom?",
    answer:
      "The S-Class is a quiet, comfortable executive sedan suited to daily business and airport travel; the Phantom is a larger, more ceremonial vehicle chosen for weddings and standout arrivals.",
  },
  {
    id: "fleet-3",
    category: "fleet",
    question: "Can I request a specific vehicle color or model year?",
    answer:
      "Specific color or model-year requests can be accommodated where fleet availability allows — mention your preference when booking.",
  },
  {
    id: "fleet-4",
    category: "fleet",
    question: "How many passengers can your largest vehicle carry?",
    answer: "Our largest standard vehicle, the Mercedes V-Class, comfortably seats up to seven passengers with luggage.",
  },
  {
    id: "fleet-5",
    category: "fleet",
    question: "Do your vehicles have Wi-Fi?",
    answer: "Most vehicles offer complimentary Wi-Fi on request — confirm availability for your specific vehicle when booking.",
  },
  {
    id: "fleet-6",
    category: "fleet",
    question: "Are child seats available on request?",
    answer: "Yes, child seats are available on request at no extra charge — please specify the child's age when booking.",
  },
  {
    id: "fleet-7",
    category: "fleet",
    question: "How much luggage can your vehicles hold?",
    answer:
      "Sedans comfortably handle two to three large suitcases; the V-Class and Escalade handle significantly more, suited to family or group travel.",
  },
  {
    id: "fleet-8",
    category: "fleet",
    question: "Are your vehicles regularly serviced and inspected?",
    answer: "Yes, every vehicle is inspected and serviced on a strict schedule and carries full commercial insurance.",
  },
  {
    id: "fleet-9",
    category: "fleet",
    question: "Can I see photos of the exact vehicle before booking?",
    answer:
      "Vehicle photos are available on our Fleet page for each model; the exact unit assigned may vary slightly within that model line.",
  },
  {
    id: "fleet-10",
    category: "fleet",
    question: "Is a non-smoking policy enforced in all vehicles?",
    answer: "Yes, all Apex vehicles are strictly non-smoking.",
  },

  // Corporate Travel
  {
    id: "corporate-travel-1",
    category: "corporate-travel",
    question: "How do I set up a corporate account?",
    answer:
      "Contact our team to discuss your typical volume and preferred vehicles; we'll set up monthly invoicing and priority booking for your account.",
  },
  {
    id: "corporate-travel-2",
    category: "corporate-travel",
    question: "Can we get a single monthly invoice for all our trips?",
    answer: "Yes, all trips under a standing corporate account are consolidated onto one itemized monthly invoice.",
  },
  {
    id: "corporate-travel-3",
    category: "corporate-travel",
    question: "Do you offer discounted rates for high booking volumes?",
    answer:
      "Yes, corporate accounts with higher booking volumes receive preferential rates — discussed when the account is set up.",
  },
  {
    id: "corporate-travel-4",
    category: "corporate-travel",
    question: "Can our HR or travel team manage bookings for multiple employees?",
    answer:
      "Yes, your HR or travel team can book on behalf of multiple employees under one account, with individual trip details for each.",
  },
  {
    id: "corporate-travel-5",
    category: "corporate-travel",
    question: "Are your chauffeurs trained to handle confidential business discussions?",
    answer: "Yes, all chauffeurs are trained in professional discretion and confidentiality for business travel.",
  },
  {
    id: "corporate-travel-6",
    category: "corporate-travel",
    question: "Can you provide transport for visiting international clients?",
    answer:
      "Yes, we regularly handle transport for visiting clients and delegations, including airport meet-and-greet and city transfers.",
  },
  {
    id: "corporate-travel-7",
    category: "corporate-travel",
    question: "Do you support roadshow logistics across multiple offices in one day?",
    answer: "Yes, multi-stop roadshow logistics across several offices in one day is one of our most common corporate bookings.",
  },
  {
    id: "corporate-travel-8",
    category: "corporate-travel",
    question: "Can a corporate account include airport transfers for visiting staff?",
    answer:
      "Yes, airport transfers for visiting staff can be added to an existing corporate account and billed on the same invoice.",
  },
  {
    id: "corporate-travel-9",
    category: "corporate-travel",
    question: "Is there a dedicated account manager for corporate clients?",
    answer: "Yes, corporate accounts are assigned dedicated support rather than a different contact for every booking.",
  },
  {
    id: "corporate-travel-10",
    category: "corporate-travel",
    question: "Can we request the same chauffeur for all our bookings?",
    answer:
      "Yes, we assign a small pool of familiar chauffeurs to corporate accounts wherever possible, so drivers learn your routine.",
  },

  // Wedding Chauffeurs
  {
    id: "wedding-chauffeurs-1",
    category: "wedding-chauffeurs",
    question: "How early should we book our wedding transportation?",
    answer:
      "We recommend booking 2–3 weeks ahead at minimum, and earlier during peak wedding season, since popular vehicles are reserved well in advance.",
  },
  {
    id: "wedding-chauffeurs-2",
    category: "wedding-chauffeurs",
    question: "Can you provide a bridal car separate from the guest convoy?",
    answer: "Yes, the bridal car and guest convoy are planned as separate coordinated vehicles, timed against your ceremony schedule.",
  },
  {
    id: "wedding-chauffeurs-3",
    category: "wedding-chauffeurs",
    question: "Do you offer decoration options for wedding vehicles?",
    answer: "Yes, simple ribbon and floral decoration is available on request — let your planner or our team know in advance.",
  },
  {
    id: "wedding-chauffeurs-4",
    category: "wedding-chauffeurs",
    question: "Can the chauffeur wait at the venue throughout the ceremony?",
    answer: "Yes, your chauffeur and vehicle wait on-site throughout the ceremony, ready for departure whenever you are.",
  },
  {
    id: "wedding-chauffeurs-5",
    category: "wedding-chauffeurs",
    question: "Do you offer a rehearsal for wedding-day timing?",
    answer: "Yes, every wedding booking includes a timing rehearsal with your planner ahead of the day.",
  },
  {
    id: "wedding-chauffeurs-6",
    category: "wedding-chauffeurs",
    question: "Can you coordinate transport across multiple wedding events (henna, ceremony, reception)?",
    answer:
      "Yes, we can coordinate transport across multiple wedding events over several days, from a henna night to the main ceremony and reception.",
  },
  {
    id: "wedding-chauffeurs-7",
    category: "wedding-chauffeurs",
    question: "What happens if our wedding runs over schedule?",
    answer:
      "Our chauffeurs plan buffer time in advance and adjust calmly if the schedule runs behind, so a delay doesn't disrupt departure.",
  },
  {
    id: "wedding-chauffeurs-8",
    category: "wedding-chauffeurs",
    question: "Can we book a vehicle for the getaway after the reception?",
    answer: "Yes, a separate vehicle for the getaway or a later departure can be booked alongside your main wedding transport.",
  },
  {
    id: "wedding-chauffeurs-9",
    category: "wedding-chauffeurs",
    question: "Do you provide chauffeurs in formal attire for weddings?",
    answer: "Yes, chauffeurs assigned to weddings dress in formal attire matching the occasion.",
  },
  {
    id: "wedding-chauffeurs-10",
    category: "wedding-chauffeurs",
    question: "Is the Rolls-Royce Phantom available for same-day bookings during peak wedding season?",
    answer:
      "Availability is limited during peak season and fills quickly — we strongly recommend booking well ahead rather than relying on same-day availability.",
  },

  // VIP Transportation
  {
    id: "vip-transportation-1",
    category: "vip-transportation",
    question: "What is included in VIP transportation service?",
    answer:
      "Advance route planning, vetted chauffeurs, coordinated convoy options, and a single point of contact managing the entire booking.",
  },
  {
    id: "vip-transportation-2",
    category: "vip-transportation",
    question: "How do you ensure discretion for high-profile clients?",
    answer:
      "Booking details are shared only with team members directly involved, and we routinely work under non-disclosure arrangements when required.",
  },
  {
    id: "vip-transportation-3",
    category: "vip-transportation",
    question: "Can you arrange transport for a delegation with multiple vehicles?",
    answer: "Yes, we plan multi-vehicle delegation movements as one coordinated convoy, with a lead contact for planners.",
  },
  {
    id: "vip-transportation-4",
    category: "vip-transportation",
    question: "Do you sign non-disclosure agreements for sensitive bookings?",
    answer: "Yes, we're accustomed to signing NDAs for high-profile or confidentiality-sensitive bookings.",
  },
  {
    id: "vip-transportation-5",
    category: "vip-transportation",
    question: "Can VIP transportation include security-trained chauffeurs?",
    answer: "Yes, chauffeurs for VIP assignments are specifically vetted and briefed for discretion-sensitive work.",
  },
  {
    id: "vip-transportation-6",
    category: "vip-transportation",
    question: "How quickly can VIP transport be arranged for an unplanned visit?",
    answer:
      "We do our best to accommodate short-notice VIP requests, though advance booking allows for proper route and security planning.",
  },
  {
    id: "vip-transportation-7",
    category: "vip-transportation",
    question: "Can you coordinate airport arrivals for a VIP guest with press or public attention?",
    answer: "Yes, we can plan a discreet arrival route and timing specifically to manage press or public attention at the airport.",
  },
  {
    id: "vip-transportation-8",
    category: "vip-transportation",
    question: "Do you offer backup vehicles for VIP bookings?",
    answer: "Yes, backup vehicles are commonly arranged for high-profile bookings as part of the overall plan.",
  },
  {
    id: "vip-transportation-9",
    category: "vip-transportation",
    question: "Can a single contact manage the entire VIP transport plan?",
    answer:
      "Yes, a single dedicated Apex contact typically manages the full plan, liaising directly with your protocol or event team.",
  },
  {
    id: "vip-transportation-10",
    category: "vip-transportation",
    question: "Is VIP transportation available outside Dubai, elsewhere in the UAE?",
    answer: "Yes, VIP transportation can be arranged across the wider UAE, not only within Dubai.",
  },

  // Locations
  {
    id: "locations-1",
    category: "locations",
    question: "Which areas of Dubai do you cover?",
    answer:
      "We cover all of Dubai, including Downtown, Dubai Marina, Palm Jumeirah, Business Bay, JBR, and the surrounding business and residential districts.",
  },
  {
    id: "locations-2",
    category: "locations",
    question: "Do you provide chauffeur service outside Dubai, elsewhere in the UAE?",
    answer: "Yes, we serve destinations across the wider UAE, including Abu Dhabi, Sharjah, and other emirates on request.",
  },
  {
    id: "locations-3",
    category: "locations",
    question: "Can you pick up from any hotel in Dubai?",
    answer: "Yes, we cover every major hotel in Dubai, with drivers familiar with each property's designated pickup point.",
  },
  {
    id: "locations-4",
    category: "locations",
    question: "Do you serve both Dubai International Airport and Al Maktoum International?",
    answer: "Yes, both DXB and Al Maktoum International (DWC) are covered equally for arrivals and departures.",
  },
  {
    id: "locations-5",
    category: "locations",
    question: "Can you arrange transport to Abu Dhabi from Dubai?",
    answer: "Yes, intercity transfers to Abu Dhabi and back are a regular booking — timing and pricing are confirmed in advance.",
  },
  {
    id: "locations-6",
    category: "locations",
    question: "Do you cover residential villa communities as well as hotels?",
    answer: "Yes, we serve gated villa communities as well as hotels and apartment towers, coordinating access where needed.",
  },
  {
    id: "locations-7",
    category: "locations",
    question: "Is there an additional charge for pickups outside central Dubai?",
    answer:
      "Pricing reflects the actual distance and area, quoted clearly at booking — there's no separate surge fee for less central areas.",
  },
  {
    id: "locations-8",
    category: "locations",
    question: "Can you coordinate pickups from cruise terminals?",
    answer: "Yes, we coordinate pickups from Dubai's cruise terminal for arriving passengers and shore excursions.",
  },
  {
    id: "locations-9",
    category: "locations",
    question: "Do you serve both business districts and leisure destinations equally?",
    answer:
      "Yes, the same standard of vehicle and chauffeur applies whether the booking is a business district commute or a leisure destination.",
  },
  {
    id: "locations-10",
    category: "locations",
    question: "Can I request a chauffeur for a day trip beyond Dubai's city limits?",
    answer:
      "Yes, day trips beyond the city — to the desert, Abu Dhabi, or other emirates — can be arranged as an hourly or full-day booking.",
  },

  // Safety
  {
    id: "safety-1",
    category: "safety",
    question: "Are Apex Limo chauffeurs background-checked?",
    answer: "Yes, every chauffeur undergoes a formal background check before joining the team, alongside valid UAE commercial licensing.",
  },
  {
    id: "safety-2",
    category: "safety",
    question: "Are your vehicles insured for passenger travel?",
    answer: "Yes, every vehicle carries full commercial passenger insurance.",
  },
  {
    id: "safety-3",
    category: "safety",
    question: "Do you carry out regular vehicle safety inspections?",
    answer: "Yes, vehicles are inspected and serviced on a strict, recurring schedule rather than on an ad hoc basis.",
  },
  {
    id: "safety-4",
    category: "safety",
    question: "What happens in the event of a mechanical issue during a trip?",
    answer:
      "In the rare event of a mechanical issue, a replacement vehicle is dispatched as quickly as possible and your journey is prioritized.",
  },
  {
    id: "safety-5",
    category: "safety",
    question: "Are your chauffeurs trained in defensive driving?",
    answer: "Yes, all chauffeurs complete defensive driving and professional etiquette training before taking client bookings.",
  },
  {
    id: "safety-6",
    category: "safety",
    question: "Is there a way to track my chauffeur's location during the trip?",
    answer: "Yes, live trip tracking is available through your booking confirmation for added peace of mind.",
  },
  {
    id: "safety-7",
    category: "safety",
    question: "Do you have a policy for bad weather conditions?",
    answer: "Yes, chauffeurs adjust routes and timing for weather conditions, and safety takes priority over strict adherence to a schedule.",
  },
  {
    id: "safety-8",
    category: "safety",
    question: "Are seatbelts and child safety equipment available in every vehicle?",
    answer: "Yes, all vehicles are equipped with seatbelts for every seat, and child seats are available on request.",
  },
  {
    id: "safety-9",
    category: "safety",
    question: "How do you vet chauffeurs before hiring them?",
    answer:
      "Chauffeurs are vetted through licensing checks, background screening, and an in-house etiquette and safety training programme before joining.",
  },
  {
    id: "safety-10",
    category: "safety",
    question: "Is there 24/7 support if something goes wrong during a booking?",
    answer: "Yes, our support line is available 24/7 for any issue during an active booking.",
  },

  // General Questions
  {
    id: "general-questions-1",
    category: "general-questions",
    question: "What areas of business does Apex Limo & Chauffeur Dubai operate in?",
    answer:
      "We provide chauffeur-driven transportation across Dubai and the UAE — airport transfers, corporate travel, luxury and VIP transportation, event logistics, and wedding chauffeur service.",
  },
  {
    id: "general-questions-2",
    category: "general-questions",
    question: "Do you operate 24 hours a day, 7 days a week?",
    answer: "Yes, bookings are available 24 hours a day, seven days a week, including public holidays.",
  },
  {
    id: "general-questions-3",
    category: "general-questions",
    question: "Can I request a chauffeur who speaks a specific language?",
    answer:
      "Yes, many of our chauffeurs are multilingual — let us know your preference when booking and we'll match you where possible.",
  },
  {
    id: "general-questions-4",
    category: "general-questions",
    question: "Is Apex Limo a licensed transportation company in the UAE?",
    answer: "Yes, Apex Limo & Chauffeur Dubai operates as a fully licensed limousine and chauffeur service under UAE regulations.",
  },
  {
    id: "general-questions-5",
    category: "general-questions",
    question: "Can I leave feedback about my chauffeur or trip?",
    answer: "Yes, we welcome feedback after every trip — it helps us maintain consistency across the whole chauffeur team.",
  },
  {
    id: "general-questions-6",
    category: "general-questions",
    question: "Do you offer any loyalty or referral programme?",
    answer: "Recurring and corporate clients receive preferential rates; ask our team about referral arrangements for regular bookings.",
  },
  {
    id: "general-questions-7",
    category: "general-questions",
    question: "How can I contact Apex Limo directly?",
    answer:
      "Call or WhatsApp us directly, message us through the website, or email our bookings team — all listed on our Contact page.",
  },
  {
    id: "general-questions-8",
    category: "general-questions",
    question: "Can I change my pickup address after booking?",
    answer: "Yes, pickup address changes can be made up until shortly before your booking, subject to chauffeur availability.",
  },
  {
    id: "general-questions-9",
    category: "general-questions",
    question: "Do you provide services for tourists as well as residents?",
    answer:
      "Yes, we serve both visiting tourists and Dubai residents equally, from a single airport transfer to a standing weekly account.",
  },
  {
    id: "general-questions-10",
    category: "general-questions",
    question: "What makes Apex Limo different from a standard taxi or ride-hailing app?",
    answer:
      "A dedicated chauffeur and vehicle assigned specifically to you, fixed pricing with no surge charges, and a level of consistency and discretion a shared ride-hailing service isn't built to offer.",
  },
];

/** Maps each service slug to the hub category its FAQs belong under. */
const SERVICE_CATEGORY_MAP: Record<string, string> = {
  "airport-transfers": "airport-transfers",
  "corporate-chauffeur": "corporate-travel",
  "luxury-chauffeur": "fleet",
  "vip-transportation": "vip-transportation",
  "event-transportation": "corporate-travel",
  "wedding-chauffeur": "wedding-chauffeurs",
};

/** Homepage FAQs, in data/faqs.ts order, mapped to their nearest hub category. */
const HOME_CATEGORY_ORDER = [
  "booking",
  "airport-transfers",
  "fleet",
  "booking",
  "safety",
  "general-questions",
];

const serviceFaqs: FaqHubEntry[] = SERVICES.flatMap((service) =>
  service.faqs.map((faq, index) => ({
    id: `service-${service.slug}-${index}`,
    category: SERVICE_CATEGORY_MAP[service.slug] ?? "general-questions",
    question: faq.question,
    answer: faq.answer,
  }))
);

const locationFaqs: FaqHubEntry[] = LOCATIONS.flatMap((location) =>
  location.faqs.map((faq, index) => ({
    id: `location-${location.slug}-${index}`,
    category: "locations",
    question: faq.question,
    answer: faq.answer,
  }))
);

const homeFaqs: FaqHubEntry[] = HOME_FAQS.map((faq, index) => ({
  id: `home-${index}`,
  category: HOME_CATEGORY_ORDER[index] ?? "general-questions",
  question: faq.question,
  answer: faq.answer,
}));

/** Every FAQ on the site, merged into one searchable, categorized hub. */
export const ALL_FAQS: FaqHubEntry[] = [...NEW_FAQS, ...homeFaqs, ...serviceFaqs, ...locationFaqs];
