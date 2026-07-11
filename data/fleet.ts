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

export interface FleetVehicle {
  slug: string;
  name: string;
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
}

export const FLEET: FleetVehicle[] = [
  {
    slug: "mercedes-s-class",
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
    slug: "mercedes-v-class",
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
    slug: "cadillac-escalade",
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
    slug: "range-rover-autobiography",
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
    slug: "rolls-royce-phantom",
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
];
