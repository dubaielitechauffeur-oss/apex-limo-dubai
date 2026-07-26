export type FleetCategory = "Sedan" | "SUV" | "Van" | "Ultra-Luxury";

export interface VehicleFAQ {
  question: string;
  answer: string;
}

export interface VehicleImage {
  src: string;
  alt: string;
}

/**
 * Real photography for a vehicle, in the exact order the photos should be
 * shown. Optional — vehicles without this field fall back to the existing
 * icon/gradient treatment, so adding photos for one vehicle never affects
 * the others. Index 0 is always the primary/hero image (used for the fleet
 * card cover and the vehicle detail page hero); any remaining entries are
 * gallery images shown in the same order they appear in the array.
 */
export type VehicleImages = VehicleImage[];

/**
 * Chauffeur-hire rates in AED shown on the homepage fleet carousel.
 *
 * ⚠️ PLACEHOLDER VALUES — the figures currently in this file are sample
 * prices based on typical Dubai chauffeur market rates, added for layout
 * review only. Replace every value with confirmed Apex Limo pricing
 * before treating them as real quotes.
 */
export interface VehicleRates {
  /** Full-day hire (10 hours), AED */
  tenHours: number;
  /** Half-day hire (5 hours), AED */
  fiveHours: number;
  /** Hourly hire (1 hour), AED */
  oneHour: number;
  /** Airport transfer (one way), AED */
  airport: number;
  /** Each additional hour beyond a booked package, AED */
  extraHour: number;
  /** Surcharge for an additional city/emirate on the same booking, AED */
  additionalCity: number;
}

export interface FleetVehicle {
  slug: string;
  name: string;
  /** Manufacturer label, e.g. "Rolls-Royce" — used for the carousel badge and brand bar. */
  brand: string;
  /** Model name without the brand, e.g. "Phantom" — used for the carousel model bar. */
  model: string;
  /** See VehicleRates — currently PLACEHOLDER sample figures. */
  rates: VehicleRates;
  category: FleetCategory;
  tagline: string;
  description: string;
  longDescription: string;
  passengers: number;
  luggage: number;
  idealFor: string;
  features: string[];
  whyChoose: string[];
  faqs: VehicleFAQ[];
  images?: VehicleImages;
  /**
   * Tasteful luxury status badge shown on the Fleet listing card — set on a
   * handful of standout vehicles only, not every entry, so it stays a
   * meaningful signal rather than clutter. e.g. "Executive Favorite",
   * "VIP Choice", "Most Popular", "Corporate Preferred", "Wedding Favorite".
   */
  badge?: string;
  /**
   * Marks an entry added to reach full fleet-listing coverage ahead of
   * real photography/copy being finalized. Placeholder vehicles render
   * with the existing icon/gradient gallery fallback (no `images`) and a
   * small "Preview" badge — swap in real photos and this flag can be
   * removed. Not rendered anywhere as a claim about vehicle availability.
   */
  isPlaceholder?: boolean;
}

export const FLEET: FleetVehicle[] = [
  {
    slug: "mercedes-maybach-s-class",
    brand: "Mercedes-Maybach",
    model: "S-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 5000, fiveHours: 3000, oneHour: 800, airport: 1000, extraHour: 650, additionalCity: 650 },
    images: [
      { src: "/images/fleet/mercedes-maybach-s-class/1.png", alt: "Mercedes-Maybach S-Class front three-quarter exterior view parked at a modern villa at sunset" },
      { src: "/images/fleet/mercedes-maybach-s-class/2.png", alt: "Mercedes-Maybach S-Class rear passenger seating with diamond-quilted leather and privacy curtains" },
      { src: "/images/fleet/mercedes-maybach-s-class/3.png", alt: "Mercedes-Maybach S-Class rear cabin detail with illuminated Maybach emblem and ambient lighting" },
    ],
    name: "Mercedes-Maybach S-Class",
    category: "Ultra-Luxury",
    tagline: "Maybach-level hush and presence",
    description:
      "The most exclusive sedan in the fleet — extended rear legroom, reclining executive seats, and a cabin engineered for complete calm on longer journeys.",
    longDescription:
      "The Maybach S-Class takes everything that makes the S-Class the executive standard and elevates it further — an extended wheelbase, fully reclining rear executive seats, and cabin insulation tuned for near-total silence. Reserved for clients who want the very top of the fleet.",
    passengers: 3,
    luggage: 2,
    idealFor: "Signature executive arrivals",
    features: [
      "Fully reclining rear executive seats",
      "Extended rear legroom",
      "Burmester premium sound system",
      "Rear-seat climate control",
      "Privacy glass with rear curtains",
      "Bespoke welcome amenities",
    ],
    whyChoose: [
      "The quietest, most spacious cabin in the fleet",
      "Fully reclining rear seats for genuinely restful longer journeys",
      "Reserved for clients seeking the most exclusive sedan available",
      "A natural choice for high-profile executive arrivals",
    ],
    faqs: [
      {
        question: "How is the Maybach S-Class different from the standard S-Class?",
        answer:
          "The Maybach adds an extended wheelbase, fully reclining rear executive seats, and additional sound insulation for an even quieter, more spacious ride.",
      },
      {
        question: "Is the Maybach S-Class available for airport transfers?",
        answer:
          "Yes, with the same live flight tracking and meet-and-greet service as the rest of the fleet.",
      },
      {
        question: "How far in advance should I book the Maybach S-Class?",
        answer:
          "As our most exclusive sedan, we recommend booking at least a few days ahead where possible to guarantee availability.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "rolls-royce-phantom",
    badge: "Wedding Favorite",
    brand: "Rolls-Royce",
    model: "Phantom Extended Wheelbase",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 9500, fiveHours: 5500, oneHour: 1500, airport: 2000, extraHour: 1200, additionalCity: 1200 },
    images: [
      { src: "/images/fleet/rolls-royce-phantom/1.png", alt: "Rolls-Royce Phantom Extended Wheelbase front three-quarter exterior view in a marble-floored showroom" },
      { src: "/images/fleet/rolls-royce-phantom/2.png", alt: "Rolls-Royce Phantom rear cabin with starlight headliner and embroidered Rolls-Royce headrests" },
      { src: "/images/fleet/rolls-royce-phantom/3.webp", alt: "Rolls-Royce Phantom rear armrest detail with crystal glasses and decanter" },
    ],
    name: "Rolls-Royce Phantom Extended Wheelbase",
    category: "Ultra-Luxury",
    tagline: "The pinnacle of arrival",
    description:
      "The most prestigious way to arrive in Dubai — reserved for weddings, milestone occasions, and clients who expect nothing less than the finest.",
    longDescription:
      "There's a reason the Phantom remains shorthand for arriving in style. Handcrafted, deliberate, and unmistakable, it's reserved for moments where the vehicle itself becomes part of the occasion — a wedding, an anniversary, a milestone worth marking properly.",
    passengers: 3,
    luggage: 2,
    idealFor: "Weddings & signature occasions",
    features: [
      "Handcrafted leather interior",
      "Starlight headliner",
      "Chauffeur in formal attire",
      "Red carpet service available",
      "Champagne chilling compartment",
      "Bespoke welcome amenities",
    ],
    whyChoose: [
      "The most recognized symbol of luxury arrival in Dubai",
      "Handcrafted interior with a signature starlight headliner",
      "Chauffeur in formal attire with optional red carpet service",
      "Reserved availability — book early to secure wedding dates",
    ],
    faqs: [
      {
        question: "How far in advance should I book the Rolls-Royce Phantom?",
        answer:
          "For weddings and peak dates, we recommend booking at least 2–3 weeks ahead, as the Phantom is our most requested vehicle.",
      },
      {
        question: "Does the Phantom include red carpet service?",
        answer: "Yes, red carpet service is available on request for weddings and special occasions.",
      },
      {
        question: "Can the Phantom be booked for just a few hours?",
        answer:
          "Yes, the Phantom can be booked hourly for ceremonies and photo sessions, not only full-day hire.",
      },
    ],
  },
  {
    slug: "mercedes-s-class",
    badge: "Executive Favorite",
    brand: "Mercedes-Benz",
    model: "S-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2500, fiveHours: 1500, oneHour: 400, airport: 500, extraHour: 300, additionalCity: 300 },
    images: [
      { src: "/images/fleet/mercedes-s-class/1.png", alt: "Mercedes-Benz S-Class front three-quarter exterior view with the Burj Khalifa skyline at dusk" },
      { src: "/images/fleet/mercedes-s-class/2.jpg", alt: "Mercedes-Benz S-Class rear cabin with panoramic sunroof and beige leather seating" },
      { src: "/images/fleet/mercedes-s-class/3.jpg", alt: "Mercedes-Benz S-Class rear passenger seating with reclining headrests and privacy shade" },
      { src: "/images/fleet/mercedes-s-class/4.jpg", alt: "Mercedes-Benz S-Class driver's cockpit with digital instrument cluster and steering wheel controls" },
    ],
    name: "Mercedes-Benz S-Class",
    category: "Sedan",
    tagline: "The executive standard",
    description:
      "The definitive choice for airport transfers and business travel — a hushed cabin, exceptional ride comfort, and a presence that reads confidence without excess.",
    longDescription:
      "Step into the S-Class and the outside world simply goes quiet. It remains the reference point for chauffeured business travel in Dubai — engineered ride comfort, whisper-quiet cabin insulation, and enough legroom to take a call or finish a deck before you arrive.",
    passengers: 3,
    luggage: 2,
    idealFor: "Airport transfers & corporate travel",
    features: [
      "Massaging leather seats",
      "Rear-seat climate control",
      "Ambient interior lighting",
      "Onboard Wi-Fi",
      "Privacy glass",
      "Bottled water & amenities",
    ],
    whyChoose: [
      "The quietest cabin in our fleet — ideal for calls between meetings",
      "Consistently available for same-day airport transfers",
      "A neutral, professional presence for client-facing arrivals",
      "Generous rear legroom, even for tall passengers",
    ],
    faqs: [
      {
        question: "Is the Mercedes S-Class suitable for airport transfers?",
        answer:
          "Yes — it's our most-booked vehicle for DXB and DWC transfers, with live flight tracking included as standard.",
      },
      {
        question: "How many suitcases fit in the S-Class?",
        answer:
          "The S-Class comfortably holds 2 standard suitcases plus carry-ons. For more luggage, consider the V-Class or Escalade.",
      },
      {
        question: "Can I book the S-Class for a full day?",
        answer:
          "Yes, hourly and full-day hire are both available — select your duration when booking, or mention it in your quote request.",
      },
    ],
  },
  {
    slug: "range-rover-autobiography",
    badge: "VIP Choice",
    brand: "Range Rover",
    model: "Autobiography",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 3200, fiveHours: 1900, oneHour: 500, airport: 650, extraHour: 400, additionalCity: 400 },
    images: [
      { src: "/images/fleet/range-rover-autobiography/1.webp", alt: "Range Rover Autobiography front three-quarter exterior view outside a modern building" },
      { src: "/images/fleet/range-rover-autobiography/2.webp", alt: "Range Rover Autobiography rear executive seating with reclining seats and rear entertainment screens" },
      { src: "/images/fleet/range-rover-autobiography/3.png", alt: "Range Rover Autobiography dashboard and steering wheel detail" },
      { src: "/images/fleet/range-rover-autobiography/4.jpg", alt: "Range Rover Autobiography driver's seat and dashboard view" },
    ],
    name: "Range Rover Autobiography",
    category: "SUV",
    tagline: "Effortless, elevated comfort",
    description:
      "Effortless comfort with genuine capability — a versatile choice for VIP transportation across the city or beyond it.",
    longDescription:
      "The Autobiography combines the comfort of a luxury saloon with the versatility of a true SUV — equally at home on a smooth airport run or an itinerary that strays from the main road.",
    passengers: 4,
    luggage: 3,
    idealFor: "VIP transportation",
    features: [
      "Executive rear seating",
      "Adjustable air suspension",
      "Premium Meridian sound system",
      "Panoramic roof",
      "Climate-controlled cabin",
      "Onboard Wi-Fi",
    ],
    whyChoose: [
      "Air suspension smooths out any road surface",
      "A more versatile option than a sedan for varied itineraries",
      "Premium Meridian sound system and panoramic roof",
      "A refined, understated alternative to a traditional limousine",
    ],
    faqs: [
      {
        question: "Is the Range Rover Autobiography good for airport transfers?",
        answer:
          "Yes — it's comfortable for airport transfers and works equally well for city touring or VIP transportation.",
      },
      {
        question: "How much luggage fits in the Range Rover?",
        answer:
          "The Autobiography holds up to 3 pieces of luggage comfortably alongside up to 4 passengers.",
      },
      {
        question: "Is the Range Rover available with a professional chauffeur?",
        answer: "Yes, every booking includes a professionally trained, licensed chauffeur.",
      },
    ],
  },
  {
    slug: "cadillac-escalade",
    brand: "Cadillac",
    model: "Escalade ESV",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2800, fiveHours: 1700, oneHour: 450, airport: 600, extraHour: 350, additionalCity: 350 },
    images: [
      { src: "/images/fleet/cadillac-escalade/1.png", alt: "Cadillac Escalade ESV front three-quarter exterior view outside a modern glass building" },
      { src: "/images/fleet/cadillac-escalade/2.jpg", alt: "Cadillac Escalade ESV side profile exterior view" },
      { src: "/images/fleet/cadillac-escalade/3.jpg", alt: "Cadillac Escalade ESV third-row seating and rear cabin" },
      { src: "/images/fleet/cadillac-escalade/4.jpg", alt: "Cadillac Escalade ESV second-row captain's chairs and cabin interior" },
    ],
    name: "Cadillac Escalade ESV",
    category: "SUV",
    tagline: "A bold, commanding presence",
    description:
      "A full-size luxury SUV built for VIP and family travel — commanding road presence with generous room for passengers and luggage alike.",
    longDescription:
      "The Escalade brings genuine road presence to VIP transportation — a full-size SUV with three rows of leather seating, ideal when the arrival itself needs to make an impression.",
    passengers: 5,
    luggage: 4,
    idealFor: "VIP & family travel",
    features: [
      "Three-row leather seating",
      "Elevated ride height",
      "Premium sound system",
      "Ample luggage space",
      "Tinted privacy windows",
      "Child seat available on request",
    ],
    whyChoose: [
      "Commanding size and presence for VIP arrivals",
      "Three rows accommodate larger groups or families with luggage",
      "Elevated seating position for added comfort and visibility",
      "A frequent choice for security-conscious VIP transportation",
    ],
    faqs: [
      {
        question: "How many passengers can the Escalade seat?",
        answer:
          "Up to 5 passengers with full comfort, with three-row seating and generous luggage space.",
      },
      {
        question: "Is the Escalade suitable for VIP security details?",
        answer:
          "Yes, it's a frequent choice for VIP and dignitary transport where size and presence matter.",
      },
      {
        question: "Can I request a child seat in the Escalade?",
        answer:
          "Yes, child seats are available on request — note it under special requests when booking.",
      },
    ],
  },
  {
    slug: "mercedes-v-class",
    badge: "Most Popular",
    brand: "Mercedes-Benz",
    model: "V-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2200, fiveHours: 1300, oneHour: 350, airport: 450, extraHour: 250, additionalCity: 250 },
    images: [
      { src: "/images/fleet/mercedes-v-class/1.png", alt: "Mercedes V-Class front three-quarter exterior view along Dubai Marina with the Burj Khalifa in the background" },
      { src: "/images/fleet/mercedes-v-class/2.jpg", alt: "Mercedes V-Class rear passenger cabin with captain's chairs" },
      { src: "/images/fleet/mercedes-v-class/3.jpg", alt: "Mercedes V-Class rear luggage compartment loaded with suitcases" },
    ],
    name: "Mercedes V-Class",
    category: "Van",
    tagline: "Space, styled",
    description:
      "A spacious, beautifully finished van for group transfers and events — seating for up to six without sacrificing the comfort of a luxury sedan.",
    longDescription:
      "Built for groups who still expect a luxury experience, the V-Class pairs generous cabin space with the fit and finish of a Mercedes flagship. Captain's chairs, individual climate zones, and room for six make it the natural choice for events and family travel alike.",
    passengers: 6,
    luggage: 6,
    idealFor: "Group transfers & events",
    features: [
      "Configurable captain's chairs",
      "Extra luggage capacity",
      "Rear entertainment screen",
      "Sliding doors for easy access",
      "Onboard Wi-Fi",
      "Individual reading lights",
    ],
    whyChoose: [
      "Seats up to 6 without cramming — ideal for families and small groups",
      "Luggage capacity matched to passenger count for full travel parties",
      "Sliding doors make loading and unloading effortless at hotels",
      "One coordinated vehicle instead of multiple sedans",
    ],
    faqs: [
      {
        question: "How many passengers fit in the Mercedes V-Class?",
        answer:
          "The V-Class comfortably seats up to 6 passengers with individual captain's chairs, plus a dedicated luggage area.",
      },
      {
        question: "Is the V-Class good for airport group transfers?",
        answer:
          "Yes — it's our most popular vehicle for groups landing together at DXB or DWC, keeping everyone in one car.",
      },
      {
        question: "Can the V-Class be booked for events?",
        answer:
          "Absolutely. We regularly deploy multiple V-Class vans for conferences and weddings needing coordinated group transport.",
      },
    ],
  },
  {
    slug: "bmw-7-series",
    badge: "Corporate Preferred",
    brand: "BMW",
    model: "7 Series",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2500, fiveHours: 1500, oneHour: 400, airport: 500, extraHour: 300, additionalCity: 300 },
    images: [
      { src: "/images/fleet/bmw-7-series/1.jpg", alt: "BMW 7 Series front three-quarter exterior view with illuminated grille against the Dubai skyline at dusk" },
      { src: "/images/fleet/bmw-7-series/2.png", alt: "BMW 7 Series rear seating with quilted leather upholstery" },
      { src: "/images/fleet/bmw-7-series/3.jpg", alt: "BMW 7 Series rear seating with tan leather upholstery and wood trim" },
      { src: "/images/fleet/bmw-7-series/4.jpg", alt: "BMW 7 Series dashboard with dual curved digital displays" },
    ],
    name: "BMW 7 Series",
    category: "Sedan",
    tagline: "Refined power",
    description:
      "A dynamic, driver-focused luxury sedan for executives who want business-ready comfort with a sharper edge on the road.",
    longDescription:
      "The 7 Series brings a sharper, more dynamic character to executive travel — the same business-ready comfort as our other sedans, with noticeably more presence on the road. A strong choice for clients who want luxury with an edge.",
    passengers: 3,
    luggage: 2,
    idealFor: "Business travel & meetings",
    features: [
      "Executive lounge seating",
      "Panoramic sky lounge roof",
      "Premium sound system",
      "Rear-seat entertainment",
      "Privacy glass",
      "Onboard Wi-Fi",
    ],
    whyChoose: [
      "A more dynamic driving character than a traditional sedan",
      "Panoramic sky lounge roof adds a sense of space on longer routes",
      "Well suited to client pickups where presence matters",
      "Comparable comfort to the S-Class with a distinct design language",
    ],
    faqs: [
      {
        question: "How is the BMW 7 Series different from the S-Class?",
        answer:
          "Both are executive sedans with similar comfort levels — the 7 Series has a sportier ride and design, while the S-Class leans toward maximum cabin quietness.",
      },
      {
        question: "Is the BMW 7 Series available for corporate accounts?",
        answer:
          "Yes, it's available for standing corporate bookings as well as one-off business travel.",
      },
      {
        question: "Does the 7 Series include Wi-Fi?",
        answer: "Yes, onboard Wi-Fi is included so you can stay connected between meetings.",
      },
    ],
  },
  {
    slug: "lexus-es-300h",
    brand: "Lexus",
    model: "ES 300h",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 1700, fiveHours: 1000, oneHour: 260, airport: 360, extraHour: 210, additionalCity: 210 },
    images: [
      { src: "/images/fleet/lexus-es-300h/1.png", alt: "Lexus ES 300h front three-quarter exterior view with the Dubai skyline and Burj Khalifa in the background" },
      { src: "/images/fleet/lexus-es-300h/2.jpg", alt: "Lexus ES 300h rear seating with tan leather upholstery" },
      { src: "/images/fleet/lexus-es-300h/3.jpg", alt: "Lexus ES 300h rear seat detail with center armrest" },
    ],
    name: "Lexus ES 300h",
    category: "Sedan",
    tagline: "Quiet, efficient executive comfort",
    description:
      "The Lexus ES 300h combines a whisper-quiet hybrid powertrain with a refined, comfortable cabin — an efficient, dependable executive sedan for business travel and airport transfers across Dubai. Its smooth ride and understated elegance suit clients who want genuine comfort and a lower environmental footprint on every chauffeured journey.",
    longDescription:
      "The ES 300h pairs Lexus's renowned reliability with a quiet hybrid drivetrain and a calm, well-appointed cabin — a dependable executive sedan for business travel, airport transfers, and daily corporate accounts. A smooth, efficient choice for clients who value understated comfort over overt display.",
    passengers: 3,
    luggage: 2,
    idealFor: "Business travel & eco-conscious executive transfers",
    features: [
      "Hybrid-quiet cabin insulation",
      "Leather executive seating",
      "Rear-seat climate control",
      "Onboard Wi-Fi",
      "Privacy glass",
      "Bottled water & amenities",
    ],
    whyChoose: [
      "A quiet, efficient hybrid ride with genuine Lexus reliability",
      "Understated comfort for clients who prefer a lower profile",
      "Dependable same-day availability for business travel",
      "A cost-efficient option for standing corporate accounts",
    ],
    faqs: [
      {
        question: "Is the ES 300h a hybrid?",
        answer:
          "Yes — it pairs a quiet hybrid powertrain with a refined cabin, offering a smooth ride with a lower environmental footprint.",
      },
      {
        question: "Is the ES 300h suitable for airport transfers?",
        answer:
          "Yes, with the same live flight tracking and meet-and-greet service as the rest of our sedan fleet.",
      },
      {
        question: "Can I book the ES 300h for a full business day?",
        answer: "Yes, hourly and full-day hire are both available on request.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "rolls-royce-cullinan-mansory",
    brand: "Rolls-Royce",
    model: "Cullinan Mansory",
    // TEMPORARY DEMO PRICING — replace with confirmed pricing before launch
    rates: { tenHours: 11000, fiveHours: 6500, oneHour: 1800, airport: 2400, extraHour: 1400, additionalCity: 1400 },
    images: [
      { src: "/images/fleet/rolls-royce-cullinan-mansory/1.png", alt: "Rolls-Royce Cullinan Mansory front three-quarter exterior view in a custom turquoise widebody finish" },
      { src: "/images/fleet/rolls-royce-cullinan-mansory/2.png", alt: "Rolls-Royce Cullinan Mansory front-on exterior view showing the widebody kit and grille" },
      { src: "/images/fleet/rolls-royce-cullinan-mansory/3.png", alt: "Rolls-Royce Cullinan Mansory cabin view with matching turquoise leather interior and open doors" },
    ],
    name: "Rolls-Royce Cullinan Mansory",
    category: "Ultra-Luxury",
    tagline: "Bespoke presence, uncompromising exclusivity",
    // TEMPORARY placeholder description — to be replaced with final copy
    description:
      "A widebody, Mansory-customized Rolls-Royce Cullinan — the most exclusive SUV in the fleet, combining Rolls-Royce craftsmanship with bespoke Mansory design for clients who expect the absolute pinnacle of presence.",
    // TEMPORARY placeholder description — to be replaced with final copy
    longDescription:
      "The Cullinan Mansory pairs Rolls-Royce's handcrafted luxury with Mansory's bespoke widebody styling — a genuinely rare SUV reserved for clients who want the most exclusive arrival possible. Every detail, from the carbon-fibre accents to the reworked stance, sets it apart from anything else on the road.",
    passengers: 4,
    luggage: 3,
    idealFor: "Ultra-exclusive VIP arrivals",
    // TEMPORARY placeholder specifications — to be replaced with final copy
    features: [
      "Handcrafted leather interior",
      "Bespoke Mansory widebody styling",
      "Starlight headliner",
      "Rear-seat climate control",
      "Premium sound system",
      "Privacy glass",
    ],
    whyChoose: [
      "The most exclusive SUV in the fleet — genuinely rare on Dubai roads",
      "Bespoke Mansory styling sets it apart from any standard Cullinan",
      "Handcrafted Rolls-Royce interior with full VIP amenities",
      "Reserved for clients who want an unmistakable arrival",
    ],
    faqs: [
      {
        question: "How is the Cullinan Mansory different from a standard Cullinan?",
        answer:
          "The Mansory edition adds a bespoke widebody kit, unique styling details, and additional interior customization on top of the standard Rolls-Royce Cullinan, making it one of the rarest SUVs on the road.",
      },
      {
        question: "How far in advance should I book the Cullinan Mansory?",
        answer: "As our most exclusive SUV, we recommend booking as early as possible to guarantee availability.",
      },
      {
        question: "Is the Cullinan Mansory available for events and arrivals?",
        answer:
          "Yes, it's ideal for high-profile arrivals, VIP events, and clients who want the most exclusive SUV presence available.",
      },
    ],
    // TEMPORARY — real photography to replace the icon/gradient placeholder shown until then
    isPlaceholder: true,
  },
  {
    slug: "tesla-model-y",
    brand: "Tesla",
    model: "Model Y",
    // TEMPORARY DEMO PRICING — replace with confirmed pricing before launch
    rates: { tenHours: 2000, fiveHours: 1200, oneHour: 320, airport: 420, extraHour: 230, additionalCity: 230 },
    images: [
      { src: "/images/fleet/tesla-model-y/1.png", alt: "Tesla Model Y front three-quarter exterior view with the Dubai skyline in the background" },
      { src: "/images/fleet/tesla-model-y/2.jpg", alt: "Tesla Model Y rear seating with black leather upholstery" },
      { src: "/images/fleet/tesla-model-y/3.webp", alt: "Tesla Model Y interior cabin detail" },
    ],
    name: "Tesla Model Y",
    category: "SUV",
    tagline: "Modern, sustainable, effortless",
    // TEMPORARY placeholder description — to be replaced with final copy
    description:
      "An all-electric SUV for clients who want a modern, sustainable chauffeured experience — smooth, silent power with a minimalist, tech-forward cabin.",
    // TEMPORARY placeholder description — to be replaced with final copy
    longDescription:
      "The Model Y brings a quieter, more sustainable option to the fleet — fully electric power delivery, a spacious minimalist cabin, and Tesla's signature tech-forward interior. A smart choice for eco-conscious clients and short-to-mid-distance city travel.",
    passengers: 4,
    luggage: 3,
    idealFor: "Eco-conscious city travel & corporate transfers",
    // TEMPORARY placeholder specifications — to be replaced with final copy
    features: [
      "All-electric powertrain",
      "Panoramic glass roof",
      "Minimalist tech-forward cabin",
      "Premium sound system",
      "Climate-controlled cabin",
      "Onboard Wi-Fi",
    ],
    whyChoose: [
      "A genuinely silent, all-electric ride",
      "Sustainable choice without compromising comfort",
      "Spacious cabin with a clean, modern interior",
      "Well suited to city transfers and corporate accounts",
    ],
    faqs: [
      {
        question: "Is the Model Y a fully electric vehicle?",
        answer: "Yes, the Model Y is 100% electric, offering a smooth, silent ride with zero tailpipe emissions.",
      },
      {
        question: "Is the Model Y suitable for airport transfers?",
        answer: "Yes, it's a comfortable, efficient choice for airport transfers and city travel alike.",
      },
      {
        question: "How much luggage fits in the Model Y?",
        answer: "The Model Y comfortably holds up to 3 pieces of luggage thanks to its front and rear storage compartments.",
      },
    ],
    // TEMPORARY — real photography to replace the icon/gradient placeholder shown until then
    isPlaceholder: true,
  },
  {
    slug: "gmc-yukon-elevation",
    brand: "GMC",
    model: "Yukon Elevation",
    // TEMPORARY DEMO PRICING — replace with confirmed pricing before launch
    rates: { tenHours: 2400, fiveHours: 1450, oneHour: 380, airport: 520, extraHour: 290, additionalCity: 290 },
    images: [
      { src: "/images/fleet/gmc-yukon-elevation/1.png", alt: "GMC Yukon Elevation front three-quarter exterior view outside a modern illuminated entrance at night" },
      { src: "/images/fleet/gmc-yukon-elevation/2.jpg", alt: "GMC Yukon Elevation front cabin seating with tan leather upholstery" },
      { src: "/images/fleet/gmc-yukon-elevation/3.jpg", alt: "GMC Yukon Elevation third-row and rear seating" },
    ],
    name: "GMC Yukon Elevation",
    category: "SUV",
    tagline: "Bold styling, everyday capability",
    // TEMPORARY placeholder description — to be replaced with final copy
    description:
      "A full-size SUV with a sportier, blacked-out Elevation aesthetic — spacious, capable, and ready for group travel or airport runs.",
    // TEMPORARY placeholder description — to be replaced with final copy
    longDescription:
      "The Yukon Elevation brings GMC's bold, sport-inspired styling to full-size chauffeured travel — a spacious three-row cabin, a smooth ride, and enough room for passengers and luggage on longer itineraries or group airport transfers.",
    passengers: 6,
    luggage: 4,
    idealFor: "Group travel & airport transfers",
    // TEMPORARY placeholder specifications — to be replaced with final copy
    features: [
      "Three-row seating",
      "Elevated ride height",
      "Premium sound system",
      "Ample luggage space",
      "Climate-controlled cabin",
      "Tinted privacy windows",
    ],
    whyChoose: [
      "Bold, sport-inspired styling with everyday practicality",
      "Spacious three-row cabin for larger groups",
      "Dependable capability for longer itineraries",
      "A versatile alternative for mid-sized group travel",
    ],
    faqs: [
      {
        question: "How does the Yukon Elevation compare to the Escalade?",
        answer:
          "Both are full-size, three-row SUVs. The Escalade leans more upscale in cabin finish, while the Yukon Elevation offers a bolder, sport-inspired look at a more accessible tier.",
      },
      {
        question: "Is the Yukon Elevation good for group airport transfers?",
        answer: "Yes, its three-row seating and generous luggage space make it well suited to group airport transfers.",
      },
      {
        question: "Can the Yukon Elevation be booked hourly?",
        answer: "Yes, hourly and full-day hire are both available.",
      },
    ],
    // TEMPORARY — real photography to replace the icon/gradient placeholder shown until then
    isPlaceholder: true,
  },
  {
    slug: "tesla-model-3",
    brand: "Tesla",
    model: "Model 3",
    // TEMPORARY DEMO PRICING — replace with confirmed pricing before launch
    rates: { tenHours: 1800, fiveHours: 1050, oneHour: 270, airport: 370, extraHour: 210, additionalCity: 210 },
    images: [
      { src: "/images/fleet/tesla-model-3/1.jpg", alt: "Tesla Model 3 front three-quarter studio exterior view in white" },
      { src: "/images/fleet/tesla-model-3/2.webp", alt: "Tesla Model 3 interior cabin detail" },
      { src: "/images/fleet/tesla-model-3/3.jpg", alt: "Tesla Model 3 rear seating with black leather upholstery" },
    ],
    name: "Tesla Model 3",
    category: "Sedan",
    tagline: "Quiet, efficient, modern",
    // TEMPORARY placeholder description — to be replaced with final copy
    description:
      "A fully electric executive sedan for clients who want a quiet, efficient ride with a clean, modern cabin — ideal for city transfers and corporate travel.",
    // TEMPORARY placeholder description — to be replaced with final copy
    longDescription:
      "The Model 3 brings Tesla's all-electric efficiency to executive sedan travel — a whisper-quiet ride, minimalist interior, and dependable performance for business travel and airport transfers across Dubai.",
    passengers: 3,
    luggage: 2,
    idealFor: "Business travel & eco-conscious transfers",
    // TEMPORARY placeholder specifications — to be replaced with final copy
    features: [
      "All-electric powertrain",
      "Minimalist tech-forward cabin",
      "Premium sound system",
      "Climate-controlled cabin",
      "Onboard Wi-Fi",
      "Privacy glass",
    ],
    whyChoose: [
      "A genuinely silent, all-electric ride",
      "Efficient and sustainable without sacrificing comfort",
      "Clean, modern cabin design",
      "A cost-efficient option for standing corporate accounts",
    ],
    faqs: [
      {
        question: "Is the Model 3 a fully electric vehicle?",
        answer: "Yes, the Model 3 is 100% electric, offering a quiet, efficient ride.",
      },
      {
        question: "Is the Model 3 suitable for corporate accounts?",
        answer:
          "Yes, it's a cost-efficient, dependable option for standing corporate accounts and daily business travel.",
      },
      {
        question: "How much luggage fits in the Model 3?",
        answer: "The Model 3 comfortably holds 2 standard suitcases plus carry-ons.",
      },
    ],
    // TEMPORARY — real photography to replace the icon/gradient placeholder shown until then
    isPlaceholder: true,
  },
  {
    slug: "byd-han",
    brand: "BYD",
    model: "Han",
    // TEMPORARY DEMO PRICING — replace with confirmed pricing before launch
    rates: { tenHours: 2100, fiveHours: 1250, oneHour: 330, airport: 430, extraHour: 240, additionalCity: 240 },
    // NOTE: byd-han/2.jpg and byd-han/3.jpg in the uploaded folder are a
    // different vehicle's interior (a Rolls-Royce cabin — see the embroidered
    // "R" headrest logo), not the BYD Han. Only the verified exterior hero is
    // used here; add real BYD Han interior/detail photos to this folder and
    // extend this array once available.
    images: [
      { src: "/images/fleet/byd-han/1.jpg", alt: "BYD Han front three-quarter exterior view on a palm-lined Dubai street" },
    ],
    name: "BYD Han",
    category: "Sedan",
    tagline: "Refined electric performance",
    // TEMPORARY placeholder description — to be replaced with final copy
    description:
      "A flagship all-electric sedan pairing refined comfort with strong performance — a modern alternative for executive travel across Dubai.",
    // TEMPORARY placeholder description — to be replaced with final copy
    longDescription:
      "The BYD Han brings flagship-level comfort and all-electric performance to executive chauffeured travel — a well-appointed cabin, smooth ride quality, and dependable range for business travel and airport transfers.",
    passengers: 3,
    luggage: 2,
    idealFor: "Executive travel & corporate transfers",
    // TEMPORARY placeholder specifications — to be replaced with final copy
    features: [
      "All-electric powertrain",
      "Leather executive seating",
      "Rear-seat climate control",
      "Premium sound system",
      "Onboard Wi-Fi",
      "Privacy glass",
    ],
    whyChoose: [
      "Flagship comfort with all-electric efficiency",
      "Smooth, quiet ride for business travel",
      "A modern alternative to traditional executive sedans",
      "Dependable availability for corporate accounts",
    ],
    faqs: [
      {
        question: "Is the BYD Han a fully electric vehicle?",
        answer: "Yes, the Han is a flagship all-electric sedan offering a smooth, quiet ride.",
      },
      {
        question: "Is the BYD Han suitable for airport transfers?",
        answer: "Yes, with the same professional chauffeur standard and live flight tracking as the rest of the fleet.",
      },
      {
        question: "Can I book the BYD Han for a full business day?",
        answer: "Yes, hourly and full-day hire are both available on request.",
      },
    ],
    // TEMPORARY — real photography to replace the icon/gradient placeholder shown until then
    isPlaceholder: true,
  },
];
