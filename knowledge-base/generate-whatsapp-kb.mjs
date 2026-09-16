#!/usr/bin/env node
/**
 * Generates the WhatsApp Business AI agent knowledge base
 * (knowledge-base/whatsapp-ai-agent-knowledge-base.md) from the site's own
 * content files, so the agent is never trained on hand-copied, drifting text.
 *
 * Source of truth: data/*.ts (the same static fallback the public site uses
 * when the CMS is empty) + lib/constants.ts + messages/en/*.json.
 *
 * Run: node knowledge-base/generate-whatsapp-kb.mjs
 *
 * NOTE: if content has been edited in /admin (CMS), re-export or re-check
 * the affected sections — this script reads the repo's static layer only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ------------------------------------------------------------------ *
 * Pull an exported object/array literal out of a .ts data file and
 * evaluate it. The literals are plain JS (no type assertions inside),
 * so slicing from the `=` to the balanced closing bracket is enough.
 * ------------------------------------------------------------------ */
function literal(file, declaration) {
  const src = read(path.join("data", file));
  const declIndex = src.indexOf(declaration);
  if (declIndex === -1) throw new Error(`${declaration} not found in ${file}`);
  let i = src.indexOf("=", declIndex + declaration.length - 1) + 1;
  while (src[i] === " " || src[i] === "\n") i += 1;
  const start = i;
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "/" && src[i + 1] === "/") i = src.indexOf("\n", i);
    else if (c === "/" && src[i + 1] === "*") i = src.indexOf("*/", i) + 1;
    else if (c === "[" || c === "{") depth += 1;
    else if (c === "]" || c === "}") {
      depth -= 1;
      if (depth === 0) {
        // eslint-disable-next-line no-new-func
        return new Function(`return (${src.slice(start, i + 1)});`)();
      }
    }
  }
  throw new Error(`Unbalanced literal for ${declaration} in ${file}`);
}

/** Collapse every `Localized` field down to its English value. */
function en(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(en);
  if ("en" in value && Object.keys(value).length <= 6 && !("slug" in value)) return en(value.en);
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, en(v)]));
}

const SERVICES = en(literal("services.ts", "export const SERVICES"));
const FLEET = en(literal("fleet.ts", "export const FLEET:"));
const FLEET_CATEGORY_CONTENT = en(literal("fleet.ts", "export const FLEET_CATEGORY_CONTENT"));
const LOCATIONS = en(literal("locations.ts", "export const LOCATIONS"));
const FAQS = en(literal("faqs.ts", "export const FAQS"));
const SERVICES_FAQS = en(literal("servicesFaqs.ts", "export const SERVICES_FAQS"));
const TESTIMONIALS = en(literal("testimonials.ts", "export const TESTIMONIALS"));
const NEW_FAQS = en(literal("faqHub.ts", "export const NEW_FAQS"));
const BLOG_POSTS = en(literal("blog.ts", "export const BLOG_POSTS"));

const messages = Object.fromEntries(
  fs.readdirSync(path.join(ROOT, "messages/en")).map((f) => [
    f.replace(/\.json$/, ""),
    JSON.parse(read(path.join("messages/en", f))),
  ]),
);

const constants = read("lib/constants.ts");
const pick = (key) => constants.match(new RegExp(`${key}:\\s*"([^"]+)"`))?.[1] ?? "";
const SITE = {
  name: pick("name"),
  tagline: pick("tagline"),
  url: pick("url"),
  phoneDisplay: pick("phoneDisplay"),
  phone: pick("phone"),
  email: pick("email"),
};
const RATING = constants.match(/export const RATING = "([^"]+)"/)?.[1] ?? "4.9";
const FLEET_SIZE = constants.match(/export const FLEET_SIZE = "([^"]+)"/)?.[1] ?? "50+";
const SOCIAL = {
  google: constants.match(/googleBusiness: "([^"]+)"/)?.[1] ?? "",
  instagram: constants.match(/instagram: "([^"]+)"/)?.[1] ?? "",
  facebook: constants.match(/facebook: "([^"]+)"/)?.[1] ?? "",
};

/* ------------------------------ helpers ------------------------------ */
const out = [];
const w = (...lines) => out.push(...lines);
const bullets = (items) => (items ?? []).map((i) => `- ${i}`).join("\n");
const qa = (faqs, prefix = "###") =>
  (faqs ?? [])
    .map((f) => `${prefix} Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");
const aed = (n) => `AED ${Number(n).toLocaleString("en-US")}`;
const title = (s) => s.replace(/(^|[-\s])(\w)/g, (m) => m.toUpperCase()).replace(/-/g, " ");

/* =========================== 1. AGENT BRIEF =========================== */
w(
  `# ${SITE.name} — WhatsApp AI Agent Knowledge Base`,
  "",
  `_Single-file knowledge base for a WhatsApp Business AI agent. Generated from the live website content (${SITE.url}) by \`knowledge-base/generate-whatsapp-kb.mjs\`. Regenerate after any content change._`,
  "",
  `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
  "",
  "---",
  "",
  "## 0. HOW THE AGENT MUST BEHAVE",
  "",
  "### Role",
  `You are the WhatsApp concierge for **${SITE.name}**, a luxury chauffeur and limousine company in Dubai, UAE. You answer enquiries, qualify the trip, quote from the published rate card, and collect the details needed to confirm a booking. You are not the driver and you are not dispatch — a human concierge confirms every booking.`,
  "",
  "### Tone",
  "- Polite, warm, concise. Premium but never stiff or salesy.",
  "- Short WhatsApp-length messages. Use line breaks, not walls of text.",
  "- Reply in the language the customer writes in. The website and team support English, Arabic, Russian, Chinese, French and German.",
  "- Never use pressure tactics, fake scarcity, or invented discounts.",
  "",
  "### Hard rules",
  "1. **Never invent facts.** If something is not in this file (a price, a vehicle, a policy, an availability slot), say you'll confirm with the team and hand over.",
  "2. **Never confirm a booking yourself.** You collect details and say the concierge team will confirm. Only a human confirms vehicle availability and the final price.",
  "3. **Prices in this file are the published rate card.** Quote them as *starting from / indicative*, and say the exact price is confirmed by the team before travel. Never negotiate or discount on your own.",
  "4. **Never ask for card numbers, CVV, passport scans, or any payment credentials over WhatsApp.**",
  "5. Do not promise a specific chauffeur, plate number, or arrival minute.",
  "6. If the customer is upset, has a live problem (driver late, lost item, accident), or asks about refunds/complaints → escalate to a human immediately, in the same message.",
  "7. Keep customer data to the booking only. Never share one customer's details with another.",
  "",
  "### Escalate to a human when",
  "- Group is larger than 14 passengers, or a multi-vehicle convoy is needed.",
  "- Corporate account setup, invoicing, contracts, or credit terms.",
  "- Wedding convoys, events, and anything with a decorated vehicle or multi-car timing.",
  "- Changes or cancellations to an existing booking.",
  "- Out-of-emirate or intercity trips (Abu Dhabi, Al Ain, Sharjah, Oman border, etc.).",
  "- Any complaint, refund request, lost property, or safety issue.",
  "- Anything you cannot answer from this file.",
  "",
);

/* =========================== 2. BUSINESS ============================= */
const about = messages.about;
w(
  "---",
  "",
  "## 1. BUSINESS PROFILE",
  "",
  `| Field | Value |`,
  `| --- | --- |`,
  `| Business name | ${SITE.name} |`,
  `| Tagline | ${SITE.tagline} |`,
  `| Website | ${SITE.url} |`,
  `| Phone | ${SITE.phoneDisplay} |`,
  `| WhatsApp | ${SITE.phoneDisplay} |`,
  `| Email | ${SITE.email} |`,
  `| Location | Dubai, United Arab Emirates (service-area business — no walk-in street address) |`,
  `| Service area | All of Dubai and the wider UAE |`,
  `| Rating | ★ ${RATING} average from verified client reviews |`,
  `| Fleet size | ${FLEET_SIZE} luxury vehicles |`,
  `| Experience | 10+ years |`,
  `| Bookings delivered | 1000+ |`,
  `| Booking & chauffeur service hours | 24/7, every day of the year including public holidays |`,
  `| Customer support office hours | ${messages.contact.sidebar.supportHours} |`,
  `| Average WhatsApp response time | ${messages.contact.sidebar.responseTime} |`,
  `| Google Business Profile | ${SOCIAL.google} |`,
  `| Instagram | ${SOCIAL.instagram} |`,
  `| Facebook | ${SOCIAL.facebook} |`,
  "",
  "### Booking links to share",
  `- Book a chauffeur: ${SITE.url}/booking`,
  `- Instant quote: ${SITE.url}/quote`,
  `- Full fleet: ${SITE.url}/fleet`,
  `- All services: ${SITE.url}/services`,
  `- FAQs: ${SITE.url}/faqs`,
  `- Contact: ${SITE.url}/contact`,
  "",
  "### Our story (use for \"who are you?\" style questions)",
  "",
  about.ourStory.paragraph1,
  "",
  about.ourStory.paragraph2,
  "",
  "### Mission & values",
  "",
  bullets(about.values.items.map((v) => `**${v.title}:** ${v.description}`)),
  "",
  "### Why clients choose Apex",
  "",
  bullets(about.whyChoose.items.map((v) => `**${v.title}:** ${v.description}`)),
  "",
  "### Chauffeur standards",
  "",
  about.standards.intro,
  "",
  bullets(about.standards.items),
  "",
  "### Languages",
  "Our chauffeur and support team is multilingual. The website is published in English, Arabic, Russian, Chinese, French and German — customers can be answered in any of these.",
  "",
);

/* =========================== 3. SERVICES ============================= */
w("---", "", "## 2. SERVICES", "");
w(
  "Six core services. Every one is available 24/7 across Dubai.",
  "",
  bullets(SERVICES.map((s) => `**${s.name}** — ${s.shortDescription} (${SITE.url}/services/${s.slug})`)),
  "",
);
for (const s of SERVICES) {
  w(
    `### 2.${SERVICES.indexOf(s) + 1} ${s.name}`,
    "",
    `**Page:** ${SITE.url}/services/${s.slug}`,
    `**One-liner:** ${s.tagline}`,
    `**Summary:** ${s.shortDescription}`,
    `**Highlights:** ${(s.tags ?? []).join(" · ")}`,
    "",
    "**Full description**",
    "",
    (s.longDescription ?? []).map((p) => p.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")).join("\n\n"),
    "",
    "**What's included / benefits**",
    "",
    bullets(s.benefits),
    "",
    "**Why choose Apex for this**",
    "",
    bullets(s.whyChoose),
    "",
    "**FAQs**",
    "",
    qa(s.faqs, "####"),
    "",
  );
}

/* ============================= 4. FLEET ============================== */
w(
  "---",
  "",
  "## 3. FLEET & RATE CARD",
  "",
  "> **Pricing rule for the agent:** quote these as published *starting-from* rates in AED. They cover the chauffeur, fuel, tolls (Salik) and VIP valet parking. Always add that the team confirms the final price and availability before travel, and that the quoted price is then fixed — no surge pricing, no surprise fees.",
  "",
  "### Rate card at a glance",
  "",
  "| Vehicle | Class | Pax | Luggage | Airport transfer | 1 hour | 5 hours | 10 hours | Extra hour | Additional city |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...FLEET.map(
    (v) =>
      `| ${v.name} | ${v.category}${v.isElectric ? " (Electric)" : ""} | ${v.passengers} | ${v.luggage ?? "—"} | ${aed(v.rates.airport)} | ${aed(v.rates.oneHour)} | ${aed(v.rates.fiveHours)} | ${aed(v.rates.tenHours)} | ${aed(v.rates.extraHour)} | ${aed(v.rates.additionalCity)} |`,
  ),
  "",
  "**Package definitions:** airport transfer = one way, point to point. 1 hour = hourly hire. 5 hours = half-day (most popular). 10 hours = full-day hire. Extra hour = each hour beyond the booked package. Additional city = surcharge for adding another city/emirate to the same booking.",
  "",
);
for (const v of FLEET) {
  w(
    `### ${v.name}`,
    "",
    `**Page:** ${SITE.url}/fleet/${v.slug}`,
    `**Brand/model:** ${v.brand} ${v.model} · **Class:** ${v.category}${v.isElectric ? " · Fully electric" : ""}`,
    `**Capacity:** ${v.passengers} passengers${v.luggage ? `, ${v.luggage} suitcases` : ""}`,
    `**Ideal for:** ${v.idealFor}`,
    `**Rates:** airport ${aed(v.rates.airport)} · 1h ${aed(v.rates.oneHour)} · 5h ${aed(v.rates.fiveHours)} · 10h ${aed(v.rates.tenHours)} · extra hour ${aed(v.rates.extraHour)} · additional city ${aed(v.rates.additionalCity)}`,
    "",
    v.description,
    "",
    v.longDescription,
    "",
    "**Features**",
    "",
    bullets(v.features),
    "",
    "**Why clients choose it**",
    "",
    bullets(v.whyChoose),
    "",
    "**FAQs**",
    "",
    qa(v.faqs, "####"),
    "",
  );
}

w("### Fleet categories — how to recommend", "");
for (const [slug, c] of Object.entries(FLEET_CATEGORY_CONTENT)) {
  const inCat = FLEET.filter((v) =>
    slug === "electric" ? v.isElectric : v.category.toLowerCase().replace(" ", "-") === slug,
  );
  w(
    `#### ${title(slug)} (${SITE.url}/fleet/${slug})`,
    "",
    `**Vehicles:** ${inCat.map((v) => v.name).join(", ") || "—"}`,
    "",
    "**Why choose this class**",
    "",
    bullets(c.whyChoose),
    "",
    "**Best occasions**",
    "",
    bullets((c.occasions ?? []).map((o) => `**${o.title}:** ${o.blurb}`)),
    "",
    "**Category FAQs**",
    "",
    qa(c.faqs, "#####"),
    "",
  );
}

/* =========================== 5. LOCATIONS ============================ */
w("---", "", "## 4. LOCATIONS & ROUTES", "");
for (const l of LOCATIONS) {
  w(
    `### ${l.name}${l.isAirport ? " (airport)" : ""}`,
    "",
    `**Page:** ${SITE.url}/locations/${l.slug}`,
    `**Summary:** ${l.shortDescription}`,
    `**Known for:** ${(l.tags ?? []).join(" · ")}`,
    `**Landmarks we serve:** ${(l.landmarks ?? []).join(", ")}`,
    "",
    (l.longDescription ?? []).map((p) => p.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")).join("\n\n"),
    "",
    "**Popular routes & typical drive times**",
    "",
    bullets((l.popularRoutes ?? []).map((r) => `${r.from} → ${r.to}: ${r.duration}`)),
    "",
    "**Why book Apex here**",
    "",
    bullets(l.whyChoose),
    "",
    "**Location FAQs**",
    "",
    qa(l.faqs, "####"),
    "",
  );
}

/* ====================== 6. BOOKING & QUOTE FLOW ====================== */
w(
  "---",
  "",
  "## 5. BOOKING PROCESS — WHAT THE AGENT MUST COLLECT",
  "",
  "Three ways a customer can book, all reaching the same team: WhatsApp, phone, or the website form. Quotes and consultations are free — the customer only pays once a booking is confirmed.",
  "",
  "### Required details for a booking (ask for anything missing, one or two at a time)",
  "1. **Full name**",
  "2. **Phone number** (WhatsApp number is fine)",
  "3. **Email** (for the confirmation)",
  "4. **Pickup location** — for airports, include the terminal (e.g. \"DXB Terminal 3\")",
  "5. **Drop-off location**",
  "6. **Date** (cannot be in the past)",
  "7. **Pickup time**",
  "8. **Vehicle** — or the class, and recommend from the rate card",
  "9. **Number of passengers** (1–14; over 14 → escalate to a human for a convoy)",
  "10. **Package / hours** — point-to-point transfer, 2 hours, 5 hours, 10 hours (full day), or custom",
  "11. **Special requests** — child seats, meet-and-greet name sign, extra stops, accessibility needs, luggage count, preferred language",
  "",
  "### For an airport pickup, also ask",
  "- **Flight number** — we track the flight live, so a delayed or early arrival is handled automatically",
  "- Arrival or departure, and the terminal",
  "",
  "### For a quote request (customer not ready to book), collect",
  "- Name, phone, email",
  "- Service needed, pickup location, date (if known), preferred vehicle (optional), and any trip details",
  "",
  "### What happens next (tell the customer this)",
  "1. Request received",
  "2. Concierge reviews the details",
  "3. Quote sent quickly",
  "4. Booking confirmed — the customer gets a reference number and the chauffeur's details before the trip",
  "",
  "### Response-time promises we can make",
  "- WhatsApp: typically answered within minutes (average under 15 minutes)",
  "- Phone: answered live, 24/7",
  "- Website contact form: within a few hours, usually within one business hour",
  "",
);

/* ============================== 7. FAQs ============================= */
w("---", "", "## 6. FREQUENTLY ASKED QUESTIONS", "");

const grouped = new Map();
for (const f of NEW_FAQS) {
  if (!grouped.has(f.category)) grouped.set(f.category, []);
  grouped.get(f.category).push(f);
}
for (const [cat, items] of grouped) {
  w(`### ${title(cat)}`, "", qa(items, "####"), "");
}
w(
  "### Homepage FAQs",
  "",
  qa(FAQS, "####"),
  "",
  "### Service FAQs",
  "",
  qa(SERVICES_FAQS, "####"),
  "",
  "### Contact FAQs",
  "",
  qa(messages.contact.faqs, "####"),
  "",
);

/* ========================== 8. TESTIMONIALS ========================== */
w("---", "", "## 7. CLIENT REVIEWS (quote only these — never invent one)", "");
for (const t of TESTIMONIALS) {
  w(
    `- **${t.name}** — ★${t.rating} — ${t.serviceUsed}, ${t.location} (${t.date})`,
    `  > ${t.text}`,
    "",
  );
}

/* ============================ 9. BLOG =============================== */
w(
  "---",
  "",
  "## 8. GUIDES ON OUR BLOG (share the link when a customer wants depth)",
  "",
);
for (const p of BLOG_POSTS) {
  const headings = p.content.filter((b) => b.type === "heading").map((b) => b.text);
  w(
    `### ${p.title}`,
    `${SITE.url}/blog/${p.slug} — published ${p.publishDate}, by ${p.author.name} (${p.author.title})`,
    "",
    p.excerpt,
    "",
    `**Covers:** ${headings.join(" · ")}`,
    "",
  );
}
// Any FAQ blocks inside blog posts are real customer questions — keep them.
const blogFaqs = BLOG_POSTS.flatMap((p) =>
  p.content.filter((b) => b.type === "faq").flatMap((b) => b.items ?? b.faqs ?? []),
);
if (blogFaqs.length) {
  w("### Additional Q&A from our guides", "", qa(blogFaqs, "####"), "");
}

/* ========================= 10. REPLY TEMPLATES ======================= */
w(
  "---",
  "",
  "## 9. READY-MADE WHATSAPP REPLIES",
  "",
  "Adapt these — don't paste them robotically.",
  "",
  "**Greeting**",
  `> Welcome to ${SITE.name} 🚘 How can we help with your journey today — an airport transfer, an hourly chauffeur, or something for a special occasion?`,
  "",
  "**Airport transfer enquiry**",
  "> Happy to arrange that. Could you share your flight number, the terminal, your drop-off address, and how many passengers and suitcases? We track your flight live, so a delay or early landing is handled automatically — your chauffeur meets you in the arrivals hall with a name sign.",
  "",
  "**Price question**",
  `> An airport transfer in a Mercedes S-Class starts from ${aed(FLEET.find((v) => v.slug === "mercedes-s-class").rates.airport)}, and a full 10-hour day from ${aed(FLEET.find((v) => v.slug === "mercedes-s-class").rates.tenHours)}. That includes the chauffeur, fuel, tolls and valet parking. Share your pickup, drop-off and date and our team will confirm the exact fixed price — what we quote is what you pay.`,
  "",
  "**Vehicle recommendation**",
  "> For one or two executives, the Mercedes S-Class or BMW 7 Series is the usual choice. Travelling with family and checked luggage, the Cadillac Escalade or Mercedes V-Class is more comfortable. For a wedding or a VIP arrival, the Rolls-Royce Phantom or Maybach S-Class. How many passengers and suitcases are we planning for?",
  "",
  "**Booking details captured → handover**",
  "> Perfect, I have everything: {name}, {date} at {time}, {pickup} → {dropoff}, {vehicle}, {passengers} passengers. Our concierge team will confirm availability and the final price shortly, and you'll get your chauffeur's details before the trip. 🙏",
  "",
  "**Urgent / same-hour request**",
  `> For an immediate pickup let me put you straight through to our team — please call ${SITE.phoneDisplay} and we'll confirm availability right away. We operate 24/7.`,
  "",
  "**Out of scope / unknown**",
  "> Let me check that with our concierge team and come straight back to you — they're available 24/7.",
  "",
  "**Complaint or live problem**",
  `> I'm very sorry about this. I'm escalating it to our concierge team right now — please call ${SITE.phoneDisplay} so we can resolve it immediately.`,
  "",
);

/* ========================= 11. DO-NOT-SAY LIST ====================== */
w(
  "---",
  "",
  "## 10. THINGS THE AGENT MUST NOT SAY",
  "",
  "- Any price, vehicle, route or policy not written in this file.",
  "- A guaranteed pickup time to the minute, or a named chauffeur/plate before dispatch assigns one.",
  "- \"Your booking is confirmed\" — only a human concierge confirms.",
  "- A street address or showroom — Apex is a service-area business across Dubai.",
  "- Discounts, free upgrades, or waived charges.",
  "- Anything about another customer's trip.",
  "- Legal, visa, immigration or customs advice.",
  "- Requests for card details, CVV, bank details, passport copies, or OTPs.",
  "",
  "---",
  "",
  `_End of knowledge base. Source: ${SITE.url} — regenerate with \`node knowledge-base/generate-whatsapp-kb.mjs\` after any content update._`,
  "",
);

const target = path.join(ROOT, "knowledge-base", "whatsapp-ai-agent-knowledge-base.md");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, out.join("\n"), "utf8");
console.log(`Wrote ${target} (${(fs.statSync(target).size / 1024).toFixed(1)} KB)`);
