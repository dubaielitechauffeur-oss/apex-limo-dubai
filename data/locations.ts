export interface PopularRoute {
  from: string;
  to: string;
  duration: string;
}

export interface LocationFAQ {
  question: string;
  answer: string;
}

export interface LocationImage {
  src: string;
  alt: string;
}

export interface Location {
  slug: string;
  name: string;
  tagline: string;
  heroSubtitle: string;
  shortDescription: string;
  longDescription: string[];
  isAirport: boolean;
  popularRoutes: PopularRoute[];
  whyChoose: string[];
  faqs: LocationFAQ[];
  landmarks: string[];
  /** Card image for the /locations listing page. */
  image: LocationImage;
}

export const LOCATIONS: Location[] = [
  {
    slug: "dubai-marina",
    name: "Dubai Marina",
    image: {
      src: "/images/locations/dubai-marina.webp",
      alt: "Aerial view of Dubai Marina at sunset with the Cayan Tower and marina waterfront",
    },
    tagline: "Waterfront living, door-to-door service",
    heroSubtitle:
      "Chauffeur-driven transport across Dubai Marina — hotel pickups, dinner reservations, and DXB transfers in a premium vehicle.",
    shortDescription:
      "Reliable chauffeur service throughout Dubai Marina, from hotel pickups to airport transfers.",
    longDescription: [
      "Dubai Marina's waterfront towers, marina walk, and cluster of five-star hotels make it one of the busiest pickup zones in the city — and one where a booked chauffeur beats circling for a taxi every time. Apex covers every tower and hotel entrance along the Marina, from Cayan Tower to the JW Marriott Marquis and the Marina Walk promenade, with drivers who know exactly where each building's designated pickup point is.",
      "Most Marina bookings fall into two categories: airport transfers to and from DXB or DWC, and short hops to Downtown Dubai, Palm Jumeirah, or JBR for dinner and events. Both are covered with the same fixed pricing and live flight tracking as every other Apex booking, so whether you're heading to a meeting or a night out, the car is exactly where you need it, on time.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "Dubai Marina", to: "Dubai International Airport (DXB)", duration: "~30 min" },
      { from: "Dubai Marina", to: "Downtown Dubai", duration: "~25 min" },
      { from: "Dubai Marina", to: "Palm Jumeirah", duration: "~15 min" },
      { from: "Dubai Marina", to: "Business Bay", duration: "~25 min" },
    ],
    whyChoose: [
      "Drivers know exact pickup points for every Marina tower and hotel",
      "Fast access to Sheikh Zayed Road for airport and city transfers",
      "Fixed pricing regardless of Marina traffic or event nights",
      "Available for daily commutes and one-off dinner bookings alike",
    ],
    faqs: [
      {
        question: "Do you pick up from Dubai Marina hotels?",
        answer:
          "Yes, we cover every hotel and residential tower in Dubai Marina, including designated lobby and valet pickup points.",
      },
      {
        question: "How long is the drive from Dubai Marina to DXB?",
        answer:
          "Typically 30–35 minutes depending on traffic; we build in a buffer and track your flight for departures.",
      },
      {
        question: "Can I book a chauffeur for a night out in the Marina?",
        answer:
          "Yes, hourly hire is available for dinners, events, or an evening moving between venues.",
      },
      {
        question: "Is waiting time included with the booking?",
        answer: "Yes, your chauffeur waits with the vehicle — no need to arrange separate parking.",
      },
    ],
    landmarks: ["Marina Walk", "Cayan Tower", "JW Marriott Marquis", "Dubai Marina Mall", "Skydive Dubai"],
  },
  {
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    image: {
      src: "/images/locations/palm-jumeirah.webp",
      alt: "Luxury resort courtyard and pool lined with palm trees on Palm Jumeirah at dusk",
    },
    tagline: "Island access, without the wait",
    heroSubtitle:
      "Private chauffeur service to and from Palm Jumeirah's hotels, villas, and beach clubs.",
    shortDescription:
      "Discreet chauffeur transport for Palm Jumeirah villas, resorts, and beachfront events.",
    longDescription: [
      "Palm Jumeirah's villas and beachfront resorts sit along a single access road, which makes a pre-booked chauffeur especially useful — no waiting for a taxi at the gate, no uncertainty about pickup points at Atlantis or the villa communities' security gates. Apex drivers know the Palm's fronds and access roads well, so pickups run smoothly whether it's a private villa or a resort entrance.",
      "The Palm is also one of Dubai's most popular wedding and event destinations, and we regularly coordinate Rolls-Royce Phantom bookings and guest convoys for resorts along the crescent. For everyday travel, airport transfers and trips into Downtown Dubai or the Marina are the most common bookings.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "Palm Jumeirah", to: "Dubai International Airport (DXB)", duration: "~35 min" },
      { from: "Palm Jumeirah", to: "Dubai Marina", duration: "~15 min" },
      { from: "Palm Jumeirah", to: "Downtown Dubai", duration: "~30 min" },
      { from: "Palm Jumeirah", to: "JBR", duration: "~15 min" },
    ],
    whyChoose: [
      "Drivers familiar with Palm frond access roads and villa security gates",
      "Preferred choice for Palm resort weddings and events",
      "Discreet pickups for villa residents and hotel guests",
      "Coordinated convoys for resort events along the crescent",
    ],
    faqs: [
      {
        question: "Do you provide chauffeur service to Palm Jumeirah villas?",
        answer:
          "Yes, we regularly serve private villas on the Palm, coordinating access through community security gates.",
      },
      {
        question: "Can you arrange transport for a Palm Jumeirah wedding?",
        answer:
          "Yes, the Palm is one of our most requested wedding destinations — we coordinate the Rolls-Royce Phantom and guest convoys for resorts along the crescent.",
      },
      {
        question: "How far is Palm Jumeirah from the airport?",
        answer: "Around 35 minutes to DXB depending on traffic, and longer to DWC.",
      },
      {
        question: "Do you serve Atlantis and the Palm resorts?",
        answer: "Yes, we cover all major hotels and resorts on Palm Jumeirah.",
      },
    ],
    landmarks: ["Atlantis The Palm", "Palm West Beach", "The Pointe", "Nakheel Mall", "Palm Jumeirah Boardwalk"],
  },
  {
    slug: "downtown-dubai",
    name: "Downtown Dubai",
    image: {
      src: "/images/locations/downtown-dubai.webp",
      alt: "Aerial night view of Burj Khalifa, The Address Downtown, and Dubai Fountain",
    },
    tagline: "The city's front door",
    heroSubtitle:
      "Chauffeur service around Burj Khalifa, Dubai Mall, and Downtown's hotels and residences.",
    shortDescription:
      "Chauffeur transport across Downtown Dubai, coordinated with hotel and venue pickup points.",
    longDescription: [
      "Downtown Dubai is the city's most concentrated hub of hotels, offices, and landmarks — the Burj Khalifa, Dubai Mall, nearby DIFC, and a dense cluster of five-star hotels all within a few minutes of each other. It's also one of the more restricted areas for casual pickups, with valet-only access at many towers and heavy event traffic around Dubai Fountain. A pre-booked chauffeur who knows the entry points saves real time here.",
      "Downtown bookings range from corporate transfers to DIFC and Dubai Mall meetings, to evening bookings for dinner near Burj Khalifa, to airport transfers timed around the area's traffic patterns. We coordinate pickup points directly with hotel concierge teams for a smooth departure every time.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "Downtown Dubai", to: "Dubai International Airport (DXB)", duration: "~20 min" },
      { from: "Downtown Dubai", to: "Business Bay", duration: "~10 min" },
      { from: "Downtown Dubai", to: "Dubai Marina", duration: "~25 min" },
      { from: "Downtown Dubai", to: "Palm Jumeirah", duration: "~30 min" },
    ],
    whyChoose: [
      "Coordinated pickup points with major hotel concierge teams",
      "Fastest routing to DXB from central Dubai",
      "Experience navigating Downtown's event and fountain-show traffic",
      "Popular for DIFC and Dubai Mall business meetings",
    ],
    faqs: [
      {
        question: "Do you serve Downtown Dubai hotels and DIFC?",
        answer:
          "Yes, we cover Downtown hotels, DIFC offices, and the Dubai Mall area with coordinated pickup points.",
      },
      {
        question: "How far is Downtown Dubai from DXB?",
        answer: "Approximately 20 minutes under normal traffic — one of the shortest airport routes in the city.",
      },
      {
        question: "Can you handle pickups during Dubai Fountain shows or events?",
        answer: "Yes, our chauffeurs plan around Downtown's event traffic and fountain-show closures.",
      },
      {
        question: "Do you offer hourly hire for Downtown business meetings?",
        answer: "Yes, hourly and half-day hire are available for moving between DIFC and Downtown meetings.",
      },
    ],
    landmarks: ["Burj Khalifa", "The Dubai Mall", "Dubai Opera", "DIFC", "Dubai Fountain"],
  },
  {
    slug: "business-bay",
    name: "Business Bay",
    image: {
      src: "/images/locations/business-bay.webp",
      alt: "Burj Khalifa and Business Bay skyline at dusk, viewed from the Dubai Water Canal bridge",
    },
    tagline: "Built for the working day",
    heroSubtitle:
      "Dependable chauffeur transport for Business Bay's offices, towers, and waterfront hotels.",
    shortDescription:
      "Corporate-focused chauffeur service across Business Bay's offices and waterfront hotels.",
    longDescription: [
      "Business Bay's dense grid of office towers sits right next to Downtown Dubai, making it one of the city's busiest corporate pickup zones. Meeting schedules here run tight, and traffic on Al Abraj Street and Marasi Drive can be unpredictable, so we build realistic timing into every Business Bay booking rather than relying on optimistic estimates.",
      "Corporate clients based in Business Bay use Apex for daily executive transport, roadshow logistics between offices, and airport transfers before and after international travel — often on standing accounts with monthly invoicing rather than one-off bookings.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "Business Bay", to: "Dubai International Airport (DXB)", duration: "~20 min" },
      { from: "Business Bay", to: "Downtown Dubai", duration: "~10 min" },
      { from: "Business Bay", to: "Dubai Marina", duration: "~25 min" },
      { from: "Business Bay", to: "DIFC", duration: "~10 min" },
    ],
    whyChoose: [
      "Realistic timing built around Business Bay's traffic patterns",
      "Preferred by corporate accounts for daily executive transport",
      "Fast connections to DIFC, Downtown, and Sheikh Zayed Road",
      "Monthly invoicing available for standing business accounts",
    ],
    faqs: [
      {
        question: "Do you offer daily chauffeur service for Business Bay offices?",
        answer: "Yes, many of our corporate accounts are based in Business Bay with daily or recurring bookings.",
      },
      {
        question: "How long does it take to reach DXB from Business Bay?",
        answer: "Around 20 minutes under normal conditions, given Business Bay's proximity to Sheikh Zayed Road.",
      },
      {
        question: "Can you set up a corporate account for our Business Bay office?",
        answer: "Yes, we set up standing corporate accounts with monthly invoicing for teams based in Business Bay.",
      },
      {
        question: "Do you cover both towers and waterfront hotels in Business Bay?",
        answer: "Yes, we serve the full Business Bay area, including office towers and hotels along the canal.",
      },
    ],
    landmarks: ["Bay Avenue", "Dubai Canal", "JW Marriott Marquis Business Bay", "Marasi Business Bay"],
  },
  {
    slug: "jbr",
    name: "JBR",
    image: {
      src: "/images/locations/jbr.webp",
      alt: "JBR beach at sunset with Ain Dubai observation wheel in the background",
    },
    tagline: "Beachfront pickups, made simple",
    heroSubtitle: "Chauffeur service along JBR's beachfront towers, The Walk, and The Beach.",
    shortDescription:
      "Chauffeur transport across Jumeirah Beach Residence, timed around The Walk and The Beach.",
    longDescription: [
      "JBR's beachfront towers and The Walk promenade draw both residents and visitors, and pickup logistics can be tricky during peak evening hours when The Walk and The Beach are busiest. Apex chauffeurs know the designated pickup bays for each JBR tower and coordinate timing around beachfront events and weekend crowds.",
      "JBR bookings are typically a mix of airport transfers, evening trips to Downtown Dubai or Palm Jumeirah for dinner, and hourly hire for a day spent moving between the beach, The Walk, and nearby Dubai Marina.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "JBR", to: "Dubai International Airport (DXB)", duration: "~30 min" },
      { from: "JBR", to: "Dubai Marina", duration: "~10 min" },
      { from: "JBR", to: "Palm Jumeirah", duration: "~15 min" },
      { from: "JBR", to: "Downtown Dubai", duration: "~30 min" },
    ],
    whyChoose: [
      "Chauffeurs know designated pickup bays for every JBR tower",
      "Timing built around The Walk and The Beach's peak crowds",
      "Quick access to neighbouring Dubai Marina and Palm Jumeirah",
      "Available for beach days, dinners, and airport transfers alike",
    ],
    faqs: [
      {
        question: "Do you pick up directly from JBR towers?",
        answer:
          "Yes, our chauffeurs use the designated pickup bays for each JBR tower and coordinate timing in advance.",
      },
      {
        question: "Is JBR close to Dubai Marina?",
        answer: "Yes, JBR sits right next to Dubai Marina, around a 10-minute drive.",
      },
      {
        question: "Can I book a chauffeur for a beach day in JBR?",
        answer:
          "Yes, hourly hire is available if you'd like the car to wait while you spend time at The Beach or The Walk.",
      },
      {
        question: "How far is JBR from the airport?",
        answer: "Approximately 30 minutes to DXB under normal traffic conditions.",
      },
    ],
    landmarks: ["The Walk JBR", "The Beach", "Bluewaters Island", "Ain Dubai"],
  },
  {
    slug: "dubai-international-airport-dxb",
    name: "Dubai International Airport (DXB)",
    image: {
      src: "/images/locations/dubai-international-airport-dxb.webp",
      alt: "Emirates aircraft lined up at Dubai International Airport terminal",
    },
    tagline: "Meet-and-greet, every arrival",
    heroSubtitle:
      "Chauffeur-driven transfers to and from Dubai International Airport, with live flight tracking on every booking.",
    shortDescription:
      "Meet-and-greet airport transfers to and from DXB, covering all three terminals.",
    longDescription: [
      "DXB is one of the busiest airports in the world, and a smooth arrival or departure here depends on details most services skip — knowing which terminal your flight uses, tracking delays automatically, and having a chauffeur who's actually waiting when you land rather than circling the arrivals loop. Apex covers all three DXB terminals, with meet-and-greet service and name signage for every arrival.",
      "For departures, we time pickups around DXB's check-in and security patterns for your specific terminal and airline, building in a realistic buffer rather than an optimistic one. Whether you're arriving for a single meeting or departing after a long stay, the same fixed pricing and flight tracking apply.",
    ],
    isAirport: true,
    popularRoutes: [
      { from: "DXB Airport", to: "Downtown Dubai", duration: "~20 min" },
      { from: "DXB Airport", to: "Business Bay", duration: "~20 min" },
      { from: "DXB Airport", to: "Dubai Marina", duration: "~30 min" },
      { from: "DXB Airport", to: "Palm Jumeirah", duration: "~35 min" },
    ],
    whyChoose: [
      "Coverage across all three DXB terminals",
      "Live flight tracking adjusts pickup automatically for delays",
      "Meet-and-greet with name signage in the arrivals hall",
      "Realistic departure timing based on terminal and airline",
    ],
    faqs: [
      {
        question: "Which DXB terminals do you cover?",
        answer: "All three DXB terminals — Terminal 1, 2, and 3 — are covered for both arrivals and departures.",
      },
      {
        question: "What if my flight into DXB is delayed?",
        answer: "We track your flight automatically and adjust your pickup time at no extra charge.",
      },
      {
        question: "How early should I be picked up for a DXB departure?",
        answer:
          "We build in a buffer based on your terminal and airline's typical check-in times, confirmed with you the evening before.",
      },
      {
        question: "Do you offer meet-and-greet service at DXB?",
        answer: "Yes, your chauffeur waits in the arrivals hall with name signage and helps with luggage.",
      },
    ],
    landmarks: ["Terminal 1", "Terminal 2", "Terminal 3", "Dubai Duty Free"],
  },
];
