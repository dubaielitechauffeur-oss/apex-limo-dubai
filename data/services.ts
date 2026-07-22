export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceImage {
  src: string;
  alt: string;
}

export interface Service {
  slug: string;
  name: string;
  tagline: string;
  heroSubtitle: string;
  shortDescription: string;
  /**
   * Long-form SEO copy, rendered through RichParagraph. Paragraphs may
   * contain hand-placed `[label](href)` markers (Markdown-lite) for a
   * handful of natural internal links to fleet vehicles, other services,
   * or locations — RichParagraph renders these as real Next.js Links.
   */
  longDescription: string[];
  /** Contextual stat shown next to the ★ 4.9 rating on this service's page. */
  ratingMetric: {
    value: string;
    label: string;
  };
  benefits: string[];
  whyChoose: string[];
  faqs: ServiceFAQ[];
  /**
   * Card image for the /services listing page. Reuses existing licensed
   * fleet photography as a placeholder — swap for dedicated service
   * photography later; the field/shape stays the same either way.
   */
  image: ServiceImage;
  /** Short 2-3 word chips shown on the homepage service card (not full sentences). */
  tags: string[];
}

export const SERVICES: Service[] = [
  {
    slug: "airport-transfers",
    name: "Airport Transfers",
    tags: ["Flight Tracking", "Meet & Greet", "Luggage Assistance"],
    image: {
      src: "/images/services/airport-transfer-jet-tarmac.webp",
      alt: "Apex Limo Mercedes V-Class parked on the tarmac beside a private jet at dusk, ready for an airport transfer",
    },
    tagline: "Meet-and-greet, every time",
    heroSubtitle:
      "Meet-and-greet arrivals and punctual departures at DXB and DWC, with live flight tracking built into every booking.",
    shortDescription:
      "Reliable airport pickups and drop-offs across Dubai, with flight tracking and meet-and-greet as standard.",
    longDescription: [
      "[Dubai International Airport (DXB)](/locations/dubai-international-airport-dxb) and Al Maktoum International (DWC) between them handle a volume of arrivals most cities never approach, and Apex's transfer service is built for that scale. We take your flight number, not just a pickup time, and track it in real time — if your flight is delayed, diverted, or arrives early, your chauffeur adjusts automatically. In the arrivals hall, your chauffeur waits with name signage and handles luggage from the carousel to the car, parked as close to the terminal exit as the road allows — typically a two to three-minute walk, rather than the fifteen-plus minutes a shared pickup zone can involve during peak hours.",
      "Departures get the same attention in reverse. We confirm your pickup the evening before travel, factoring in your specific terminal and typical security wait times rather than a blanket estimate — a 6 a.m. departure from one terminal gets a different buffer than a midday flight from another, since traffic and check-in queues genuinely differ — so travel day starts with nothing left to figure out.",
      "This is the service we run more than any other. Business travelers need a fast, discreet transfer; families arriving with several suitcases need real boot space and help loading without being asked twice. Fleet choice matters more here than most expect — a solo executive is usually best served by the [Mercedes S-Class](/fleet/mercedes-s-class), while families with checked luggage do better in the [Cadillac Escalade](/fleet/cadillac-escalade), which handles several passengers and a genuinely large amount of luggage without anyone perching a bag on their lap. For an arrival meant to set the tone for a trip — a honeymoon, a milestone celebration, a VIP welcome — the Rolls-Royce Ghost turns the transfer into part of the occasion.",
      "Every chauffeur assigned to airport work holds a valid UAE commercial license, passes a background check, and is trained specifically in arrivals-hall protocol — which terminal exit is quietest at 2 a.m., which route avoids the morning backup, and how to spot a delay before the airport's own app has updated.",
      "Booking takes a couple of minutes online or via WhatsApp, and you'll receive your chauffeur's details ahead of time. Pricing is fixed once confirmed — a delayed flight or a longer immigration queue is something we plan for, not a cost passed on to you. It's why airport transfers are the service most clients book first, and often the one that brings them back for [Corporate Chauffeur Service](/services/corporate-chauffeur) and everything in between.",
    ],
    ratingMetric: {
      value: "500+",
      label: "Airport Transfers",
    },
    benefits: [
      "Live flight tracking adjusts pickup time automatically",
      "Meet-and-greet with name signage in the arrivals hall",
      "Fixed pricing — no surge charges for delays",
      "Available for both DXB and DWC",
      "Help with luggage from the terminal to the car",
      "Vehicle matched to your group size and luggage",
    ],
    whyChoose: [
      "We track your flight, not just your booking time",
      "Chauffeurs know both terminals and current traffic patterns",
      "A dedicated vehicle for you — no ride-sharing or detours",
      "24/7 availability for early, late, or delayed flights",
      "Fleet options range from executive sedans to a Rolls-Royce arrival",
      "The same fixed price whether traffic is light or heavy",
    ],
    faqs: [
      {
        question: "What happens if my flight is delayed?",
        answer:
          "We track your flight automatically and adjust your pickup time at no extra charge — you won't be charged for airline delays.",
      },
      {
        question: "Where will my chauffeur meet me?",
        answer:
          "Your chauffeur waits in the arrivals hall with a name sign, ready to help with luggage as soon as you clear customs.",
      },
      {
        question: "Do you serve both DXB and DWC?",
        answer: "Yes, we cover Dubai International (DXB) and Al Maktoum International (DWC) equally.",
      },
      {
        question: "How do I book an airport transfer?",
        answer:
          "Book online with your flight details, or WhatsApp us — we'll confirm your chauffeur and vehicle within minutes.",
      },
      {
        question: "Can I request a specific vehicle for my airport transfer?",
        answer:
          "Yes, choose your preferred vehicle at booking — from an executive sedan to a V-Class for luggage, or a Rolls-Royce for a special arrival.",
      },
      {
        question: "Is there an extra charge for very early or late-night pickups?",
        answer:
          "No, our pricing is fixed and covers 24/7 availability — an early departure or a midnight arrival costs the same as any other time.",
      },
    ],
  },
  {
    slug: "corporate-chauffeur",
    name: "Corporate Chauffeur Service",
    tags: ["Executive Travel", "Business Meetings", "Priority Service"],
    image: {
      src: "/images/services/corporate-chauffeur-working-in-car.webp",
      alt: "Businessman working on a laptop and taking a call in the back seat of an Apex Limo chauffeur car",
    },
    tagline: "Consistency your calendar can rely on",
    heroSubtitle:
      "Reliable, discreet transport for executives and business travel across the UAE.",
    shortDescription:
      "Dependable, discreet chauffeur service for executives, teams, and standing corporate accounts.",
    longDescription: [
      "For businesses that move fast, ground transportation shouldn't be something anyone has to think about. Apex's corporate chauffeur service is built around consistency — the same standard of professionalism, punctuality, and discretion whether it's a single meeting or a standing account moving your team daily. It isn't one dramatic feature that keeps corporates and hotels across Dubai coming back — it's the accumulation of small things done reliably, booking after booking.",
      "Corporate clients get dedicated account support rather than a different point of contact every time, transparent itemized invoicing instead of per-trip payment gymnastics, and the same pool of vetted chauffeurs assigned to your account, so drivers become familiar with your usual pickup points, preferred routes, and small preferences that make repeat travel feel effortless.",
      "This service covers executives with three back-to-back meetings who can't afford fifteen minutes lost to a wrong turn, visiting board members needing an airport-to-boardroom handoff, and HR or travel managers coordinating a delegation flying in for a conference. Fleet is matched to the trip: a solo executive typically travels in the [Mercedes S-Class](/fleet/mercedes-s-class) or [BMW 7 Series](/fleet/bmw-7-series), while teams move well in the [Mercedes V-Class](/fleet/mercedes-v-class), which seats up to seven without anyone feeling like an afterthought.",
      "Chauffeurs on corporate accounts go through the same licensing and background checks as every Apex driver, plus specific training in professional discretion — how to work quietly around confidential calls and when simply not to make conversation. Many stay with the same accounts for years, which saves real minutes once a driver already knows your building's loading bay and your usual 7:45 a.m. pickup. Setting up an account takes one conversation — we agree your typical volume, vehicle mix, and billing cycle, then monthly invoicing replaces separate payment each trip, and recurring trips or last-minute additions get priority handling.",
      "Visiting delegations and international teams lean on this service hardest, arriving with the least local knowledge and the tightest itineraries. A typical multi-day visit might combine an [Airport Transfers](/services/airport-transfers) meet-and-greet, transport to back-to-back meetings across DIFC and [Business Bay](/locations/business-bay), an evening dinner booking, and a departure transfer timed around a late-night flight — all under one account, one invoice, and one standard of service, rather than the inconsistency of piecing transportation together city by city.",
    ],
    ratingMetric: {
      value: "300+",
      label: "Corporate Clients",
    },
    benefits: [
      "Standing corporate accounts with monthly invoicing",
      "Discreet, professionally trained chauffeurs",
      "Priority booking for repeat and recurring trips",
      "Fleet options from executive sedans to group vans",
      "Dedicated account support for HR and travel teams",
      "Same-driver familiarity for regular pickup points and routes",
    ],
    whyChoose: [
      "Trusted by corporates and hotels across Dubai",
      "Consistent chauffeur standards on every booking",
      "Flexible billing for teams and departments",
      "Vehicles matched to the meeting, not just the trip",
      "Dedicated account support instead of a new contact each time",
      "Priority handling for last-minute or same-day additions",
    ],
    faqs: [
      {
        question: "Do you offer corporate accounts with invoicing?",
        answer:
          "Yes, we set up standing corporate accounts with monthly invoicing for regular business travel.",
      },
      {
        question: "Can chauffeurs handle confidential business discussions?",
        answer: "Yes, all chauffeurs are trained in professional discretion and confidentiality.",
      },
      {
        question: "Can we book recurring weekly transport for staff?",
        answer: "Yes, recurring bookings are common — talk to us about setting up a standing schedule.",
      },
      {
        question: "What vehicles are available for corporate travel?",
        answer:
          "Executive sedans such as the S-Class and 7 Series for individuals, and the V-Class or Escalade for small groups.",
      },
      {
        question: "Can we request the same chauffeur for repeat bookings?",
        answer:
          "Yes, corporate accounts are usually assigned a small pool of familiar chauffeurs so drivers learn your routine and preferences.",
      },
      {
        question: "How quickly can you add a same-day trip to our account?",
        answer:
          "Corporate accounts get priority handling, so same-day additions — an extra pickup or a delayed flight — are usually confirmed within minutes.",
      },
      {
        question: "Can you manage transport for an entire visiting delegation's itinerary?",
        answer:
          "Yes, we regularly plan multi-day itineraries for visiting teams — airport pickup, meetings, dinners, and departure — under one account and one invoice.",
      },
    ],
  },
  {
    slug: "luxury-chauffeur",
    name: "Luxury Chauffeur Service",
    tags: ["Mercedes S-Class", "VIP Experience", "Professional Chauffeurs"],
    image: {
      src: "/images/services/luxury-chauffeur-door-service.webp",
      alt: "Apex Limo chauffeur opening the car door for a client outside an office building",
    },
    tagline: "Everyday travel, elevated",
    heroSubtitle:
      "A premium fleet and professionally trained drivers for everyday luxury travel.",
    shortDescription:
      "Hourly and full-day chauffeur hire across a premium fleet, for travel on your own schedule.",
    longDescription: [
      "Not every luxury trip needs an occasion — sometimes it's simply the way you'd rather travel. Apex's luxury chauffeur service puts a premium vehicle and a professional driver at your disposal by the hour or the full day, and the vehicle waits for you at each stop — no re-booking, no explaining your next destination to a different driver each time.",
      "That continuity is the actual value — the same chauffeur who dropped you at a meeting is the one waiting outside two hours later, already aware of where you're headed next. This is the service Dubai residents and longer-staying visitors reach for most — someone in the city for a week of meetings who wants one driver rather than a new booking each morning, or a family shopping across several malls who'd rather not manage parking at each one.",
      "Fleet choice is genuinely matched to the day. The [Mercedes S-Class](/fleet/mercedes-s-class) or [BMW 7 Series](/fleet/bmw-7-series) suits most city and business use, quiet and comfortable for calls between stops. The [Range Rover Autobiography](/fleet/range-rover-autobiography) works well for a day mixing city roads — a shopping trip through [Dubai Marina](/locations/dubai-marina), say — with a desert excursion further out of town. For an evening built around arriving somewhere memorably — a restaurant opening, an anniversary dinner — the Rolls-Royce Ghost or Phantom turn the journey into part of the plan.",
      "Chauffeurs on hourly and full-day bookings are trained differently to single-trip drivers: reading a changing schedule through the day, holding a parking spot near a venue without blocking access, and adjusting silently when plans shift by twenty minutes. Booking takes the same couple of minutes as any Apex service — choose your vehicle and roughly how long you need the car — and pricing is transparent and hourly, quoted up front with no hidden charges for waiting time.",
      "What makes this service distinct is the single point of contact it gives you for an entire day — one chauffeur, one vehicle, one number to call if plans change. A full-day booking might stretch across a morning of meetings, an afternoon at The Dubai Mall or Mall of the Emirates, and an evening dinner reservation, all without a single re-booking.",
    ],
    ratingMetric: {
      value: "1,000+",
      label: "Happy Clients",
    },
    benefits: [
      "Hourly and full-day hire options to suit any schedule",
      "Vehicle and chauffeur wait for you between every stop",
      "Choice of Mercedes, BMW, Range Rover, and more from the fleet",
      "No parking, no traffic stress, no ride-app juggling between venues",
      "Consistent, professional service delivered on every single trip",
      "Easy to extend your booking on the spot if your day runs long",
    ],
    whyChoose: [
      "A single point of contact for the whole day, instead of a new driver at every stop",
      "Fleet variety wide enough to match any occasion, from a business meeting to a night out",
      "Chauffeurs who genuinely know Dubai's roads, shortcuts, and current traffic patterns",
      "Transparent hourly pricing agreed up front, with no hidden waiting-time fees",
      "The same chauffeur across every stop, so nothing needs re-explaining mid-day",
      "Flexible extensions on the spot if your plans run over your booked hours",
    ],
    faqs: [
      {
        question: "Can I book a chauffeur by the hour?",
        answer:
          "Yes, hourly hire is available with a range of vehicles — ideal for city travel, meetings, or shopping trips.",
      },
      {
        question: "Does the car wait for me at each stop?",
        answer:
          "Yes, your chauffeur and vehicle wait for you throughout your booked hours — no re-booking between stops.",
      },
      {
        question: "What's the minimum booking duration?",
        answer: "Most hourly bookings start at 2 hours; contact us for shorter one-way trips.",
      },
      {
        question: "Can I choose which vehicle I get?",
        answer: "Yes, you can select your preferred vehicle from our fleet when booking or requesting a quote.",
      },
      {
        question: "What happens if my day runs longer than I booked?",
        answer:
          "Just let your chauffeur know — extending an hourly or full-day booking on the spot is straightforward and billed at the same transparent rate.",
      },
      {
        question: "Is a full-day booking better value than several separate trips?",
        answer:
          "Usually, yes — a full-day rate covers unlimited stops with the same vehicle and driver, which works out more efficient than booking each leg separately.",
      },
      {
        question: "Is this service suitable for visitors without a rental car?",
        answer:
          "Yes, it's a popular alternative to self-driving for visitors — no unfamiliar roads or parking to manage, just a chauffeur who already knows the city.",
      },
    ],
  },
  {
    slug: "vip-transportation",
    name: "VIP Transportation",
    tags: ["Privacy First", "Elite Fleet", "Concierge Service"],
    image: {
      src: "/images/services/vip-transportation-motorcade.webp",
      alt: "Apex Limo motorcade of a Mercedes S-Class and V-Class vans moving together as a coordinated VIP convoy",
    },
    tagline: "Planned, discreet, dependable",
    heroSubtitle:
      "Private, secure transport for high-profile guests, delegations, and dignitaries.",
    shortDescription:
      "Coordinated, discreet transportation for dignitaries, executives, and high-profile guests.",
    longDescription: [
      "VIP transportation calls for more than a nice car — it calls for planning, discretion, and a team that anticipates rather than reacts. Apex coordinates secure, private transport for dignitaries, executives, and high-profile guests, working directly with event planners and protocol teams ahead of arrival to confirm routes, backup vehicles, and contingency timing down to the minute. That preparation usually starts days or weeks in advance, agreeing a primary and a backup route between each stop.",
      "The clients who use this service most are exactly who you'd expect — visiting dignitaries and their delegations, executives whose safety depends on precise timing, celebrities who need to move without drawing attention, and event organizers responsible for getting a principal speaker from a private jet to a stage, whether that's a boardroom downtown or a beachfront gala in [Palm Jumeirah](/locations/palm-jumeirah), without a single gap in the chain.",
      "Vehicle selection is chosen for the assignment, not just comfort. The [Cadillac Escalade](/fleet/cadillac-escalade) and [Range Rover Autobiography](/fleet/range-rover-autobiography) are frequent choices for their interior space, ground clearance, and ability to travel in coordinated convoys, while a lower-profile sedan remains available where discretion matters more than size. For assignments requiring more than one car, we plan the full convoy — lead, principal, and support vehicle — as a single coordinated unit rather than several separate bookings.",
      "Chauffeurs assigned to VIP work are drawn from our most experienced pool and vetted specifically for discretion-sensitive assignments, on top of the standard licensing and background checks every Apex driver holds. Booking starts with a conversation rather than a standard form — we recommend reaching out weeks ahead for delegations or major events, so there's time to confirm routes and backups properly. A single Apex contact liaises directly with your protocol or event team throughout, so instructions run through one channel rather than being relayed driver to driver.",
      "What distinguishes this service isn't a single vehicle — it's the coordination behind it: routes planned in advance, backups ready if plans change, and a team that treats the unexpected as routine rather than an emergency. Details of a booking are shared only with the team members directly involved, and we're accustomed to working under non-disclosure arrangements when a visit requires it, whether it's a single-day booking or a recurring arrangement spanning several trips a year.",
    ],
    ratingMetric: {
      value: "150+",
      label: "VIP Transfers",
    },
    benefits: [
      "Advance route and timing coordination for every booking",
      "Security-conscious vehicle options like the Escalade and Range Rover",
      "Direct coordination with protocol officers and event teams",
      "Backup vehicles kept on standby for high-profile bookings",
      "Strict discretion and confidentiality on every assignment",
      "Coordinated multi-vehicle convoy planning handled as one unit",
    ],
    whyChoose: [
      "Genuine experience coordinating multi-vehicle VIP movements at scale",
      "Chauffeurs specifically vetted and briefed for high-profile, discretion-sensitive assignments",
      "Flexible, real-time route adjustments if plans shift at the last minute",
      "A single point of contact for planners and protocol teams throughout",
      "Primary and backup routes planned well in advance for every booking",
      "Convoy coordination handled as one managed unit, not a set of separate bookings",
    ],
    faqs: [
      {
        question: "Can you coordinate transport for a delegation or group?",
        answer:
          "Yes, we regularly coordinate multi-vehicle movements for delegations, with a lead point of contact for planners.",
      },
      {
        question: "Do you provide security-trained chauffeurs?",
        answer: "Our chauffeurs are vetted and trained for high-profile, discretion-sensitive assignments.",
      },
      {
        question: "Can routes be adjusted last minute?",
        answer: "Yes, we plan primary and backup routes in advance and can adjust in real time if needed.",
      },
      {
        question: "How far ahead should VIP transportation be booked?",
        answer:
          "We recommend booking as early as possible for VIP and delegation transport, to allow full route and timing coordination.",
      },
      {
        question: "Can you arrange a full convoy of vehicles for a single principal?",
        answer:
          "Yes, we plan lead, principal, and support vehicles as one coordinated convoy rather than separate individual bookings.",
      },
      {
        question: "Who do our planners speak to on the day of the event?",
        answer:
          "A single dedicated Apex contact liaises directly with your protocol or event team, so instructions run through one channel throughout.",
      },
      {
        question: "Can you handle recurring VIP transport for the same principal over multiple visits?",
        answer:
          "Yes, we can retain the same vetted chauffeurs and refine routing over repeat visits, so familiarity builds with each booking rather than starting fresh each time.",
      },
    ],
  },
  {
    slug: "event-transportation",
    name: "Event Transportation",
    tags: ["Fleet Coordination", "Guest Logistics", "On-Time Arrival"],
    image: {
      src: "/images/services/event-transportation-fleet-lineup.webp",
      alt: "Three Apex Limo chauffeurs standing beside a Mercedes S-Class, BMW, and Cadillac Escalade outside a Dubai hotel, ready for event transportation",
    },
    tagline: "One fleet plan, no bottlenecks",
    heroSubtitle:
      "Coordinated fleets for conferences, galas, and large-scale corporate events.",
    shortDescription:
      "Multi-vehicle fleet coordination for conferences, galas, and corporate events of any size.",
    longDescription: [
      "Moving large groups of guests to and from an event on schedule takes more coordination than a single booking — it takes a fleet plan. Apex manages event transportation for conferences, galas, product launches, and corporate functions, coordinating multiple vehicles against a shared timeline so guests move smoothly without bottlenecks at pickup or drop-off.",
      "We work with your event planner or venue team ahead of time to map arrival waves, staging areas, and driver briefings, then run the day with a dedicated on-site point of contact. Every driver involved receives the same information — venue access points, drop-off sequencing, and timing windows — so the fleet behaves as one coordinated operation rather than a set of independent bookings that happen to arrive around the same time.",
      "This service covers conferences with staggered arrivals, product launches where a coordinated fleet is part of the presentation itself, and galas at venues from DIFC to [Downtown Dubai](/locations/downtown-dubai). Fleet composition follows your guest list: executive sedans suit VIP guests and speakers, [Mercedes V-Class](/fleet/mercedes-v-class) vans handle general guest transport efficiently, and for flagship moments a Rolls-Royce can be worked into the arrival sequence as a deliberate visual moment.",
      "Chauffeurs on event bookings are briefed specifically on that day's schedule before it begins — pickup times, venue access restrictions, and where to stage between waves of guests. On larger events, a dedicated on-site Apex coordinator manages the fleet in real time, adjusting for late arrivals or a running-behind programme without the venue team needing to intervene directly with individual drivers. We recommend three to five days' notice for smaller functions and two to three weeks for large-scale events needing multiple vehicles and detailed staging.",
      "Multi-day conferences add a further layer worth planning for early — consistent transport between hotel and venue across several mornings, and transfers for speakers arriving on different days. Rather than treating each day as a new booking, we build a standing schedule for the full event window, much like a standing [Corporate Chauffeur Service](/services/corporate-chauffeur) account, and a headline guest needing extra discretion is easily paired with our [VIP Transportation](/services/vip-transportation) service for that single arrival.",
    ],
    ratingMetric: {
      value: "400+",
      label: "Executive Journeys",
    },
    benefits: [
      "Multi-vehicle fleet coordination for large guest lists and long event days",
      "A dedicated on-site point of contact throughout event day",
      "Staggered pickup and drop-off planning built to avoid bottlenecks",
      "Vehicle mix from sedans to vans for any group size",
      "Direct coordination with event planners and venue teams in advance",
      "Distinctive arrival vehicles available for VIP guests and keynote speakers",
    ],
    whyChoose: [
      "Genuine experience running multi-vehicle event logistics for conferences and galas alike",
      "A single team managing the entire transportation plan from first booking to last drop-off",
      "Flexibility to scale the fleet up or down right up until the event date",
      "Punctual, professional chauffeurs individually briefed on your specific event schedule",
      "Fleet plans built around your actual guest list, not a generic fixed package",
      "Real-time coordination on the day if the event's own schedule shifts unexpectedly",
    ],
    faqs: [
      {
        question: "Can you handle transportation for large events?",
        answer:
          "Yes, we regularly coordinate multi-vehicle fleets for conferences, galas, and corporate events of varying sizes.",
      },
      {
        question: "Do you provide an on-site coordinator for events?",
        answer: "Yes, larger event bookings include a dedicated on-site point of contact for the day.",
      },
      {
        question: "How far in advance should we book event transportation?",
        answer:
          "We recommend 3–5 days minimum for planning, and 2–3 weeks for large-scale events with multiple vehicles.",
      },
      {
        question: "Can you manage staggered guest pickups?",
        answer:
          "Yes, we plan pickup waves in advance with your event team to avoid bottlenecks at the venue.",
      },
      {
        question: "Can you arrange a distinctive vehicle for a keynote speaker or award recipient?",
        answer:
          "Yes, we can work a Rolls-Royce or similar vehicle into your arrival sequence as a timed, deliberate moment within the programme.",
      },
      {
        question: "What happens if the event schedule changes on the day?",
        answer:
          "Your on-site Apex coordinator adjusts the fleet in real time for delays or added guests, so your team doesn't need to manage drivers directly.",
      },
      {
        question: "Can you provide transport across a multi-day conference?",
        answer:
          "Yes, we build a standing fleet schedule for the full event window, covering hotel-to-venue transport and speaker transfers across every day of the conference.",
      },
      {
        question: "Do you provide vehicles for product launches and brand activations?",
        answer:
          "Yes, we can plan a fleet arrival sequence around a product launch's own choreography, timed to complement the presentation rather than compete with it.",
      },
    ],
  },
  {
    slug: "wedding-chauffeur",
    name: "Wedding Chauffeur Service",
    tags: ["Luxury Fleet", "Wedding Packages", "Professional Service"],
    image: {
      src: "/images/services/wedding-chauffeur-cars.webp",
      alt: "Two black Mercedes S-Class wedding cars decorated with floral arrangements, with the bride and groom in the background",
    },
    tagline: "An entrance worth remembering",
    heroSubtitle:
      "Elegant bridal cars and coordinated convoys for a flawless wedding day.",
    shortDescription:
      "Bridal cars and coordinated wedding convoys, timed precisely with your planner.",
    longDescription: [
      "A wedding day runs on a schedule that can't slip, and transportation is often the least forgiving part of it — unlike almost every other part of a wedding, it has zero room for a graceful recovery if it's late. Apex's wedding chauffeur service coordinates bridal cars, guest convoys, and precisely timed arrivals, working directly with your planner to lock in timing down to the minute.",
      "The Rolls-Royce Phantom remains our most requested wedding vehicle, prized for its presence in photographs as much as the ride. For the wedding party, the [Cadillac Escalade](/fleet/cadillac-escalade) or [Mercedes V-Class](/fleet/mercedes-v-class) comfortably keeps a group together rather than splitting them across multiple cars, while guest transport is typically handled with a mixed fleet sized to the guest list, coordinated to arrive at the venue in manageable waves rather than all at once.",
      "Every wedding is different, but the transportation needs tend to fall into recognizable moments: the bridal car itself, timed precisely against the ceremony start; a convoy for the wedding party; guest transport from a hotel block to the venue; and, for many couples, a second vehicle for departure photos or a same-day outfit change. We plan for each of these as part of one coordinated day, not separate bookings.",
      "Chauffeurs assigned to weddings dress in formal attire and are trained specifically in the choreography a wedding requires — holding a car door at exactly the right pace for photographs, timing a departure to a planner's cue rather than a fixed clock, and staying calm if a ceremony runs behind schedule, which happens more often than any couple expects. Red carpet service is available on request. Every booking includes a timing rehearsal with your planner ahead of the day, walking through the schedule minute by minute, so potential conflicts get caught on paper, long before the day itself.",
      "We recommend booking two to three weeks ahead at minimum, and earlier for peak wedding season or if the Rolls-Royce Phantom is part of your plan. We've worked alongside planners and venues across Dubai's most established wedding locations, from beachfront resorts on [Palm Jumeirah](/locations/palm-jumeirah) to hotel ballrooms in [Downtown Dubai](/locations/downtown-dubai), so on the day, the only thing you need to think about is walking down the aisle.",
    ],
    ratingMetric: {
      value: "150+",
      label: "Happy Clients",
    },
    benefits: [
      "Timed to the minute in coordination with your planner",
      "Rolls-Royce Phantom and full fleet available",
      "Red carpet service available on request",
      "Convoy coordination for wedding party and guests",
      "A dedicated chauffeur in formal attire",
      "Pre-wedding timing rehearsal included with every booking",
    ],
    whyChoose: [
      "Dubai's most requested vehicle for a memorable wedding entrance",
      "Direct coordination with wedding planners well ahead of the day",
      "Backup timing plans built in for a genuinely stress-free day",
      "Real experience with Dubai's leading wedding venues and their logistics",
      "Separate vehicles available for the bridal car, convoy, and guest transport",
      "Chauffeurs specifically trained in wedding-day choreography, not just driving",
    ],
    faqs: [
      {
        question: "How far in advance should we book a wedding chauffeur?",
        answer:
          "We recommend booking 2–3 weeks ahead, especially for the Rolls-Royce Phantom, as wedding dates fill quickly.",
      },
      {
        question: "Can you coordinate timing with our wedding planner?",
        answer:
          "Yes, we work directly with planners to confirm exact timing and rehearse the day's schedule in advance.",
      },
      {
        question: "Do you offer red carpet service?",
        answer: "Yes, red carpet service is available on request for wedding entrances and photos.",
      },
      {
        question: "Can you provide transport for the wedding party, not just the couple?",
        answer:
          "Yes, we can coordinate a convoy including vehicles for the wedding party and guest transport.",
      },
      {
        question: "What happens if the ceremony runs behind schedule?",
        answer:
          "Our chauffeurs are trained to adjust calmly to a shifting timeline — we plan buffer time in advance so a delayed ceremony doesn't disrupt departure or guest transport.",
      },
      {
        question: "Can we book a separate car for departure photos or an outfit change?",
        answer:
          "Yes, many couples book a second vehicle for departure or a costume change later in the day — let us know when planning your timing rehearsal.",
      },
      {
        question: "Do you have experience with specific wedding venues in Dubai?",
        answer:
          "Yes, we've worked with planners at most of Dubai's established wedding venues, from beachfront resorts to hotel ballrooms, so venue logistics are rarely unfamiliar.",
      },
    ],
  },
];
