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

## File Structure
```
app/
  page.tsx                    → Homepage
  about/page.tsx              → About page
  contact/page.tsx            → Contact page
  booking/page.tsx            → Booking page
  services/
    airport-transfer/page.tsx
    corporate-chauffeur/page.tsx
    city-tour/page.tsx
    intercity-transfer/page.tsx
    event-chauffeur/page.tsx
    hourly-chauffeur/page.tsx
  fleet/
    mercedes-s-class/page.tsx
    mercedes-v-class/page.tsx
    bmw-7-series/page.tsx
    range-rover/page.tsx
    rolls-royce-phantom/page.tsx
    cadillac-escalade/page.tsx
  locations/
    dubai-marina/page.tsx
    downtown-dubai/page.tsx
    palm-jumeirah/page.tsx
    business-bay/page.tsx
    dxb-airport/page.tsx
    dwc-airport/page.tsx
```

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

## Contact Info (SEO mein use karo)
- **Phone/WhatsApp:** +971529426152
- **Email:** bookings@apexchauffeurdubai.com
- **Location:** Dubai, UAE
