# Apex Limo Dubai — Design System

A reference for the color tokens, spacing scale, and shared components used
across the site. Built on the black/gold/ivory luxury theme; the goal is a
consistent, editorial rhythm of dark and light sections with legible,
accessible text in every context.

## Color tokens

Defined in `tailwind.config.ts`.

| Token | Hex | Use |
|---|---|---|
| `obsidian` | `#0A0A0A` | Primary dark background — Header, Hero, Footer, dark page heroes |
| `obsidian-light` | `#141414` | Rarely used lighter dark variant |
| `charcoal` | `#18181B` | Dark surface/card background (dropdowns, VehicleCard default) |
| `ink` | `#111111` | Booking CTA panel background |
| `ivory` | `#FFFFFF` | Light section background *and* primary text color on dark backgrounds (same token, two roles) |
| `ivory-off` | `#F6F4EF` | Hover state for light cards |
| `linen` | `#FAF8F3` | Cream section background (Fleet Showcase, and cream "body" zones on detail pages) |
| `pearl` | `#F5F2EB` | Cream section background (Testimonials) |
| `gold` | `#D4AF37` | Primary accent — buttons, borders, decorative dividers. **Only for large/graphical elements or on dark backgrounds** — fails WCAG contrast on white (~2.1:1) |
| `gold-deep` | `#A8842C` | Accent icons/text on **light** backgrounds (~3.5:1, passes for icons and large text) |
| `gold-pale` | `#E9D68A` | Subtle highlight/border accent |
| `smoke` | `#B8B5AE` | Muted body text **on dark** backgrounds |
| `graphite` | `#57534E` | Muted body text **on light** backgrounds (~7.6:1 on white) |

### The contrast rule

Plain `gold` text fails accessibility on white/cream backgrounds. The rule
followed throughout the site:

- **Headings** on a light section → `text-obsidian` (never `text-ivory`)
- **Body/label text** on a light section → `text-graphite` (never `text-smoke`)
- **Icons and large display numbers** on a light section → `text-gold-deep`
  (passes the 3:1 non-text/large-text threshold; plain `gold` does not)
- **Functional link text** (e.g. "Learn more") on a light section → dark
  (`text-obsidian`) by default, with a `hover:text-gold-deep` transition —
  keeps the gold accent without sacrificing default-state contrast

## Spacing system

Two named tokens in `tailwind.config.ts` (`theme.extend.spacing`), used via
the `Section` component:

| Token | Value | Use |
|---|---|---|
| `section` | `6rem` (`py-section`) | Standard section vertical padding |
| `section-sm` | `4rem` (`py-section-sm`) | Denser padding — page heroes, legal pages |

Everything else (gaps, margins, card padding) uses Tailwind's default scale
directly — no need to reinvent what's already consistent.

## Shared components

### `Section` (`components/shared/Section.tsx`)

Standard full-width section wrapper: background tone, vertical padding, and
the gold hairline separator that marks a tone change between adjacent
sections.

```tsx
<Section tone="ivory">
  <Container>...</Container>
</Section>
```

- `tone`: `obsidian` (default) | `ivory` | `linen` | `pearl` | `ink`
- `padding`: `lg` (default, 6rem) | `sm` (4rem)
- `separator`: gold hairline at the top — `true` by default; set `false`
  on the first section of a page (no divider needed against the Header)

### `Card` (`components/shared/Card.tsx`)

Reusable bordered panel for content cards, info panels, and stat tiles.

```tsx
<Card tone="light" className="p-6">...</Card>
```

- `tone`: `dark` (default, obsidian panel) | `light` (ivory panel with a
  gold hairline — for content cards sitting on a light section)
- `interactive`: adds a hover border lift
- `as`: render as `article`/`figure`/etc. for semantic markup

**Rule of thumb:** decorative/informational cards (service tiles, vehicle
cards, testimonials, FAQ, related-item grids, stat panels) are tone-aware
and match their parent section. **Functional panels — forms and their
companion info cards (Booking, Quote, Contact)** always use `tone="dark"`,
regardless of the section they sit in. This keeps transactional modules
visually unified as a focused "console," and avoids needing a separate
light-mode variant of `.field-input` for form controls.

### `SectionHeading` (`components/shared/SectionHeading.tsx`)

Eyebrow + heading + subtitle pattern used to open most sections.

```tsx
<SectionHeading eyebrow="..." title="..." subtitle="..." tone="light" />
```

- `tone`: `dark` (default) | `light` — swaps eyebrow/title/subtitle colors
- `align`: `center` (default) | `left`

### `CTAButton` (`components/shared/CTAButton.tsx`)

```tsx
<CTAButton href="/booking" variant="solid">Book Now</CTAButton>
<CTAButton href="/fleet" variant="outline" tone="light">View Fleet</CTAButton>
```

- `variant`: `solid` (gold button, `.btn-gold`) | `outline` (`.btn-outline`)
- `tone`: `dark` (default) | `light` — only affects the outline variant,
  whose text color otherwise defaults to `ivory` and is invisible on a
  light section
- `external`: renders a plain `<a target="_blank">` instead of a Next `Link`

### `VehicleCard` (`components/fleet/VehicleCard.tsx`)

- `tone`: `dark` (default, `bg-charcoal`) | `light` (`bg-ivory`)
- The embedded `VehicleGallery` photo panel always stays dark — it's a
  self-contained "framed photograph" regardless of the card's tone,
  the same way the testimonial avatar-initial badge stays dark on any
  background.

### Global utility classes (`app/globals.css`, `@layer components`)

Unchanged from before this system — still the base for `CTAButton`/forms:
`.label-eyebrow`, `.route-line`, `.route-line-sm`, `.btn-gold`,
`.btn-outline`, `.field-input`, `.field-input-error`.

## Page-level pattern

Most inner pages (About, Contact, Fleet, Services, Locations) follow the
same rhythm, alternating `Section` tones with a hairline between each:

1. **Hero** — `obsidian`, `padding="sm"`, `separator={false}` (sits right
   under the Header, no divider needed)
2. **Body** — `ivory` (long-form copy, benefits, specs — reads best on white)
3. **FAQ + related items** — `linen` or `pearl` (visual close before the CTA)
4. **`<BookingCTA />`** — always `ink`, unchanged
5. **`<Footer />`** — always `obsidian`, unchanged

Legal pages (Privacy, Terms) are a single `ivory` section — dense text
reads better on white, like a printed document.

## What's intentionally out of scope

- The homepage components (`components/home/*`, `Header`, `Footer`) already
  embody this system visually but were **not** rewritten to import
  `Section`/`Card` literally — they predate these primitives and are
  already correct, reviewed, and shipped. Refactoring working code purely
  for architectural consistency wasn't worth the risk/effort here; new work
  uses the primitives, and the homepage can be migrated opportunistically.
- Form input styling (`.field-input`, `FormField`) stays dark-only by
  design (see the Card rule above) — no light-mode input variant exists.
