export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  name: string;
  tagline: string;
  heroSubtitle: string;
  shortDescription: string;
  longDescription: string[];
  benefits: string[];
  whyChoose: string[];
  faqs: ServiceFAQ[];
}

export const SERVICES: Service[] = [
  {
    slug: "airport-transfers",
    name: "Airport Transfers",
    tagline: "Meet-and-greet, every time",
    heroSubtitle:
      "Meet-and-greet arrivals and punctual departures at DXB and DWC, with live flight tracking built into every booking.",
    shortDescription:
      "Reliable airport pickups and drop-offs across Dubai, with flight tracking and meet-and-greet as standard.",
    longDescription: [
      "Dubai International Airport (DXB) and Al Maktoum International (DWC) never really slow down, and neither do we. Every Apex airport transfer starts with your flight number — we track it automatically, so a delayed landing never means a missed pickup. Your chauffeur waits in the arrivals hall with signage, helps with luggage, and has the car positioned close by so you're on the road within minutes of clearing customs.",
      "For departures, we build in a buffer for Dubai traffic and terminal check-in times, confirming your pickup the evening before so there's nothing to think about on travel day. Whether it's a single business trip or a recurring corporate account, airport transfers are the service we run most — and the one we've refined the most.",
    ],
    benefits: [
      "Live flight tracking adjusts pickup time automatically",
      "Meet-and-greet with name signage in the arrivals hall",
      "Fixed pricing — no surge charges for delays",
      "Available for both DXB and DWC",
      "Help with luggage from the terminal to the car",
    ],
    whyChoose: [
      "We track your flight, not just your booking time",
      "Chauffeurs know both terminals and current traffic patterns",
      "A dedicated vehicle for you — no ride-sharing or detours",
      "24/7 availability for early, late, or delayed flights",
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
    ],
  },
  {
    slug: "corporate-chauffeur",
    name: "Corporate Chauffeur Service",
    tagline: "Consistency your calendar can rely on",
    heroSubtitle:
      "Reliable, discreet transport for executives and business travel across the UAE.",
    shortDescription:
      "Dependable, discreet chauffeur service for executives, teams, and standing corporate accounts.",
    longDescription: [
      "For businesses that move fast, ground transportation shouldn't be something you have to think about. Apex's corporate chauffeur service is built around consistency — the same standard of professionalism, punctuality, and discretion whether it's a single meeting or a standing account moving your team daily.",
      "Corporate clients get dedicated support, transparent invoicing, and chauffeurs trained to work quietly around confidential conversations and back-to-back schedules. From roadshows to airport runs between meetings, we handle the logistics so your team can focus on the work.",
    ],
    benefits: [
      "Standing corporate accounts with monthly invoicing",
      "Discreet, professionally trained chauffeurs",
      "Priority booking for repeat and recurring trips",
      "Fleet options from executive sedans to group vans",
      "Dedicated account support for HR and travel teams",
    ],
    whyChoose: [
      "Trusted by corporates and hotels across Dubai",
      "Consistent chauffeur standards on every booking",
      "Flexible billing for teams and departments",
      "Vehicles matched to the meeting, not just the trip",
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
    ],
  },
  {
    slug: "luxury-chauffeur",
    name: "Luxury Chauffeur Service",
    tagline: "Everyday travel, elevated",
    heroSubtitle:
      "A premium fleet and professionally trained drivers for everyday luxury travel.",
    shortDescription:
      "Hourly and full-day chauffeur hire across a premium fleet, for travel on your own schedule.",
    longDescription: [
      "Not every luxury trip needs an occasion — sometimes it's simply the way you'd rather travel. Apex's luxury chauffeur service puts a premium vehicle and a professional driver at your disposal for city travel, shopping trips, dinners, or a day spent moving between appointments without the friction of parking, traffic, or ride-hailing apps.",
      "Book by the hour or for a full day, and the vehicle waits for you at each stop — no re-booking, no waiting for another car to arrive. It's a service built for people who value their time as much as their comfort.",
    ],
    benefits: [
      "Hourly and full-day hire options",
      "Vehicle and chauffeur wait between stops",
      "Choice of Mercedes, BMW, Range Rover, and more",
      "No parking, no traffic stress, no ride-app juggling",
      "Consistent, professional service on every trip",
    ],
    whyChoose: [
      "A single point of contact for the whole day",
      "Fleet variety to match the occasion",
      "Chauffeurs who know Dubai's roads and shortcuts",
      "Transparent hourly pricing with no hidden fees",
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
    ],
  },
  {
    slug: "vip-transportation",
    name: "VIP Transportation",
    tagline: "Planned, discreet, dependable",
    heroSubtitle:
      "Private, secure transport for high-profile guests, delegations, and dignitaries.",
    shortDescription:
      "Coordinated, discreet transportation for dignitaries, executives, and high-profile guests.",
    longDescription: [
      "VIP transportation calls for more than a nice car — it calls for planning, discretion, and a team that anticipates rather than reacts. Apex coordinates secure, private transport for dignitaries, executives, and high-profile guests, with route planning, timing coordination, and vehicles suited to security requirements.",
      "We work directly with event planners, protocol teams, and personal assistants ahead of arrival to confirm routes, backup vehicles, and contingency timing — so transportation is never the part anyone has to worry about.",
    ],
    benefits: [
      "Advance route and timing coordination",
      "Security-conscious vehicle options like the Escalade and Range Rover",
      "Direct coordination with protocol and event teams",
      "Backup vehicles available for high-profile bookings",
      "Strict discretion and confidentiality",
    ],
    whyChoose: [
      "Experience coordinating multi-vehicle VIP movements",
      "Chauffeurs vetted for high-profile assignments",
      "Flexible, last-minute route adjustments",
      "A single point of contact for planners and protocol teams",
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
    ],
  },
  {
    slug: "event-transportation",
    name: "Event Transportation",
    tagline: "One fleet plan, no bottlenecks",
    heroSubtitle:
      "Coordinated fleets for conferences, galas, and large-scale corporate events.",
    shortDescription:
      "Multi-vehicle fleet coordination for conferences, galas, and corporate events of any size.",
    longDescription: [
      "Moving large groups of guests to and from an event on schedule takes more coordination than a single booking — it takes a fleet plan. Apex manages event transportation for conferences, galas, product launches, and corporate functions, coordinating multiple vehicles against a shared timeline so guests move smoothly without bottlenecks at pickup or drop-off.",
      "We work with your event planner or venue team ahead of time to map arrival waves, staging areas, and driver briefings, then run the day with a dedicated on-site point of contact.",
    ],
    benefits: [
      "Multi-vehicle fleet coordination for large guest lists",
      "Dedicated on-site point of contact on event day",
      "Staggered pickup and drop-off planning to avoid bottlenecks",
      "Vehicle mix from sedans to vans for varied group sizes",
      "Direct coordination with event planners and venues",
    ],
    whyChoose: [
      "Experience running multi-vehicle event logistics",
      "A single team managing the entire transportation plan",
      "Flexibility to scale the fleet up or down as needed",
      "Punctual, professional chauffeurs briefed on the event schedule",
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
    ],
  },
  {
    slug: "wedding-chauffeur",
    name: "Wedding Chauffeur Service",
    tagline: "An entrance worth remembering",
    heroSubtitle:
      "Elegant bridal cars and coordinated convoys for a flawless wedding day.",
    shortDescription:
      "Bridal cars and coordinated wedding convoys, timed precisely with your planner.",
    longDescription: [
      "A wedding day runs on a schedule that can't slip, and transportation is often the least forgiving part of it. Apex's wedding chauffeur service coordinates bridal cars, guest convoys, and precisely timed arrivals, working directly with your planner to lock in timing down to the minute.",
      "The Rolls-Royce Phantom remains our most requested wedding vehicle, though the full fleet is available for wedding parties and guest transport. Every wedding booking includes a timing rehearsal with your planner, so the only thing you need to think about on the day is walking down the aisle.",
    ],
    benefits: [
      "Timed to the minute in coordination with your planner",
      "Rolls-Royce Phantom and full fleet available",
      "Red carpet service available on request",
      "Convoy coordination for wedding party and guests",
      "A dedicated chauffeur in formal attire",
    ],
    whyChoose: [
      "Dubai's most requested vehicle for wedding entrances",
      "Direct coordination with wedding planners",
      "Backup timing plans for a stress-free day",
      "Experience with Dubai's leading wedding venues",
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
    ],
  },
];
