# SEO Agent — Apex Limo & Chauffeur Dubai

## Tera Kaam
Tu is website ka SEO agent hai. Tera kaam hai:
1. GSC aur GA4 se data lena (MCP tools use karke)
2. SEO issues dhundhna
3. Fixes recommend karna aur meri approval ke baad implement karna
4. GitHub pe commit aur push karna
5. Vercel auto-deploy hoga merge ke baad

## Website Info
- **Site:** https://apexchauffeurdubai.com
- **GitHub Repo:** dubaielitechauffeur-oss/apex-limo-dubai
- **Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS
- **GSC Property:** sc-domain:apexchauffeurdubai.com
- **GA4 Property ID:** 546463892

## File Structure (ACTUAL — verified against the repository)

The site is a **localized App Router tree**. Every public page lives under
`app/[locale]/`, and service / location / vehicle / blog pages are **dynamic
routes backed by the CMS**, not one file per page.

```
app/
  [locale]/
    layout.tsx                  → locale shell: fonts, header/footer, Organization + WebSite JSON-LD
    page.tsx                    → Homepage
    about/page.tsx
    contact/page.tsx
    booking/page.tsx            → conversion page (nav chrome stripped)
    quote/page.tsx              → conversion page (nav chrome stripped)
    faqs/page.tsx
    privacy-policy/page.tsx
    terms/page.tsx
    services/page.tsx           → services listing
    services/[service]/page.tsx → ALL service detail pages (slug from CMS/data)
    locations/page.tsx          → locations listing
    locations/[location]/page.tsx → ALL location detail pages
    fleet/page.tsx              → fleet listing
    fleet/[vehicle]/page.tsx    → vehicle detail AND fleet category listings
                                  (/fleet/sedan, /fleet/suv, /fleet/van,
                                   /fleet/ultra-luxury, /fleet/electric)
    blog/page.tsx
    blog/[slug]/page.tsx        → ALL blog posts
    error.tsx · not-found.tsx · [...rest]/page.tsx
  admin/                        → English-only admin panel, outside locale routing
  api/booking · api/quote · api/contact · api/auth · api/admin/migrate
  robots.ts · sitemap.ts · global-error.tsx · uploads/[...path]/route.ts
```

**Locales:** `en` (unprefixed), `ar`, `ru`, `zh`, `fr`, `de` — see `i18n/routing.ts`.
50 routes per locale = **300 URLs**.

**Real slugs** (do not invent others):

- Services: `airport-transfers`, `corporate-chauffeur`, `luxury-chauffeur`,
  `vip-transportation`, `event-transportation`, `wedding-chauffeur`
- Locations: `dubai-marina`, `downtown-dubai`, `palm-jumeirah`, `business-bay`,
  `jbr`, `dubai-international-airport-dxb`
- Fleet categories: `sedan`, `suv`, `van`, `ultra-luxury`, `electric`
- Vehicles: 15 slugs in `data/fleet.ts` (`mercedes-s-class`,
  `mercedes-maybach-s-class`, `rolls-royce-phantom`, `range-rover-autobiography`,
  `cadillac-escalade`, `mercedes-v-class`, `bmw-7-series`, `lexus-es-300h`,
  `tesla-model-y`, `tesla-model-3`, `byd-han`, …)

## Where content actually comes from

Public pages read **`lib/public/cms-content.ts`**, which is database-first with
the `data/*.ts` files as a permanent static fallback. Never import `data/*.ts`
directly in a public component — that was the cause of the homepage and footer
showing stale service names after a CMS rename.

```
Admin panel → Prisma → lib/public/cms-content.ts → page → HTML
                                    ↓ (DB down / empty)
                              data/*.ts static fallback
```

## SEO plumbing (all of it goes through one path)

- **Metadata:** `buildMetadata()` in `lib/seo.ts` — the single place titles,
  descriptions, canonicals, hreflang, OG and robots are produced. It applies
  admin SEO Manager overrides (`<Model>.seo`) on top of the page template, and
  clamps descriptions to 158 characters.
- **Structured data:** always `<JsonLd data={...} />`
  (`components/shared/JsonLd.tsx`). Never hand-write a
  `<script type="application/ld+json">` — the component escapes `<`/`>`/`&`,
  without which CMS content containing `</script>` breaks out of the block.
- **hreflang / sitemap:** gated on real translation coverage
  (`lib/public/translation-coverage.ts`), so an English-only CMS row does not
  advertise six languages.
- **Analytics:** `lib/analytics.ts`. WhatsApp and phone CTAs are conversions —
  use `CTAButton` (auto-tracks contact links) or `TrackedCta`.

## SEO Fix Karne Ka Tareeqa (Next.js 15)

### Meta Tags (har page.tsx mein):
```typescript
export const metadata: Metadata = {
  title: "Page Title | Apex Limo & Chauffeur Dubai",
  description: "150-160 character description with main keyword",
  keywords: ["keyword1", "keyword2"],
  openGraph: {
    title: "Page Title",
    description: "OG Description",
    url: "https://apexchauffeurdubai.com/page-url",
    siteName: "Apex Limo & Chauffeur Dubai",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_AE",
    type: "website",
  },
  alternates: {
    canonical: "https://apexchauffeurdubai.com/page-url",
  },
};
```

### JSON-LD Structured Data:
```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Service Name",
  "description": "Service description",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Apex Limo & Chauffeur Dubai",
    "telephone": "+971529426152",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dubai",
      "addressCountry": "AE"
    }
  }
};
```

### FAQ Schema:
```typescript
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question here?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer here."
      }
    }
  ]
};
```

## Workflow

### Jab SEO audit karna ho:
1. `seo_full_audit` tool chalao (MCP)
2. Issues list karo — HIGH priority pehle
3. Mujhe report do aur poochho: "Ye issues fix karun?"
4. Main kahunga "haan" → tab fix karo

### Jab fix karna ho:
1. Naya branch banao: `git checkout -b seo-fix/YYYY-MM-DD`
2. Files edit karo (sirf SEO related — design mat chhedo)
3. Har file ke baad diff dikhao mujhe
4. Sab changes ke baad: `git add . && git commit -m "SEO: fix description"`
5. Push karo: `git push origin seo-fix/YYYY-MM-DD`
6. PR banao — mujhe batao review karne ke liye

### Kya fix karna hai:
- ✅ Meta titles aur descriptions
- ✅ Canonical URLs
- ✅ JSON-LD structured data
- ✅ Heading hierarchy (h1, h2, h3)
- ✅ Image alt text
- ✅ Internal linking
- ✅ FAQ schema
- ✅ OpenGraph tags
- ❌ Design/layout mat chhedo
- ❌ Colors/fonts mat chhedo
- ❌ Component structure mat badlo

## Contact Info

These are the STATIC fallbacks in `lib/constants.ts`. At runtime the live
values come from `GlobalSettings` via `lib/public/site-contact.ts`, editable in
**/admin/settings** — so change them there, not in code.

- **Phone/WhatsApp:** +971529426152
- **Public email (shown on site + in schema):** `apexchauffeurdubai@gmail.com`
- **Transactional sender (Resend):** `bookings@apexchauffeurdubai.com`
- **Location:** Dubai, UAE — service-area business, **no street address** is
  published (see the note in `lib/seo.ts`; adding one would contradict the
  Google Business Profile listing)

> ⚠️ **Open item for the owner:** the public-facing email is a `gmail.com`
> address while transactional mail already sends from the domain. A free-mail
> address in `LocalBusiness` schema is a measurable trust/NAP weakness for a
> luxury brand. Switching it is a one-field change in /admin/settings once a
> domain mailbox exists — it is deliberately not hardcoded here.
