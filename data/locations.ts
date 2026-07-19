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
    tagline: "Waterfront living, door-to-door service",
    heroSubtitle:
      "Chauffeur-driven transport across Dubai Marina — hotel pickups, dinner reservations, and DXB transfers in a premium vehicle.",
    shortDescription:
      "Reliable chauffeur service throughout Dubai Marina, from hotel pickups to airport transfers.",
    longDescription: [
      "Dubai Marina's waterfront towers, marina walk, and cluster of five-star hotels make it one of the busiest pickup zones in the city — and one where a booked chauffeur beats circling for a taxi every time. Apex covers every tower and hotel entrance along the Marina, from Cayan Tower to the JW Marriott Marquis and the Marina Walk promenade, with drivers who know exactly where each building's designated pickup point is, whether that's a residential lobby, a hotel valet stand, or a restaurant entrance tucked along the promenade.",
      "Airport transfers are the single most booked trip out of the Marina, and for good reason — it's a genuine 25 to 35-minute drive to DXB depending on traffic and time of day, and residents and hotel guests alike want that trip handled without surprises. Every Marina airport booking includes live flight tracking for arrivals and a realistic pre-departure buffer, built around actual Sheikh Zayed Road conditions rather than an optimistic best-case estimate. For guests staying at Marina hotels ahead of an early flight, we coordinate directly with concierge teams to confirm pickup timing the evening before.",
      "Business travel out of the Marina looks a little different to Downtown or Business Bay, since most residents and hotel guests here are commuting to meetings rather than working from Marina offices. Apex handles the daily commute for Marina residents heading into DIFC or Business Bay, corporate travelers staying at Marina hotels for a conference elsewhere in the city, and the growing number of professionals who base themselves in the Marina precisely because it offers waterfront living within a short, predictable drive of the business districts.",
      "Where the Marina genuinely stands apart is leisure travel, and it's the larger share of what we're booked for here. Dinner reservations along Marina Walk, an evening at one of the yacht clubs, a booking timed around a Skydive Dubai jump, or simply a night moving between restaurants and lounges without worrying about parking — all of it works better with a car and driver already arranged and waiting. Hourly hire is popular for exactly this: the vehicle holds a position near the venue and picks up again whenever you're ready, no re-booking needed.",
      "The Marina's location also makes it a natural base for exploring the rest of Dubai's leisure coastline. Palm Jumeirah is roughly 15 minutes away, JBR is closer still, and Downtown Dubai's landmarks are a manageable 25-minute drive — close enough that many guests treat the Marina as a base and book the car for a full evening covering two or three destinations rather than a single point-to-point trip.",
      "Weekend and event nights bring their own logistics — Marina Walk gets busy, valet queues at popular restaurants back up, and casual taxi availability drops exactly when demand is highest. A pre-booked Apex chauffeur sidesteps all of it: the car is assigned to you specifically, waiting at an agreed point rather than competing for a taxi rank, and pricing stays fixed regardless of how busy the Marina gets that night.",
      "Fleet choice for Marina bookings tends to split two ways: an S-Class or 7 Series for daily commutes and business travel, and something more occasion-driven — a Range Rover or one of the Rolls-Royce models — for an evening out or a special dinner booking. Both are available on the same fixed-price, flight-tracked, driver-waits basis as every other Apex booking.",
      "Whether it's a daily airport run, a standing commute into the business districts, or a Friday night spent moving between Marina Walk restaurants, the same standard applies: a chauffeur who already knows the building, the traffic pattern, and the fastest way out of the Marina at that specific time of day.",
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
      "Palm Jumeirah's villas and beachfront resorts sit along a single access road, which makes a pre-booked chauffeur especially useful — no waiting for a taxi at the gate, no uncertainty about pickup points at Atlantis or the villa communities' security gates. Apex drivers know the Palm's fronds and access roads well, so pickups run smoothly whether it's a private villa deep on one of the fronds or a resort entrance right on the trunk.",
      "Airport transfers to and from the Palm take a little longer than from more central areas — usually around 35 minutes to DXB — simply because of the drive back down the trunk to the mainland. We factor that distance into every booking, tracking flights for arrivals and building a realistic buffer for departures so the extra distance never turns into a rushed departure or a late pickup.",
      "Business travel to Palm Jumeirah is a smaller share of what we book here compared with Downtown or Business Bay, but it isn't rare — executives staying at one of the Palm's resort hotels for a conference elsewhere in the city, or hosting a business meeting at a resort's restaurant or lounge, still need the same discreet, punctual service as any corporate booking, just with the added layer of navigating the Palm's access roads and villa or resort security.",
      "Leisure is where the Palm truly earns its reputation, and it's the majority of what Apex is booked for here. Guests staying at Atlantis or one of the crescent resorts book us for dinner reservations at destination restaurants, beach club days, and evenings spent moving between The Pointe and Palm West Beach without worrying about parking or wait times at a resort's own valet. Villa residents use the service for the same reasons residents anywhere do — reliable pickups for evenings out, without needing to arrange a taxi at a gated community's entrance.",
      "The Palm is also one of Dubai's most popular wedding and event destinations, and we regularly coordinate Rolls-Royce Phantom bookings and guest convoys for resorts along the crescent. Wedding bookings here come with their own logistics — resort access roads, specific arrival points for bridal cars, and guest transport that needs to move smoothly through a single access route rather than multiple entrances — all of which our chauffeurs plan for in advance with the resort's own events team.",
      "Popular destinations near the Palm are all a short, predictable drive away: Dubai Marina and JBR are both around 15 minutes down the trunk road, making an evening that combines a Palm resort dinner with a Marina nightcap entirely realistic in a single hourly booking. Downtown Dubai is a little further at around 30 minutes, still comfortably reachable for an evening out or a business meeting.",
      "Fleet choice for Palm bookings often leans toward the more occasion-driven end of the range — the Rolls-Royce Ghost or Phantom for weddings and standout evenings, alongside the usual S-Class and Range Rover options for everyday transfers and business travel. Whichever vehicle you choose, the same fixed pricing and flight tracking apply as anywhere else in the city.",
      "What makes chauffeur service genuinely useful on the Palm isn't just comfort — it's familiarity with a layout that can be genuinely confusing to a driver who doesn't already know it. Apex chauffeurs know which frond leads where, which resort entrance to use for guest drop-off versus valet, and how villa community access typically works, so a Palm booking runs as smoothly as one in the middle of the city.",
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
    tagline: "The city's front door",
    heroSubtitle:
      "Chauffeur service around Burj Khalifa, Dubai Mall, and Downtown's hotels and residences.",
    shortDescription:
      "Chauffeur transport across Downtown Dubai, coordinated with hotel and venue pickup points.",
    longDescription: [
      "Downtown Dubai is the city's most concentrated hub of hotels, offices, and landmarks — the Burj Khalifa, Dubai Mall, nearby DIFC, and a dense cluster of five-star hotels all within a few minutes of each other. It's also one of the more restricted areas for casual pickups, with valet-only access at many towers and heavy event traffic around Dubai Fountain. A pre-booked chauffeur who knows the entry points, the valet arrangements, and which streets close for fountain shows saves real time here, where a wrong assumption about access can cost fifteen minutes before a car has even moved.",
      "Airport transfers from Downtown are among the fastest in the city — typically around 20 minutes to DXB, since the area sits close to the airport-bound stretch of Sheikh Zayed Road. That short distance doesn't mean less attention to timing, though; we still track flights for arrivals and build a departure buffer around Downtown's own traffic patterns, which can shift quickly around Dubai Mall's opening hours or an evening fountain show.",
      "Business travel is a major part of what Downtown bookings look like, given the area's proximity to DIFC. Executives moving between DIFC meetings and Downtown hotels, teams running a full day of back-to-back appointments across both districts, and visiting delegations based at a Downtown hotel for a conference all rely on chauffeurs who know which hotel entrance to use, how DIFC's own access and parking work, and how to time a departure around the area's genuinely unpredictable event traffic.",
      "Luxury leisure travel in Downtown centers on the area's own landmarks — dinner at a restaurant overlooking the Burj Khalifa, an evening at Dubai Opera, a shopping trip through Dubai Mall that easily runs several hours. Hourly hire suits this kind of visit well: the car waits nearby rather than needing to be re-summoned, and the chauffeur already knows where pickup is realistic given whatever event or fountain show might be running that evening.",
      "Downtown sits centrally enough that most of Dubai's other major destinations are a short, predictable drive away. Business Bay is barely 10 minutes down the road, making it easy to combine a Downtown dinner with a Business Bay meeting or hotel stay. Dubai Marina and Palm Jumeirah are a little further at 25 to 30 minutes, both comfortably reachable within a single evening booking if your plans span more than one area.",
      "Dubai Fountain shows and the events regularly held around Burj Khalifa's plaza are worth planning around specifically, since road closures and pedestrian crowds can reroute a pickup with little notice. Apex chauffeurs working Downtown regularly know the current show schedule and adjust pickup points accordingly, coordinating directly with hotel concierge teams so a scheduled departure isn't disrupted by a fountain show starting nearby.",
      "Fleet choice for Downtown bookings tends to reflect its dual identity as both a business and a landmark leisure district — S-Class and 7 Series sedans for meetings and airport transfers, with Range Rover and Rolls-Royce options available for an evening built around the area's more photogenic side. All bookings carry the same fixed pricing regardless of Downtown's often unpredictable event calendar.",
      "What sets Downtown apart from most of the city is simply how much happens within a few minutes' walk of any given pickup point — hotels, offices, a mall, an opera house, and one of the world's most recognizable buildings, all sharing the same access roads. A chauffeur who already knows how those roads behave at 6 p.m. on a Thursday versus during a public holiday fountain show is the real value of booking Downtown transport through Apex rather than arranging it on the spot.",
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
      "Business Bay's dense grid of office towers sits right next to Downtown Dubai, making it one of the city's busiest corporate pickup zones. Meeting schedules here run tight, and traffic on Al Abraj Street and Marasi Drive can be unpredictable, so we build realistic timing into every Business Bay booking rather than relying on optimistic estimates that fall apart the moment a meeting runs five minutes long.",
      "Airport transfers from Business Bay benefit from the area's direct access to Sheikh Zayed Road, typically running around 20 minutes to DXB. For executives flying out after a full day of meetings, we time the pickup around the specific building's exit and the current state of Al Abraj Street traffic rather than a single blanket estimate, so a departure timed for 5 p.m. accounts for the fact that Business Bay's evening rush starts earlier than most of the city.",
      "Business travel is, unsurprisingly, the core of what Business Bay bookings are — this is where most of our standing corporate accounts are based. Daily executive transport between home or hotel and the office, roadshow logistics moving a team between several Business Bay towers in a single morning, and airport transfers bookending international trips are all routine here, frequently run on monthly invoicing rather than individual per-trip payment.",
      "Leisure travel out of Business Bay is smaller in volume than business bookings but far from absent — the waterfront hotels and restaurants along Bay Avenue and the Dubai Canal draw dinner and evening bookings, particularly from executives staying at a Business Bay hotel who want an evening out without adding a commute across the city. The canal-front walkway has become a genuine destination in its own right, and hourly hire works well for an evening spent along it.",
      "Business Bay's location next to Downtown and close to DIFC makes it one of the best-connected areas in the city for combining a full day of different bookings — a morning meeting in Business Bay, a lunch in Downtown ten minutes away, an afternoon session in DIFC, and an evening back at a Business Bay hotel, all realistically covered within a single full-day chauffeur booking rather than four separate trips.",
      "Corporate accounts based in Business Bay tend to value consistency above almost everything else — the same chauffeur pool, the same billing cycle, and the same standard of vehicle whether it's a single airport run or a week of daily commutes. Setting up an account takes one conversation about typical volume and preferred vehicles, after which individual bookings are handled the same way as any other Apex trip, just consolidated onto one monthly invoice.",
      "Fleet choice here leans heavily toward executive sedans — the S-Class and 7 Series cover the bulk of daily commute and meeting transport — with V-Class and Escalade options available for teams moving together during roadshow days, and a Rolls-Royce available for the occasional VIP arrival or signing event hosted at a Business Bay tower.",
      "What makes Business Bay work as a chauffeur service area isn't a single standout feature — it's the accumulation of realistic timing, familiarity with the area's specific traffic patterns on Al Abraj Street and Marasi Drive, and a driver pool that already understands this is a district built around tight meeting schedules, not leisurely city touring.",
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
    tagline: "Beachfront pickups, made simple",
    heroSubtitle: "Chauffeur service along JBR's beachfront towers, The Walk, and The Beach.",
    shortDescription:
      "Chauffeur transport across Jumeirah Beach Residence, timed around The Walk and The Beach.",
    longDescription: [
      "JBR's beachfront towers and The Walk promenade draw both residents and visitors, and pickup logistics can be tricky during peak evening hours when The Walk and The Beach are busiest. Apex chauffeurs know the designated pickup bays for each JBR tower and coordinate timing around beachfront events and weekend crowds, so a booking here doesn't mean circling the block looking for a legal place to stop.",
      "Airport transfers from JBR run around 30 minutes to DXB, slightly longer than from neighbouring Dubai Marina simply due to the beachfront road layout. We track flights for arrivals and build a departure buffer that accounts for The Walk's own weekend and evening congestion, which can add real time to what looks like a short drive on a map.",
      "Business travel is a smaller part of what JBR bookings look like compared with Downtown or Business Bay, but it's far from rare — professionals living in JBR's residential towers commuting to meetings elsewhere in the city, or visitors staying at a beachfront hotel here for a few days of business mixed with leisure, both use Apex for the same reliable, punctual standard as any corporate booking.",
      "Leisure is where JBR truly comes into its own, and it's the majority of what we're booked for in this area. The Walk's restaurants and cafes, The Beach's daytime scene, and the general rhythm of an evening spent moving between beachfront venues all work better with a car and chauffeur already arranged — no searching for parking near The Walk on a Friday evening, no uncertainty about where a taxi might actually be able to stop.",
      "Bluewaters Island and Ain Dubai sit just across the water from JBR and are a natural extension of an evening based here — close enough that a single hourly booking easily covers dinner on The Walk followed by a visit to Bluewaters, without needing to plan it as two separate trips. Dubai Marina, immediately next door, is often folded into the same evening for guests who want to cover both waterfront districts.",
      "Weekend evenings and beachfront events bring predictable congestion to The Walk and the surrounding roads, and it's exactly the kind of situation where a pre-booked chauffeur earns its value — the car is assigned to you rather than competing for a taxi rank, and your chauffeur already knows which access road stays clear when The Walk itself is at its busiest.",
      "Fleet choice for JBR bookings tends to be flexible, since the area serves everything from a quick airport transfer to a full day at the beach followed by an evening out. An S-Class or 7 Series suits most transfers and business travel, while a Range Rover or one of the more distinctive vehicles suits a special evening spent moving along the beachfront.",
      "Ain Dubai, the observation wheel anchoring Bluewaters Island, has become a common addition to a JBR evening booking — guests often combine a ride on the wheel with dinner on The Walk, and our chauffeurs coordinate timing around the wheel's own boarding schedule so the car is exactly where you need it once you're done. It's the kind of small logistical detail that's easy to overlook until you're the one standing on a curb without a ride.",
      "What makes chauffeur service work well in JBR is less about any single feature and more about a driver who already knows this stretch of coastline — where each tower's pickup bay actually is, how The Walk's crowds shift through the day, and the quickest way in or out when the beachfront is at its busiest.",
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
      "DXB is one of the busiest airports in the world, and a smooth arrival or departure here depends on details most services skip — knowing which terminal your flight uses, tracking delays automatically, and having a chauffeur who's actually waiting when you land rather than circling the arrivals loop. Apex covers all three DXB terminals, with meet-and-greet service and name signage for every arrival, and a chauffeur positioned before your flight is even scheduled to land.",
      "Chauffeur service starting at DXB covers far more than the transfer itself. It's the first impression of a trip for arriving visitors, the last leg of a business trip for departing executives, and — for the large volume of connecting and transiting travelers who pass through DXB — sometimes the only ground transportation booked for an entire visit to Dubai. Whatever the reason for the trip, the same standard applies: track the flight, meet at the gate area, get moving with minimal delay.",
      "Business travel through DXB is a major share of what we handle here. Executives arriving for a single meeting need a fast, discreet transfer straight to a Downtown or Business Bay hotel with zero time lost figuring out directions. Visiting delegations often need coordinated multi-vehicle pickups timed to a single flight or a cluster of arrivals across a morning. Standing corporate accounts frequently route all their international travel through DXB, using the same driver pool and billing as their everyday city transport.",
      "Luxury leisure travelers get equal attention — honeymooners and families arriving for a Dubai holiday, guests flying in for a wedding or a milestone celebration, and visitors for whom the airport transfer is genuinely the first moment of the trip. For these arrivals, vehicle choice matters: a Rolls-Royce Ghost or Phantom waiting at the terminal turns the first few minutes in Dubai into part of the experience, rather than just a functional ride to the hotel.",
      "Popular destinations from DXB cover the whole city, and timing varies meaningfully by area — Downtown Dubai and Business Bay are both around 20 minutes away via Sheikh Zayed Road, Dubai Marina and JBR sit around 30 minutes out, and Palm Jumeirah is the furthest common destination at roughly 35 minutes given the additional distance down the trunk road. We plan each of these routes based on the specific time of day and current road conditions rather than a single fixed estimate.",
      "Departures get just as much attention as arrivals, timed around your specific terminal and airline's typical check-in and security patterns rather than a blanket estimate that works for no one. Terminal 3's Emirates flights, for example, tend to need a different buffer to a Terminal 1 departure on another carrier, purely because of how each terminal's check-in queues typically build through the day. We confirm your exact pickup time the evening before, based on those specifics.",
      "All three DXB terminals are covered equally, along with Dubai Duty Free pickup coordination and the handful of quieter, less obvious exits chauffeurs use to avoid the busiest arrivals curb during peak hours. Whether you're arriving on a budget carrier into Terminal 2 or a long-haul flight into Terminal 3, the same meet-and-greet standard, name signage, and luggage assistance apply.",
      "What defines chauffeur service at DXB isn't a single feature — it's the combination of live flight tracking, terminal-specific timing, and a driver who's already positioned and waiting rather than reacting once you've landed, applied consistently whether it's a single business trip, a family holiday, or a standing corporate account routing dozens of trips through the airport each month.",
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
