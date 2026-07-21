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
  /** Optional desktop-only override for this location's detail-page hero
   *  background, shown at >=768px width. Falls back to `image` when unset. */
  heroDesktopImage?: LocationImage;
  /** Optional mobile-only override for this location's detail-page hero
   *  background, shown below 768px width. Falls back to `image` when unset.
   *  Independent of `heroDesktopImage` — either can be set without the
   *  other, and neither affects `image` itself (still used elsewhere, e.g.
   *  the /locations listing card and this page's FAQ background). */
  heroMobileImage?: LocationImage;
  /** Optional CSS object-position for the hero background (e.g. "80% center").
   *  Applied via inline style, not a Tailwind class, since this file isn't
   *  in Tailwind's content scan. Defaults to "center" when unset. */
  heroObjectPosition?: string;
  /** Short 2-3 word chips shown on the homepage location card (not full sentences). */
  tags: string[];
}

export const LOCATIONS: Location[] = [
  {
    slug: "dubai-marina",
    name: "Dubai Marina",
    tags: ["Luxury Hotels", "Private Transfers", "VIP Pickups"],
    image: {
      src: "/images/locations/dubai-marina.webp",
      alt: "Aerial view of Dubai Marina at sunset with the Cayan Tower and marina waterfront",
    },
    heroDesktopImage: {
      src: "/images/locations/dubai-marina-hero-desktop.webp",
      alt: "Dubai Marina skyline viewed from the water, with the Marina's towers under a clear teal sky",
    },
    heroMobileImage: {
      src: "/images/locations/dubai-marina-hero-mobile.webp",
      alt: "Aerial dusk view of Dubai Marina's towers, waterway, and yacht-filled harbor",
    },
    tagline: "Waterfront living, door-to-door service",
    heroSubtitle:
      "Chauffeur-driven transport across Dubai Marina — hotel pickups, dinner reservations, and DXB transfers in a premium vehicle.",
    shortDescription:
      "Reliable chauffeur service throughout Dubai Marina, from hotel pickups to airport transfers.",
    longDescription: [
      "Dubai Marina's waterfront towers and cluster of five-star hotels make it one of Dubai's busiest pickup zones. Apex chauffeurs know the designated pickup point for every tower along the Marina — from Cayan Tower to the JW Marriott Marquis and Marina Walk — so bookings run smoothly instead of circling for a taxi, even on a busy weekend night.",
      "Airport transfers are the most-booked trip out of the Marina, typically 25–35 minutes to DXB with live flight tracking on arrivals and a realistic buffer for departures. Business travelers commuting into DIFC or Business Bay, and standing corporate accounts based at Marina hotels, get the same fixed-price, punctual standard.",
      "Leisure is where the Marina shines — dinner along Marina Walk, an evening at a yacht club, or a Skydive Dubai booking all suit hourly hire, with the car waiting nearby. Palm Jumeirah and JBR are both under 15 minutes away, making a multi-stop evening easy. Fleet choice ranges from an S-Class or 7 Series for business to a Range Rover or Rolls-Royce for a special night out.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "Dubai Marina", to: "Dubai International Airport (DXB)", duration: "~30 min" },
      { from: "Dubai Marina", to: "Downtown Dubai", duration: "~25 min" },
      { from: "Dubai Marina", to: "Palm Jumeirah", duration: "~15 min" },
      { from: "Dubai Marina", to: "Business Bay", duration: "~25 min" },
      { from: "Dubai Marina", to: "JBR", duration: "~10 min" },
    ],
    whyChoose: [
      "Drivers know the exact designated pickup point for every Marina tower and hotel entrance",
      "Fast, direct access to Sheikh Zayed Road for both airport and city transfers",
      "Fixed pricing that holds regardless of Marina traffic or a busy event night",
      "Equally available for a standing daily commute and a one-off dinner booking",
      "Hourly hire lets the car wait between stops along Marina Walk's restaurants and venues",
      "Genuinely familiar with weekend and event-night congestion around the promenade and marina",
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
      {
        question: "Do you provide daily commute service for Marina residents working in DIFC or Business Bay?",
        answer:
          "Yes, many Marina residents use Apex for a standing daily or weekly commute into the business districts, billed the same as any recurring booking.",
      },
      {
        question: "Can you time a pickup around a Skydive Dubai booking?",
        answer:
          "Yes, we coordinate pickup and return timing around Skydive Dubai bookings and other Marina-based activities on request.",
      },
      {
        question: "Can I book a chauffeur for a full day exploring the Marina and nearby areas?",
        answer:
          "Yes, full-day hourly hire is popular here — the same car and driver can cover the Marina, JBR, and Palm Jumeirah in one booking.",
      },
      {
        question: "Do you serve the newer towers and developments along the Marina promenade?",
        answer:
          "Yes, we keep pace with new towers as they open along the Marina and confirm exact pickup points before your first booking.",
      },
    ],
    landmarks: ["Marina Walk", "Cayan Tower", "JW Marriott Marquis", "Dubai Marina Mall", "Skydive Dubai", "Marina Yacht Club"],
  },
  {
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    tags: ["Resorts", "Luxury Villas", "Airport Transfers"],
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
      "Palm Jumeirah's villas and beachfront resorts sit along a single access road, so a pre-booked chauffeur avoids the uncertainty of a taxi at the gate. Apex drivers know the Palm's fronds, resort entrances, and villa community security well, whether the pickup is deep on a frond or right on the trunk near Atlantis.",
      "Airport transfers run around 35 minutes to DXB, with flight tracking and a realistic buffer built in for the extra trunk-road distance. The Palm is also one of Dubai's leading wedding destinations — Apex regularly coordinates Rolls-Royce Phantom bookings and guest convoys for resorts along the crescent.",
      "Leisure bookings dominate here: dinner at a destination restaurant, a beach club day, or an evening moving between The Pointe and Palm West Beach. Dubai Marina and JBR are about 15 minutes down the trunk road, easy to combine with a Palm dinner in one hourly booking. Fleet ranges from the Rolls-Royce Ghost or Phantom for occasions to the usual S-Class and Range Rover for everyday transfers.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "Palm Jumeirah", to: "Dubai International Airport (DXB)", duration: "~35 min" },
      { from: "Palm Jumeirah", to: "Dubai Marina", duration: "~15 min" },
      { from: "Palm Jumeirah", to: "Downtown Dubai", duration: "~30 min" },
      { from: "Palm Jumeirah", to: "JBR", duration: "~15 min" },
      { from: "Palm Jumeirah", to: "Business Bay", duration: "~30 min" },
    ],
    whyChoose: [
      "Drivers genuinely familiar with Palm frond access roads and villa security gates",
      "A preferred choice for Palm resort weddings and coordinated guest events",
      "Discreet, punctual pickups for both villa residents and hotel guests",
      "Coordinated multi-vehicle convoys for resort events along the crescent",
      "Realistic timing that accounts for the trunk road's added driving distance",
      "Well suited to combining a Palm resort dinner with a Marina or JBR nightcap",
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
      {
        question: "Can I book a chauffeur for a beach club or resort dinner on the Palm?",
        answer:
          "Yes, hourly hire is popular here — the car waits at the resort and is ready whenever you finish dinner or a beach club day.",
      },
      {
        question: "Is it possible to combine a Palm dinner with a Marina visit in one booking?",
        answer:
          "Yes, an hourly booking easily covers a Palm resort dinner followed by a stop in Dubai Marina or JBR, both around 15 minutes away.",
      },
      {
        question: "Do you provide transport for corporate events hosted at Palm resorts?",
        answer:
          "Yes, we handle guest transport and executive transfers for corporate functions and conferences hosted at Palm Jumeirah resorts.",
      },
      {
        question: "How far ahead should we book a Palm Jumeirah wedding convoy?",
        answer:
          "We recommend 2–3 weeks minimum, since wedding dates and popular vehicles like the Rolls-Royce Phantom are reserved well in advance.",
      },
      {
        question: "Can you provide a chauffeur for a day trip that includes both Palm resorts and the Marina?",
        answer:
          "Yes, an hourly or full-day booking can easily combine a Palm resort visit with time in Dubai Marina, both a short drive apart.",
      },
    ],
    landmarks: [
      "Atlantis The Palm",
      "Palm West Beach",
      "The Pointe",
      "Nakheel Mall",
      "Palm Jumeirah Boardwalk",
      "Club Vista Mare",
    ],
  },
  {
    slug: "downtown-dubai",
    name: "Downtown Dubai",
    tags: ["Burj Khalifa", "Dubai Mall", "Executive Travel"],
    image: {
      src: "/images/locations/downtown-dubai.webp",
      alt: "Aerial night view of Burj Khalifa, The Address Downtown, and Dubai Fountain",
    },
    heroDesktopImage: {
      src: "/images/locations/downtown-dubai-hero-desktop.webp",
      alt: "Panoramic night skyline of Downtown Dubai with the Burj Khalifa illuminated above the waterfront",
    },
    tagline: "The city's front door",
    heroSubtitle:
      "Chauffeur service around Burj Khalifa, Dubai Mall, and Downtown's hotels and residences.",
    shortDescription:
      "Chauffeur transport across Downtown Dubai, coordinated with hotel and venue pickup points.",
    longDescription: [
      "Downtown Dubai packs the Burj Khalifa, Dubai Mall, and a dense cluster of five-star hotels within a few minutes of each other — along with valet-only tower access and heavy Dubai Fountain event traffic. Apex chauffeurs know the entry points and current fountain-show schedule, so a pickup here doesn't cost you fifteen minutes before the car even moves.",
      "Airport transfers are among the fastest in the city, typically around 20 minutes to DXB, with the same flight tracking and departure buffer as every Apex booking. Downtown's proximity to DIFC makes it a hub for executive travel — teams moving between DIFC meetings and Downtown hotels rely on chauffeurs who know both districts' access and parking.",
      "Leisure here centers on the area's own landmarks: dinner overlooking the Burj Khalifa, an evening at Dubai Opera, or a Dubai Mall shopping trip — all well suited to hourly hire. Business Bay is 10 minutes away, and Dubai Marina or Palm Jumeirah are 25–30 minutes out. Fleet choice spans S-Class and 7 Series sedans to Range Rover and Rolls-Royce for the area's more photogenic evenings.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "Downtown Dubai", to: "Dubai International Airport (DXB)", duration: "~20 min" },
      { from: "Downtown Dubai", to: "Business Bay", duration: "~10 min" },
      { from: "Downtown Dubai", to: "Dubai Marina", duration: "~25 min" },
      { from: "Downtown Dubai", to: "Palm Jumeirah", duration: "~30 min" },
      { from: "Downtown Dubai", to: "DIFC", duration: "~10 min" },
    ],
    whyChoose: [
      "Coordinated pickup points arranged directly with major hotel concierge teams",
      "One of the fastest routings to DXB from anywhere in central Dubai",
      "Real experience navigating Downtown's event, fountain-show, and plaza traffic",
      "A popular choice for DIFC and Dubai Mall business meetings alike",
      "Chauffeurs track the current fountain-show schedule to avoid avoidable delays",
      "Central location makes combining Downtown with several other areas straightforward",
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
      {
        question: "Can you combine a Downtown dinner booking with a trip to Business Bay?",
        answer:
          "Yes, Business Bay is around 10 minutes away, so combining a Downtown evening with a Business Bay stop works well within one hourly booking.",
      },
      {
        question: "Do valet-only towers in Downtown cause pickup delays?",
        answer:
          "Not usually — our chauffeurs already know the valet arrangements and access points for Downtown's major towers and hotels.",
      },
      {
        question: "Can you arrange a chauffeur for a Dubai Opera performance or Souk Al Bahar dinner?",
        answer:
          "Yes, we regularly handle evening bookings around Dubai Opera and Souk Al Bahar, timed to fit performance schedules and dinner reservations.",
      },
      {
        question: "Do you offer a full-day booking covering both Downtown and DIFC meetings?",
        answer:
          "Yes, a full-day booking comfortably covers both, given the short 10-minute distance between Downtown and DIFC.",
      },
      {
        question: "Can you arrange a chauffeur for a Burj Khalifa observation deck visit?",
        answer:
          "Yes, we regularly time pickups and drop-offs around Burj Khalifa observation deck bookings, coordinating with entry time slots on request.",
      },
      {
        question: "Do you serve visitors staying at Downtown hotels for a multi-day trip?",
        answer:
          "Yes, Downtown hotel guests frequently use Apex for the full length of their stay — airport transfer, daily sightseeing, and departure, all on one account.",
      },
    ],
    landmarks: ["Burj Khalifa", "The Dubai Mall", "Dubai Opera", "DIFC", "Dubai Fountain", "Souk Al Bahar"],
  },
  {
    slug: "business-bay",
    name: "Business Bay",
    tags: ["Corporate Travel", "Business Meetings", "Executive Chauffeurs"],
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
      "Business Bay's dense grid of office towers sits beside Downtown Dubai, making it one of the city's busiest corporate pickup zones. Meeting schedules run tight and traffic on Al Abraj Street and Marasi Drive can be unpredictable, so every booking gets a realistic timing buffer rather than an optimistic estimate.",
      "Airport transfers run around 20 minutes to DXB via Sheikh Zayed Road. This is where most of our standing corporate accounts are based — daily executive commutes, roadshow logistics between towers, and airport transfers bookending international trips, frequently billed on monthly invoicing rather than per trip.",
      "Leisure bookings are smaller in volume but real — waterfront dinners along Bay Avenue and the Dubai Canal are popular with hotel guests. Business Bay sits minutes from Downtown and DIFC, ideal for full-day bookings spanning several districts. Fleet leans toward S-Class and 7 Series for daily commutes, with V-Class and Escalade for team roadshows and a Rolls-Royce available for VIP arrivals.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "Business Bay", to: "Dubai International Airport (DXB)", duration: "~20 min" },
      { from: "Business Bay", to: "Downtown Dubai", duration: "~10 min" },
      { from: "Business Bay", to: "Dubai Marina", duration: "~25 min" },
      { from: "Business Bay", to: "DIFC", duration: "~10 min" },
      { from: "Business Bay", to: "Palm Jumeirah", duration: "~30 min" },
    ],
    whyChoose: [
      "Realistic timing built specifically around Business Bay's own traffic patterns",
      "A preferred choice for corporate accounts running daily executive transport",
      "Fast, direct connections to DIFC, Downtown, and Sheikh Zayed Road",
      "Monthly invoicing available for standing business accounts of any size",
      "Well suited to full-day bookings that combine several nearby business districts",
      "Genuinely familiar with Bay Avenue and Dubai Canal evening bookings",
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
      {
        question: "Can you handle a day combining meetings in Business Bay, Downtown, and DIFC?",
        answer:
          "Yes, a full-day booking comfortably covers all three, since they sit within about 10 minutes of each other.",
      },
      {
        question: "Is Bay Avenue a common pickup point for evening bookings?",
        answer:
          "Yes, dinner and evening bookings along Bay Avenue and the Dubai Canal are common, and our chauffeurs know the area's specific access points.",
      },
      {
        question: "Do you serve offices in Dubai Design District near Business Bay?",
        answer:
          "Yes, we cover Dubai Design District as part of the wider Business Bay area, including recurring pickups for teams based there.",
      },
      {
        question: "Can you handle a roadshow moving between several Business Bay towers in one morning?",
        answer:
          "Yes, roadshow logistics between towers is one of the most common bookings we run for Business Bay corporate accounts.",
      },
      {
        question: "Do you provide chauffeur service for guests staying at Business Bay's waterfront hotels?",
        answer:
          "Yes, hotel guests along the Dubai Canal use Apex for both business travel and leisure bookings during their stay, with the same fixed pricing.",
      },
      {
        question: "Is parking or valet handled at Business Bay office towers?",
        answer:
          "Our chauffeurs already know the valet and drop-off arrangements at Business Bay's major towers, so pickups run smoothly without guesswork.",
      },
      {
        question: "Can Business Bay corporate accounts include occasional airport pickups for visiting clients?",
        answer:
          "Yes, visiting client pickups are commonly added to an existing Business Bay corporate account and billed on the same monthly invoice.",
      },
    ],
    landmarks: ["Bay Avenue", "Dubai Canal", "JW Marriott Marquis Business Bay", "Marasi Business Bay", "Dubai Design District"],
  },
  {
    slug: "jbr",
    name: "JBR",
    tags: ["Luxury Residences", "VIP Transportation", "Leisure Travel"],
    image: {
      src: "/images/locations/jbr.webp",
      alt: "JBR beach at sunset with Ain Dubai observation wheel in the background",
    },
    heroDesktopImage: {
      src: "/images/locations/jbr-hero.webp",
      alt: "Sunset at JBR beach with Ain Dubai observation wheel and The Beach promenade",
    },
    heroMobileImage: {
      src: "/images/locations/jbr-hero.webp",
      alt: "Sunset at JBR beach with Ain Dubai observation wheel and The Beach promenade",
    },
    heroObjectPosition: "80% center",
    tagline: "Beachfront pickups, made simple",
    heroSubtitle: "Chauffeur service along JBR's beachfront towers, The Walk, and The Beach.",
    shortDescription:
      "Chauffeur transport across Jumeirah Beach Residence, timed around The Walk and The Beach.",
    longDescription: [
      "JBR's beachfront towers and The Walk promenade draw both residents and visitors, and pickup logistics can be tricky during peak evening hours. Apex chauffeurs know the designated pickup bay for every JBR tower and coordinate timing around beachfront events and weekend crowds.",
      "Airport transfers run around 30 minutes to DXB, slightly longer than neighbouring Dubai Marina due to the beachfront road layout, with the same flight tracking and departure buffer as every booking. Business travelers based in JBR's residential towers get the same punctual standard for their daily commute.",
      "Leisure is the majority of what we're booked for here — The Walk's restaurants, The Beach's daytime scene, and evenings that easily extend to Bluewaters Island and Ain Dubai, just across the water. Dubai Marina is 10 minutes away. Fleet choice is flexible: an S-Class or 7 Series for transfers, a Range Rover or more distinctive vehicle for a beachfront evening out.",
    ],
    isAirport: false,
    popularRoutes: [
      { from: "JBR", to: "Dubai International Airport (DXB)", duration: "~30 min" },
      { from: "JBR", to: "Dubai Marina", duration: "~10 min" },
      { from: "JBR", to: "Palm Jumeirah", duration: "~15 min" },
      { from: "JBR", to: "Downtown Dubai", duration: "~30 min" },
      { from: "JBR", to: "Bluewaters Island", duration: "~10 min" },
    ],
    whyChoose: [
      "Chauffeurs know the designated pickup bay for every individual JBR tower",
      "Timing genuinely built around The Walk and The Beach's peak evening crowds",
      "Quick, direct access to neighbouring Dubai Marina and Palm Jumeirah",
      "Equally available for beach days, dinner bookings, and airport transfers",
      "Comfortable combining a Walk dinner with a Bluewaters Island or Ain Dubai visit",
      "Genuinely familiar with weekend beachfront congestion and event-related road closures",
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
      {
        question: "Can you combine a JBR dinner with a visit to Bluewaters Island?",
        answer:
          "Yes, Bluewaters is around 10 minutes from JBR, and an hourly booking easily covers both destinations in one evening.",
      },
      {
        question: "Do weekend crowds on The Walk cause pickup delays?",
        answer:
          "Our chauffeurs plan for weekend and evening congestion around The Walk, using access roads that stay clearer during peak hours.",
      },
      {
        question: "Can you arrange a chauffeur for a ride on Ain Dubai?",
        answer:
          "Yes, we regularly time pickups and drop-offs around Ain Dubai bookings, coordinating with the wheel's own arrival and departure flow.",
      },
      {
        question: "Do you offer transport for residents living in JBR's residential towers?",
        answer:
          "Yes, JBR residents use Apex for both daily commutes to work and evening trips, with chauffeurs familiar with each tower's pickup bay.",
      },
      {
        question: "Can you book a chauffeur for visiting family staying at a JBR hotel?",
        answer:
          "Yes, we regularly handle transport for visitors staying at JBR beachfront hotels, from airport transfers to daily sightseeing bookings.",
      },
      {
        question: "Is it easy to book a same-day chauffeur while already in JBR?",
        answer:
          "Yes, same-day bookings are straightforward via WhatsApp or our website — most are confirmed within minutes for pickups anywhere along the beachfront.",
      },
    ],
    landmarks: ["The Walk JBR", "The Beach", "Bluewaters Island", "Ain Dubai", "JBR Beachfront"],
  },
  {
    slug: "dubai-international-airport-dxb",
    name: "Dubai International Airport (DXB)",
    tags: ["Meet & Greet", "Flight Tracking", "Executive Pickup"],
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
      "DXB is one of the busiest airports in the world, and a smooth arrival depends on details most services skip — knowing your terminal, tracking delays automatically, and having a chauffeur already positioned before you land. Apex covers all three DXB terminals with meet-and-greet service and name signage on every arrival.",
      "Business travel through DXB is a major share of what we handle — executives need a fast, discreet transfer straight to a Downtown or Business Bay hotel, and standing corporate accounts often route all international travel through the same driver pool and billing. Leisure travelers get equal attention, with a Rolls-Royce Ghost or Phantom available to make an arrival part of the occasion.",
      "Downtown Dubai and Business Bay are both about 20 minutes from DXB, Dubai Marina and JBR around 30, and Palm Jumeirah roughly 35 given the added trunk-road distance. Departures get the same care, timed around your specific terminal and airline's check-in patterns, confirmed with you the evening before — with fixed pricing and 24/7 availability regardless of when your flight lands.",
    ],
    isAirport: true,
    popularRoutes: [
      { from: "DXB Airport", to: "Downtown Dubai", duration: "~20 min" },
      { from: "DXB Airport", to: "Business Bay", duration: "~20 min" },
      { from: "DXB Airport", to: "Dubai Marina", duration: "~30 min" },
      { from: "DXB Airport", to: "Palm Jumeirah", duration: "~35 min" },
      { from: "DXB Airport", to: "JBR", duration: "~30 min" },
    ],
    whyChoose: [
      "Full coverage across all three DXB terminals, for arrivals and departures alike",
      "Live flight tracking adjusts your pickup time automatically for any delay",
      "Genuine meet-and-greet service with name signage in the arrivals hall",
      "Realistic departure timing based on your specific terminal and airline",
      "Distinctive arrival vehicles available for honeymoons and milestone celebration trips",
      "Coordinated multi-vehicle pickups available for delegations and larger group arrivals",
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
      {
        question: "Can you arrange a special vehicle for a honeymoon or celebration arrival?",
        answer:
          "Yes, a Rolls-Royce Ghost or Phantom can be arranged for arrivals where the vehicle itself is part of the occasion.",
      },
      {
        question: "Can you coordinate pickups for a group arriving on the same or different flights?",
        answer:
          "Yes, we regularly coordinate multi-vehicle pickups for delegations and groups arriving together or across a cluster of flights.",
      },
      {
        question: "Do you offer transfers for transiting or connecting passengers with a long layover?",
        answer:
          "Yes, transiting passengers with a long enough layover often book a transfer into the city and back — just let us know your full itinerary when booking.",
      },
      {
        question: "How does pricing work for a DXB transfer compared to other airport services?",
        answer:
          "Pricing is fixed and quoted up front regardless of traffic or minor delays, so there's no surge pricing or metered surprise at the end of the trip.",
      },
      {
        question: "Can I book a DXB transfer for very early morning or overnight flights?",
        answer:
          "Yes, DXB transfers are available 24/7 at the same fixed pricing, whether your flight lands at 3 a.m. or departs at midnight.",
      },
    ],
    landmarks: ["Terminal 1", "Terminal 2", "Terminal 3", "Dubai Duty Free", "DXB Arrivals Hall"],
  },
];
