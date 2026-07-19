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
 * Real photography for a vehicle's gallery. Optional — vehicles without
 * this field fall back to the existing icon/gradient treatment in
 * VehicleGallery.tsx, so adding photos for one vehicle never affects the
 * others. `exterior` doubles as the fleet card cover image and the vehicle
 * detail page hero image, since the gallery opens on the Exterior tab by
 * default in both places.
 */
export interface VehicleGalleryImages {
  exterior: VehicleImage;
  interior: VehicleImage;
  detail: VehicleImage;
}

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
  images?: VehicleGalleryImages;
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
    brand: "Rolls-Royce",
    model: "Phantom",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 9500, fiveHours: 5500, oneHour: 1500, airport: 2000, extraHour: 1200, additionalCity: 1200 },
    name: "Rolls-Royce Phantom",
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
    images: {
      exterior: {
        src: "/images/fleet/rolls-royce-phantom/rolls-royce-phantom-exterior.webp",
        alt: "Black Rolls-Royce Phantom chauffeur car front exterior view with palm trees",
      },
      interior: {
        src: "/images/fleet/rolls-royce-phantom/rolls-royce-phantom-interior.webp",
        alt: "Rolls-Royce Phantom rear cabin with cognac leather seats and starlight headliner",
      },
      detail: {
        src: "/images/fleet/rolls-royce-phantom/rolls-royce-phantom-detail.webp",
        alt: "Rolls-Royce Phantom Spirit of Ecstasy hood ornament close-up",
      },
    },
  },
  {
    slug: "rolls-royce-ghost",
    brand: "Rolls-Royce",
    model: "Ghost",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 8000, fiveHours: 4500, oneHour: 1200, airport: 1600, extraHour: 950, additionalCity: 950 },
    name: "Rolls-Royce Ghost",
    category: "Ultra-Luxury",
    tagline: "Effortless, understated power",
    description:
      "A more understated Rolls-Royce for clients who want the marque's effortless refinement without the Phantom's full occasion-level presence.",
    longDescription:
      "The Ghost delivers the same handcrafted Rolls-Royce refinement as the Phantom in a more understated package — effortless power, a hushed cabin, and quiet confidence for executive travel that still calls for something exceptional.",
    passengers: 3,
    luggage: 2,
    idealFor: "Executive arrivals & signature occasions",
    features: [
      "Handcrafted leather interior",
      "Starlight headliner",
      "Bespoke welcome amenities",
      "Champagne chilling compartment",
      "Rear-seat climate control",
      "Chauffeur in formal attire",
    ],
    whyChoose: [
      "The effortless refinement of Rolls-Royce in a more understated package",
      "Handcrafted interior with the signature starlight headliner",
      "A strong alternative to the Phantom for executive-level occasions",
      "Chauffeur in formal attire as standard",
    ],
    faqs: [
      {
        question: "How does the Ghost compare to the Phantom?",
        answer:
          "Both share the same handcrafted Rolls-Royce quality. The Phantom is the larger, more occasion-focused flagship; the Ghost is slightly more understated and versatile for executive travel.",
      },
      {
        question: "Is the Ghost available for weddings?",
        answer:
          "Yes, though many clients choose the Phantom for weddings specifically — the Ghost suits executive and signature-occasion bookings equally well.",
      },
      {
        question: "How far in advance should I book the Ghost?",
        answer:
          "We recommend booking at least a few days ahead for this vehicle, particularly during peak season.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "mercedes-s-class",
    brand: "Mercedes-Benz",
    model: "S-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2500, fiveHours: 1500, oneHour: 400, airport: 500, extraHour: 300, additionalCity: 300 },
    name: "Mercedes S-Class",
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
    images: {
      exterior: {
        src: "/images/fleet/mercedes-s-class/mercedes-s-class-front-exterior.webp",
        alt: "Black Mercedes S-Class chauffeur car, front view, Apex Limo & Chauffeur Dubai fleet",
      },
      interior: {
        src: "/images/fleet/mercedes-s-class/mercedes-s-class-rear-seats-interior.webp",
        alt: "Mercedes S-Class rear passenger seats with premium white leather interior",
      },
      detail: {
        src: "/images/fleet/mercedes-s-class/mercedes-s-class-steering-wheel-detail.webp",
        alt: "Mercedes S-Class steering wheel and digital dashboard close-up",
      },
    },
  },
  {
    slug: "bentley-flying-spur",
    brand: "Bentley",
    model: "Flying Spur",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 7500, fiveHours: 4200, oneHour: 1100, airport: 1500, extraHour: 900, additionalCity: 900 },
    name: "Bentley Flying Spur",
    category: "Ultra-Luxury",
    tagline: "Handcrafted performance",
    description:
      "A handcrafted flagship sedan that pairs true performance with Bentley's signature craftsmanship — luxury for clients who want presence with a sportier edge.",
    longDescription:
      "The Flying Spur brings genuine performance to flagship chauffeured travel — a handcrafted cabin finished to Bentley's exacting standard, paired with a more dynamic character than a traditional limousine. A distinctive choice for clients who want luxury with real driving pedigree behind it.",
    passengers: 3,
    luggage: 2,
    idealFor: "Signature executive arrivals",
    features: [
      "Handcrafted leather interior",
      "Diamond-quilted seating",
      "Naim premium sound system",
      "Rear-seat climate control",
      "Privacy glass",
      "Bespoke welcome amenities",
    ],
    whyChoose: [
      "Handcrafted Bentley craftsmanship with a distinctly sportier character",
      "A strong alternative to a traditional limousine for clients who want presence with pedigree",
      "Diamond-quilted leather interior finished to an exacting standard",
      "Reserved availability — a frequently requested flagship vehicle",
    ],
    faqs: [
      {
        question: "How is the Flying Spur different from the Phantom?",
        answer:
          "The Phantom is the more traditional, occasion-focused flagship. The Flying Spur offers the same handcrafted quality with a sportier, more dynamic driving character.",
      },
      {
        question: "Is the Flying Spur available for weddings?",
        answer: "Yes, it's available for weddings and signature occasions alongside our other flagship vehicles.",
      },
      {
        question: "How far in advance should I book the Flying Spur?",
        answer:
          "As a frequently requested flagship vehicle, we recommend booking at least a few days ahead where possible.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "range-rover-autobiography",
    brand: "Range Rover",
    model: "Autobiography",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 3200, fiveHours: 1900, oneHour: 500, airport: 650, extraHour: 400, additionalCity: 400 },
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
    images: {
      exterior: {
        src: "/images/fleet/range-rover-autobiography/range-rover-autobiography-exterior.webp",
        alt: "Black Range Rover Autobiography chauffeur SUV front exterior three-quarter view",
      },
      interior: {
        src: "/images/fleet/range-rover-autobiography/range-rover-autobiography-interior.webp",
        alt: "Range Rover Autobiography rear cabin with tan leather seats and rear-seat entertainment screens",
      },
      detail: {
        src: "/images/fleet/range-rover-autobiography/range-rover-autobiography-detail.webp",
        alt: "Range Rover Autobiography steering wheel and digital dashboard close-up",
      },
    },
  },
  {
    slug: "cadillac-escalade",
    brand: "Cadillac",
    model: "Escalade",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2800, fiveHours: 1700, oneHour: 450, airport: 600, extraHour: 350, additionalCity: 350 },
    name: "Cadillac Escalade",
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
    images: {
      exterior: {
        src: "/images/fleet/cadillac-escalade/cadillac-escalade-exterior.webp",
        alt: "Black Cadillac Escalade chauffeur SUV front exterior view with illuminated grille",
      },
      interior: {
        src: "/images/fleet/cadillac-escalade/cadillac-escalade-interior.webp",
        alt: "Cadillac Escalade rear passenger bench seats in cognac leather",
      },
      detail: {
        src: "/images/fleet/cadillac-escalade/cadillac-escalade-detail.webp",
        alt: "Cadillac Escalade leather seat close-up showing stitching detail and craftsmanship",
      },
    },
  },
  {
    slug: "mercedes-v-class",
    brand: "Mercedes-Benz",
    model: "V-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2200, fiveHours: 1300, oneHour: 350, airport: 450, extraHour: 250, additionalCity: 250 },
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
    images: {
      exterior: {
        src: "/images/fleet/mercedes-v-class/mercedes-v-class-exterior-dubai-skyline.webp",
        alt: "Black Mercedes V-Class chauffeur van parked with Dubai skyline and Burj Khalifa in the background",
      },
      interior: {
        src: "/images/fleet/mercedes-v-class/mercedes-v-class-rear-cabin-seats.webp",
        alt: "Mercedes V-Class rear cabin with individual black leather captain's chairs and bench seating",
      },
      detail: {
        src: "/images/fleet/mercedes-v-class/mercedes-v-class-luggage-capacity.webp",
        alt: "Mercedes V-Class open trunk fully loaded with multiple suitcases, showing luggage capacity",
      },
    },
  },
  {
    slug: "bmw-7-series",
    brand: "BMW",
    model: "7 Series",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2500, fiveHours: 1500, oneHour: 400, airport: 500, extraHour: 300, additionalCity: 300 },
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
    images: {
      exterior: {
        src: "/images/fleet/bmw-7-series/bmw-7-series-exterior.webp",
        alt: "Black BMW 7 Series chauffeur car front view with illuminated grille and Dubai skyline at dusk",
      },
      interior: {
        src: "/images/fleet/bmw-7-series/bmw-7-series-interior.webp",
        alt: "BMW 7 Series rear seats in cognac leather with executive lounge seating",
      },
      detail: {
        src: "/images/fleet/bmw-7-series/bmw-7-series-detail.webp",
        alt: "BMW 7 Series dashboard close-up with dual curved digital displays and steering wheel",
      },
    },
  },
  {
    slug: "lexus-lm",
    brand: "Lexus",
    model: "LM",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 4500, fiveHours: 2700, oneHour: 700, airport: 900, extraHour: 550, additionalCity: 550 },
    name: "Lexus LM",
    category: "Van",
    tagline: "First-class travel, four seats only",
    description:
      "The Lexus LM redefines chauffeured travel in Dubai with an ultra-exclusive four-seat executive lounge cabin — reclining ottoman-style seats, ambient lighting, and hushed cabin insulation more akin to a private jet than a minivan. Ideal for VIP airport transfers, high-profile business travel, and clients who want maximum privacy and comfort on every journey.",
    longDescription:
      "Step aboard the Lexus LM and experience Dubai's most exclusive people-mover — a four-passenger executive lounge with fully reclining ottoman seating, a curtained-off cabin, and whisper-quiet ride comfort engineered for total privacy. Reserved for clients who want the space and calm of a private cabin on every airport transfer, roadshow, or VIP itinerary across the Emirates.",
    passengers: 4,
    luggage: 3,
    idealFor: "VIP airport transfers & ultra-premium executive travel",
    features: [
      "Four-seat executive lounge configuration",
      "Fully reclining ottoman-style seats",
      "Curtained privacy partition",
      "Ambient cabin lighting",
      "Premium sound insulation",
      "Onboard Wi-Fi",
    ],
    whyChoose: [
      "The most exclusive people-mover in the fleet — only four seats, maximum privacy",
      "Reclining executive seats rival first-class air travel",
      "Curtained cabin keeps VIP passengers fully private in transit",
      "A natural upgrade from a standard van for high-profile arrivals",
    ],
    faqs: [
      {
        question: "How many passengers does the Lexus LM seat?",
        answer:
          "The LM is configured as an exclusive four-seat executive lounge, prioritizing space and privacy over passenger count.",
      },
      {
        question: "Is the Lexus LM suitable for airport transfers?",
        answer:
          "Yes — it's one of our most requested vehicles for VIP airport transfers, with the same live flight tracking as the rest of the fleet.",
      },
      {
        question: "Can the LM be booked for roadshows or multi-stop business travel?",
        answer:
          "Yes, hourly hire is available for itineraries with multiple stops, and the cabin is built for comfortable work or rest between meetings.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "mercedes-e-class",
    brand: "Mercedes-Benz",
    model: "E-Class",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 1900, fiveHours: 1100, oneHour: 280, airport: 380, extraHour: 220, additionalCity: 220 },
    name: "Mercedes E-Class",
    category: "Sedan",
    tagline: "Accessible executive elegance",
    description:
      "The Mercedes E-Class brings the brand's signature comfort and quiet sophistication to everyday chauffeured travel in Dubai — a smooth ride, elegant cabin, and dependable presence for business meetings, airport transfers, and city-to-city journeys. A practical, polished choice for clients who want genuine Mercedes luxury without the flagship S-Class price point.",
    longDescription:
      "The E-Class carries forward the same chauffeur-grade comfort as our flagship Mercedes sedans in a right-sized, cost-efficient package — a calm, well-insulated cabin, smooth ride quality, and the same professional chauffeur standard on every booking. A dependable choice for standing corporate accounts and frequent business travel across Dubai.",
    passengers: 3,
    luggage: 2,
    idealFor: "Business travel & daily corporate transfers",
    features: [
      "Leather executive seating",
      "Rear-seat climate control",
      "Ambient interior lighting",
      "Onboard Wi-Fi",
      "Privacy glass",
      "Bottled water & amenities",
    ],
    whyChoose: [
      "The same Mercedes chauffeur standard as our flagship sedans, at a more accessible tier",
      "A smooth, quiet ride well suited to back-to-back meetings",
      "Dependable same-day and next-day availability",
      "A practical choice for standing corporate accounts with frequent bookings",
    ],
    faqs: [
      {
        question: "How does the E-Class compare to the S-Class?",
        answer:
          "Both offer the same chauffeur standard and Mercedes comfort — the S-Class is our flagship with a longer wheelbase and extra amenities, while the E-Class is a right-sized, cost-efficient alternative for everyday business travel.",
      },
      {
        question: "Is the E-Class suitable for airport transfers?",
        answer:
          "Yes — it includes the same live flight tracking and meet-and-greet service as the rest of our sedan fleet.",
      },
      {
        question: "Can I book the E-Class for a full business day?",
        answer: "Yes, hourly and full-day hire are both available.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "gmc-yukon-denali",
    brand: "GMC",
    model: "Yukon Denali",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2500, fiveHours: 1500, oneHour: 400, airport: 550, extraHour: 300, additionalCity: 300 },
    name: "GMC Yukon Denali",
    category: "SUV",
    tagline: "Confident, spacious, dependable",
    description:
      "A dependable full-size SUV that balances a commanding presence with everyday practicality — a versatile choice for VIP transportation and group travel alike.",
    longDescription:
      "The Yukon Denali brings a confident, dependable presence to VIP transportation — spacious leather seating, a smooth ride, and enough room for passengers and luggage on longer itineraries or airport runs with a full travel party.",
    passengers: 6,
    luggage: 4,
    idealFor: "VIP transportation & group travel",
    features: [
      "Three-row leather seating",
      "Elevated ride height",
      "Premium sound system",
      "Ample luggage space",
      "Climate-controlled cabin",
      "Tinted privacy windows",
    ],
    whyChoose: [
      "Dependable availability for both VIP transport and larger group travel",
      "Confident road presence without sacrificing ride comfort",
      "Three rows of seating with luggage capacity to match",
      "A versatile alternative to a full-size van for mid-sized groups",
    ],
    faqs: [
      {
        question: "Is the Yukon Denali suitable for airport transfers?",
        answer:
          "Yes — it comfortably handles a full travel party and their luggage on airport runs, with the same flight-tracking service as our sedans.",
      },
      {
        question: "How does the Yukon Denali compare to the Escalade?",
        answer:
          "Both are full-size, three-row luxury SUVs with similar capacity. The Escalade leans slightly more upscale in cabin finish; the Yukon Denali is a dependable, confident alternative.",
      },
      {
        question: "Can the Yukon Denali be booked hourly?",
        answer: "Yes, hourly and full-day hire are both available.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "bmw-5-series",
    brand: "BMW",
    model: "5 Series",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 1600, fiveHours: 950, oneHour: 250, airport: 350, extraHour: 200, additionalCity: 200 },
    name: "BMW 5 Series",
    category: "Sedan",
    tagline: "Business-class comfort, everyday reach",
    description:
      "A dependable, business-ready sedan for daily transfers and meetings — the same chauffeur standard as our flagship cars, sized for frequent city travel.",
    longDescription:
      "The 5 Series is our everyday business sedan — the same professional chauffeur standard and cabin comfort as our flagship vehicles, right-sized for quick, frequent city transfers. A practical choice for standing corporate accounts with regular bookings across Dubai.",
    passengers: 3,
    luggage: 2,
    idealFor: "Daily corporate transfers",
    features: [
      "Leather executive seating",
      "Rear-seat climate control",
      "Onboard Wi-Fi",
      "Privacy glass",
      "Ambient interior lighting",
      "Bottled water & amenities",
    ],
    whyChoose: [
      "A cost-efficient option for standing corporate accounts with frequent bookings",
      "The same professional chauffeur standard as every vehicle in the fleet",
      "Comfortably sized for quick point-to-point city transfers",
      "Reliable same-day and next-day availability",
    ],
    faqs: [
      {
        question: "Is the BMW 5 Series suitable for corporate accounts?",
        answer:
          "Yes — it's a popular choice for standing corporate accounts that need dependable, frequent city transfers.",
      },
      {
        question: "How much luggage fits in the 5 Series?",
        answer: "The 5 Series comfortably holds 2 standard suitcases plus carry-ons.",
      },
      {
        question: "Can I book the 5 Series for a full business day?",
        answer: "Yes, hourly and full-day hire are both available on request.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "toyota-land-cruiser",
    brand: "Toyota",
    model: "Land Cruiser",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 2200, fiveHours: 1300, oneHour: 380, airport: 500, extraHour: 280, additionalCity: 280 },
    name: "Toyota Land Cruiser",
    category: "SUV",
    tagline: "Dependable presence, effortless comfort",
    description:
      "The Toyota Land Cruiser pairs a commanding, capable presence with a genuinely comfortable cabin — a dependable full-size SUV for family travel, group airport transfers, and city touring across Dubai. Spacious seating and generous luggage capacity make it a versatile, trusted choice for clients who want a premium ride without compromise.",
    longDescription:
      "Built for both comfort and capability, the Land Cruiser brings a spacious three-row cabin and a smooth, composed ride to chauffeured travel in Dubai — equally suited to a full family airport transfer or a group outing beyond the city. A dependable, versatile alternative to a traditional luxury SUV.",
    passengers: 6,
    luggage: 4,
    idealFor: "Family travel & group airport transfers",
    features: [
      "Three-row leather seating",
      "Elevated ride height",
      "Ample luggage space",
      "Climate-controlled cabin",
      "Tinted privacy windows",
      "Child seat available on request",
    ],
    whyChoose: [
      "A dependable, versatile SUV for families and small groups alike",
      "Spacious three-row cabin with luggage capacity to match",
      "Composed, comfortable ride on both city roads and longer routes",
      "A trusted, practical alternative to a full-size luxury SUV",
    ],
    faqs: [
      {
        question: "How many passengers can the Land Cruiser seat?",
        answer:
          "Up to 6 passengers across three rows, with generous luggage space for a full family or small group.",
      },
      {
        question: "Is the Land Cruiser good for airport transfers?",
        answer:
          "Yes — it comfortably handles a full travel party and their luggage, with the same flight-tracking service as our other vehicles.",
      },
      {
        question: "Can I request a child seat in the Land Cruiser?",
        answer: "Yes, child seats are available on request — note it under special requests when booking.",
      },
    ],
    isPlaceholder: true,
  },
  {
    slug: "lexus-es-300h",
    brand: "Lexus",
    model: "ES 300h",
    // PLACEHOLDER sample rates — replace with confirmed pricing
    rates: { tenHours: 1700, fiveHours: 1000, oneHour: 260, airport: 360, extraHour: 210, additionalCity: 210 },
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
];
