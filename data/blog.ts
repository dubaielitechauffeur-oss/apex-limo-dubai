export interface BlogImage {
  src: string;
  alt: string;
}

/**
 * Local, file-based data source for the blog — deliberately shaped so a
 * future CMS (Sanity, Contentful, WordPress, etc.) can be swapped in
 * without touching the UI layer: every page reads posts through the
 * functions below, never by importing BLOG_POSTS directly, so the fetch
 * mechanism is the only thing that would need to change on migration.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Card/hero image for the listing grid and detail page. */
  featuredImage: BlogImage;
  /** ISO date string (e.g. "2026-06-15"), formatted for display via lib/format.ts. */
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
  /**
   * Article body as plain paragraphs (matches the same portable, SEO-friendly
   * pattern used by data/services.ts and data/locations.ts). Paragraphs may
   * contain hand-placed `[label](href)` markers, rendered as real Next.js
   * Links by the shared RichParagraph component.
   */
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ultimate-guide-airport-transfers-dubai",
    title: "The Ultimate Guide to Airport Transfers in Dubai",
    excerpt:
      "Everything to know before booking a chauffeur for DXB or DWC — flight tracking, meet-and-greet, fleet choice, and what actually makes a transfer stress-free.",
    featuredImage: {
      // Reuses existing licensed fleet photography as a placeholder — swap
      // for dedicated blog photography later; the field/shape stays the same.
      src: "/images/services/airport-transfer-jet-tarmac.webp",
      alt: "Apex Limo Mercedes V-Class parked on the tarmac beside a private jet at dusk",
    },
    publishDate: "2026-06-15",
    seoTitle: "The Ultimate Guide to Airport Transfers in Dubai | Apex Limo",
    seoDescription:
      "A complete guide to booking a chauffeur-driven airport transfer in Dubai — flight tracking, meet-and-greet, fleet choice, and what to expect at DXB and DWC.",
    content: [
      "Dubai International Airport (DXB) and Al Maktoum International (DWC) between them handle a volume of arrivals most cities never approach, and a well-run transfer is built for that scale. The single biggest difference between a smooth arrival and a stressful one is whether your driver is tracking your actual flight — not just a scheduled pickup time. [Airport Transfers](/services/airport-transfers) booked with live flight tracking adjust automatically for early arrivals, delays, or gate changes, so you're never the one waiting, and never the one being waited on at the wrong terminal.",
      "Meet-and-greet matters more than most travelers expect. Rather than scanning a crowded arrivals hall for a driver you've never met, a proper chauffeur service has someone waiting with name signage, ready to help with luggage from the carousel to the car. For a solo business traveler, that might save ten minutes. For a family with four suitcases and a toddler, it's the difference between an easy start to a trip and a chaotic one.",
      "Fleet choice matters here too. A solo executive is usually best served by something like the [Mercedes S-Class](/fleet/mercedes-s-class) — quiet, quick, and easy to slip into after a long flight. Families with checked luggage do better in a [Cadillac Escalade](/fleet/cadillac-escalade), which has enough boot space that nobody ends up holding a bag on their lap for the ride into the city. And for an arrival meant to set the tone for a trip — a honeymoon, a milestone, a VIP welcome — a Rolls-Royce turns the transfer itself into part of the occasion.",
      "Pricing is the other thing worth locking down before you fly. Ask whether the quote is fixed regardless of flight delays or a longer immigration queue — it should be. A transfer service that treats those as your problem rather than something they plan for isn't one you want meeting you at 2 a.m. after a long-haul flight.",
    ],
  },
  {
    slug: "rolls-royce-phantom-dubai-weddings",
    title: "Why the Rolls-Royce Phantom Is Dubai's Most Requested Wedding Car",
    excerpt:
      "From the starlight headliner to the way it holds a room in photographs, here's what makes the Phantom the default choice for Dubai's wedding season.",
    featuredImage: {
      src: "/images/fleet/rolls-royce-phantom/rolls-royce-phantom-exterior.webp",
      alt: "Black Rolls-Royce Phantom chauffeur car front exterior view with palm trees",
    },
    publishDate: "2026-05-02",
    seoTitle: "Why the Rolls-Royce Phantom Is Dubai's Most Requested Wedding Car | Apex Limo",
    seoDescription:
      "A look at why the Rolls-Royce Phantom remains Dubai's most-booked wedding car — presence, craftsmanship, and what to know before booking one for your big day.",
    content: [
      "Ask any wedding planner in Dubai which car couples request most, and the answer is almost always the same: the [Rolls-Royce Phantom](/fleet/rolls-royce-phantom). It isn't just about luxury for its own sake — the Phantom photographs unlike almost anything else on the road, and it holds a room the moment it pulls up to a venue, coach doors opening onto a handcrafted interior finished to a standard few other manufacturers even attempt.",
      "The starlight headliner is the detail most couples mention after their wedding day rather than before it — a scattering of fibre-optic lights across the roof lining that turns a five-minute drive into a memorable part of the evening, not just a way of getting from ceremony to reception. Paired with a chauffeur in formal attire and optional red carpet service, the Phantom does a lot of the emotional work of a wedding entrance without anyone having to plan for it separately.",
      "Practically speaking, most couples book the Phantom for the bridal car specifically, then pair it with something like a [Cadillac Escalade](/fleet/cadillac-escalade) or [Mercedes V-Class](/fleet/mercedes-v-class) to keep the wedding party together rather than splitting them across multiple cars. A second vehicle for departure photos or an outfit change later in the evening is common too — worth mentioning at the same time you book, since it's far easier to plan into the day than to arrange last minute.",
      "The one thing every experienced planner will tell you: book early. The Phantom is reserved further in advance than any other vehicle in a typical Dubai fleet, and peak wedding season dates go quickly. Two to three weeks ahead is a reasonable minimum — earlier if your date falls in the busier months.",
    ],
  },
  {
    slug: "corporate-travel-etiquette-dubai",
    title: "Corporate Travel Etiquette for Visiting Executives in Dubai",
    excerpt:
      "What visiting executives and delegations actually need from ground transportation in Dubai — and the small details that make a business trip feel effortless.",
    featuredImage: {
      src: "/images/services/corporate-chauffeur-working-in-car.webp",
      alt: "Businessman working on a laptop and taking a call in the back seat of an Apex Limo chauffeur car",
    },
    publishDate: "2026-04-10",
    seoTitle: "Corporate Travel Etiquette for Visiting Executives in Dubai | Apex Limo",
    seoDescription:
      "A practical guide to ground transportation etiquette for executives and delegations visiting Dubai for business — punctuality, discretion, and fleet choice.",
    content: [
      "For executives visiting Dubai on a tight schedule, ground transportation is rarely the interesting part of the trip — which is exactly why it needs to be handled well. The goal of a good [Corporate Chauffeur Service](/services/corporate-chauffeur) isn't a dramatic feature, it's an accumulation of small things done reliably: the driver already knows the building's loading bay, the car is already outside before the meeting has ended, and nobody is checking a phone wondering if the ride is coming.",
      "Discretion is worth asking about directly if you're arranging transport for a delegation. Confidential calls happen in the back seat more often than most people plan for, and an experienced chauffeur knows when to have the radio off and the conversation minimal without being told. It's a small thing that visiting teams notice immediately when it's missing.",
      "Fleet choice should match the meeting, not just the headcount. A solo executive with three back-to-back meetings is usually best in something like the [Mercedes S-Class](/fleet/mercedes-s-class) or [BMW 7 Series](/fleet/bmw-7-series) — quiet enough to take a call between stops. A visiting delegation moves better in a [Mercedes V-Class](/fleet/mercedes-v-class), which seats up to seven without anyone feeling like an afterthought, and keeps the group arriving together rather than split across cars.",
      "For multi-day visits, ask about setting up a standing account rather than booking each leg separately — most Dubai chauffeur services can arrange itemized monthly invoicing and keep the same small pool of drivers assigned to your visit, which matters more than it sounds once a trip stretches past a single day. A driver who already knows your hotel's entrance and your usual pickup time saves real minutes by day two.",
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
