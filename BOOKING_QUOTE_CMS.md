# Booking & Quote Management CMS

Phase 10 documentation: enterprise-grade admin management for bookings and
quotes, built on `Booking`/`Quote` models that already existed from Phase
2B. Read alongside `FLEET_CMS.md`, `PUBLIC_CMS_INTEGRATION.md`, `RBAC.md`,
and `DATABASE_ARCHITECTURE.md`.

## Why this phase looked different from Phases 7–9

Every prior CMS phase started from "the model exists, the admin UI
doesn't." Phase 10's audit found something more consequential: `Booking`
and `Quote` were fully modeled, the `bookings:*`/`quotes:*` permissions
already existed (Phase 4), a dedicated `booking_manager` role already
existed (Phase 2C), the nav entries and dashboard cards already existed
(Phase 5) — but the **public `/booking` and `/quote` forms never wrote to
the database**. They validated, generated a reference in memory, sent an
internal email via Resend, and showed an inline confirmation. Nothing
persisted. An admin CMS built strictly "on top of existing data" would
have had zero rows to manage, forever.

This is exactly the kind of finding the phase brief says to stop and
explain before proceeding. The user confirmed: wire real persistence into
the existing API routes (additive, same public form/UX, no redesign), and
fold the public quote form's non-matching fields (`serviceType`, `message`)
into the `Quote` row on write rather than changing the public form. Both
decisions are implemented exactly as scoped below.

## Database changes

**None.** `Booking`, `Quote`, their enums (`BookingStatus`, `QuoteStatus`,
`BookingSource`, `PaymentStatus`), and the `Quote.convertedBookingId ↔
Booking.convertedQuote` one-to-one relation were already complete in
`prisma/schema.prisma`. `npx prisma validate` passes with zero migrations
needed — this phase is pure application code on top of an already-correct
schema, the same shape as Phase 9's Fleet CMS.

## Architecture

```
PUBLIC SUBMISSION                    ADMIN MANAGEMENT
──────────────────────────────────────────────────────────────────────
app/api/booking/route.ts         →   lib/admin/bookings.ts
  ├─ existing validation/email        ├─ listBookings / getBooking
  └─ persistBooking() [NEW]           ├─ setBookingStatus (controlled transitions)
                                       ├─ setBookingNotes
app/api/quote/route.ts           →    ├─ softDeleteBooking / restoreBooking
  ├─ existing validation/email        └─ getBookingAuditActivity
  └─ persistQuote() [NEW]
                                  →   lib/admin/quotes.ts (mirrors bookings.ts, plus:)
lib/api-lead-handler.ts               ├─ setQuoteAmount
  ├─ generateReference() [existing]   └─ convertQuoteToBooking (transactional)
  └─ persistBooking/persistQuote [NEW]
                                  →   app/admin/(dashboard)/bookings/*
                                        /admin/bookings (list)
                                        /admin/bookings/[id] (detail)
                                  →   app/admin/(dashboard)/quotes/*
                                        /admin/quotes (list)
                                        /admin/quotes/[id] (detail, convert)
```

## Public submission → persistence

`lib/api-lead-handler.ts` gained `persistBooking(data, context)` and
`persistQuote(data, context)`, called from `app/api/booking/route.ts` and
`app/api/quote/route.ts` immediately after validation passes and the
reference is generated — **alongside**, not instead of, the existing
`dispatchLead()` email/WhatsApp-stub/CRM-stub dispatch. The public form,
its client/server validation, the honeypot/rate-limit checks, the inline
success screen, and the reference shown to the customer are all completely
unchanged.

**Never blocks the customer.** Both functions catch every error internally
and return `null` on failure rather than throwing — a transient database
hiccup must never turn a real submission into a failed one for the
customer, who already has their reference and confirmation regardless of
whether this write succeeds. This mirrors the exact tolerance
`dispatchLead()`'s own callers already had for downstream failures.

**Booking**: 1:1 field mapping — `BookingFormData` already collects every
column `Booking` needs (`dropoffLocation`, `time`, `hours`, `passengers`
included).

**Quote — the field-mapping decision.** `QuoteFormData` collects
`serviceType`/`message`, not `Quote`'s `dropoffLocation`/`time`/`hours`/
`passengers`, and its `date` is optional where the model's isn't. Per the
user's explicit choice ("map on write, minimal form change"), the public
form is untouched; `persistQuote()` instead:
- Folds `serviceType` and the customer's free-text `message` into
  `specialRequests` as readable admin-facing context (e.g. `"Service
  requested: Airport Transfers. No specific date requested (flexible).
  Need a quote for a family of 4."`).
- Defaults `dropoffLocation`/`time`/`hours` to `""` and `passengers` to
  `1` — genuine unknowns until an admin follows up, not lost data.
- Defaults `date` to the submission date when left blank, with an explicit
  "No specific date requested (flexible)" note folded into
  `specialRequests` so an admin never misreads a blank date as a firm
  request for today.

**Vehicle linking.** Both forms submit `Vehicle.name` (a display string,
not a slug — the booking/quote pages still read `data/fleet.ts` directly,
per Phase 8/9's documented scope boundary). `resolveVehicleId()` does a
best-effort `findFirst` match by name; a miss leaves `vehicleId` null while
`vehicleLabel` (always stored) remains the true historical record of what
the customer saw and picked.

**Reference collisions** are treated as an anomaly to log, not retry —
`generateReference()`'s millisecond-timestamp + 4-random-base36-character
scheme is collision-improbable in practice, and retrying risks the stored
row's reference diverging from the one already shown to the customer and
put in their email.

## Status workflow

Enums are exactly what the schema already defined — nothing added,
nothing renamed:

**Booking** (`pending → confirmed → in_progress → completed`, with
`cancelled`/`no_show` as alternate/terminal branches):

```
BOOKING_STATUS_TRANSITIONS = {
  pending:     [confirmed, cancelled],
  confirmed:   [in_progress, cancelled, no_show],
  in_progress: [completed, cancelled],
  completed:   [],   // terminal
  cancelled:   [],   // terminal
  no_show:     [],   // terminal
}
```

**Quote** (`pending → sent → viewed → accepted`, with `rejected`/`expired`
reachable from most non-terminal states):

```
QUOTE_STATUS_TRANSITIONS = {
  pending:   [sent, rejected, expired],
  sent:      [viewed, accepted, rejected, expired],
  viewed:    [accepted, rejected, expired],
  accepted:  [rejected, expired],   // NOT "converted" — see below
  rejected:  [],   // terminal
  expired:   [],   // terminal
  converted: [],   // terminal
}
```

`converted` is deliberately unreachable through `setQuoteStatus()` — it
can only be set by `convertQuoteToBooking()`, alongside the `Booking` row
that status implies exists. Calling `setQuoteStatus(id, "converted")`
directly is rejected with an explicit error pointing at the real endpoint.

**Enforcement is server-side, in `lib/admin/{bookings,quotes}.ts`, for
every role including super_admin** — a business rule, not a permission
rule. `StatusTransitionControl` (the shared admin UI component) disables
non-reachable options in the dropdown as a UX nicety; the real guarantee
is `setBookingStatus`/`setQuoteStatus` re-checking the transition table
against the row's *current* database status on every call, same-status
no-ops are allowed, and every real transition writes an audit log entry
with before/after values.

## Admin modules

Both follow `lib/admin/users.ts`'s shape — operational data with search/
filter/pagination/detail, not `lib/cms/*.ts`'s draft/publish/localization
shape, since bookings and quotes have neither.

**`/admin/bookings`** — search (reference/name/email/phone/vehicle label),
status filter, date-range filter, pagination. **`/admin/bookings/[id]`** —
Customer / Journey / Vehicle / Internal Notes / Activity sections, status
control, delete/restore.

**`/admin/quotes`** — same list shape plus amount/currency column.
**`/admin/quotes/[id]`** — Customer / Trip / Vehicle / Internal Notes /
Activity, quote amount editor, status control, **Convert to Booking**
(only rendered when `status === "accepted"` and not yet converted — the
mutation itself re-verifies this regardless of what the button shows).

**New shared components** (`components/admin/ui/`): `StatusTransitionControl`
(generic status dropdown + Update button, typed per entity's own status
union — `PublishStatusSelect` doesn't fit since Booking/Quote aren't
draft/published/archived), `NotesEditor` (internal-notes textarea + save,
shared by both), `DeleteRestoreControl` (soft-delete/restore pair without
the publish/archive states `PublishActions` also has). Everything else —
`DataTable`, `SearchInput`, `FilterDropdown`, `Pagination`, `StatusBadge`,
`ConfirmDialog`, `PageHeader`, `ErrorState`, form primitives — reused as-is
from Phase 5/7's shared library.

## Quote → Booking conversion

`convertQuoteToBooking(quoteId)` in `lib/admin/quotes.ts`:

1. Requires **both** `quotes:update` and `bookings:create` — reads a Quote
   and writes a Booking, so both permissions are independently checked.
   `booking_manager`/`admin`/`super_admin` hold both; `fleet_manager`
   (read-only on both) and `viewer` are correctly denied.
2. Rejects unless the quote's current status is `accepted` and it hasn't
   already been converted.
3. Runs as one Prisma interactive transaction: creates the `Booking`
   (customer/trip/vehicle fields copied across, `totalAmount` from the
   quote's `estimatedAmount`, `status: "pending"`, `source: "admin"`), then
   `updateMany({ where: { id: quoteId, convertedBookingId: null } })` to
   link it back.
4. **Duplicate-conversion safety is the conditional `updateMany`, not the
   earlier read.** If a concurrent request already converted the same
   quote between the initial check and this point, the `updateMany`
   matches zero rows, the function throws, and Prisma rolls back the
   `Booking` it had just created inside the same transaction — verified by
   a test asserting the booking count doesn't change after a duplicate
   conversion attempt.
5. Writes two audit entries (`create` on the new booking, `update` on the
   quote) and redirects the admin straight to the new booking's detail
   page.

## RBAC

No new permissions — `bookings:create/read/update/delete` and
`quotes:create/read/update/delete` existed since Phase 4, and `admin.ts`'s
nav entries + `lib/admin/dashboard.ts`'s "Total Bookings"/"Pending Quotes"
cards existed since Phase 5. This phase's contribution is entirely
enforcement + UI on top of already-correct scaffolding.

**Confirmed role boundaries** (from `lib/permissions/roles.ts`, unchanged):
`booking_manager` is the dedicated operational role — full create/read/
update on both bookings and quotes, **but not delete**; only `admin`/
`super_admin` can soft-delete. `fleet_manager` and `viewer` get read-only
visibility on both (a fleet manager reasonably wants to see what's
booked). `content_manager` has neither — booking/quote management is not
part of its content-CRUD scope, the same "not every admin role gets every
module" pattern already established for `fleet_manager` in Phase 9. Every
mutation independently re-verifies permission server-side via
`lib/cms/guard.ts`'s `requireCmsPermission` (reused as-is, despite living
in `lib/cms/` — it's generic RBAC-context plumbing, not CMS-specific).

## Audit logging

Reuses `lib/audit/log.ts`'s `writeAuditLog()` exactly as Fleet/Services/
etc. already do — no new logging system. Logged: status changes
(before/after), internal-notes edits, quote-amount changes (before/after),
soft-delete/restore, and quote→booking conversion (two entries, see
above). Each booking/quote detail page renders its own `AuditLog` rows
under "Activity."

## Security

- Every mutation in `lib/admin/{bookings,quotes}.ts` independently checks
  permission — never trusts the admin UI hiding a button, a client-side
  role check, or a request body field.
- Internal notes are a plain `internalNotes` column on the row itself, only
  ever read/written by admin-gated functions, only ever rendered inside
  `/admin/bookings/[id]`/`/admin/quotes/[id]` — no public route, public
  API response, or public query in `lib/public/cms-content.ts` touches
  them.
- Status transitions are validated against the transition table on every
  call, using the row's fresh database status, not a client-supplied
  "previous status" — closes the obvious TOCTOU gap.
- Quote→booking conversion's duplicate-prevention is transactional (see
  above), not a check-then-act race.

## A real bug found (and fixed) during browser verification

Browser-testing the booking detail page surfaced a genuine runtime error
Vitest's function-level tests couldn't have caught: `StatusTransitionControl`
was rendered from a Server Component with `onUpdate={(status) =>
setBookingStatusAction(booking.id, status)}` — an inline arrow function.
React/Next.js only allows a Server Action reference (bound or not) to
cross the Server→Client Component prop boundary; a plain closure wrapping
one throws `"Event handlers cannot be passed to Client Component props"`
at request time, breaking the whole page (confirmed via a full-page
Next.js dev error overlay, not just a console warning).

**Fixed** by making `StatusTransitionControl` generic over the status
type and passing `setBookingStatusAction.bind(null, booking.id)` /
`setQuoteStatusAction.bind(null, quote.id)` — a bound Server Action
reference, exactly the pattern `PublishActions.tsx` already used in Phase
7 for Fleet/Services/etc.'s own publish/unpublish buttons. Verified fixed
by re-running the same browser test: page renders, status transition and
audit log entry both succeed, zero console errors.

This is the concrete payoff of the phase brief's "if browser testing
exposes a genuine bug, fix it before declaring the phase complete" rule —
`npx tsc --noEmit` and the full Vitest suite were both green through this
entire bug's lifetime, since neither ever renders the actual React Server
Component tree the way a browser request does.

## Dashboard

`lib/admin/dashboard.ts`'s "Total Bookings" (`BOOKINGS_READ`-gated) and
"Pending Quotes" (`QUOTES_READ`-gated, filtered to `status: "pending"`)
cards already existed from Phase 5 and needed no changes — verified live
against real submitted data (dashboard read 0 → submitted a real booking
and quote through the public forms → dashboard read 1/1 on next load).
Deliberately did not add more cards (e.g. separate "Confirmed"/"In
Progress" counts) — two permission-gated, accurate numbers satisfy the
brief without overbuilding a dashboard nobody asked for more detail on.

## SEO / public site safety

- `/booking` and `/quote` remain exactly as indexed as before (confirmed
  present in `sitemap.xml`, `robots.txt` unchanged — still only disallows
  `/api/`) — this phase never touched `app/sitemap.ts`, `app/robots.ts`,
  or either page's metadata.
- No new confirmation route was created (there never was one — the
  "thank you" state is inline client state, unchanged), so there was never
  a stray booking/quote-reference URL to accidentally add to the sitemap.
  Verified: `sitemap.xml` contains zero `APX-` reference strings.

## Testing

- `lib/admin/__tests__/bookings.integration.test.ts` — 21 tests: list
  permission gating (content_manager denied, booking_manager/viewer
  allowed), search (reference/email), status filter, pagination, detail
  (found/not-found/soft-deleted-excluded), status transitions (valid,
  invalid-skip, out-of-terminal, viewer-denied), transition-table
  self-consistency, internal notes (booking_manager can, viewer can't),
  soft-delete/restore (**booking_manager correctly denied — no
  `bookings:delete`**; admin succeeds), audit activity retrieval.
- `lib/admin/__tests__/quotes.integration.test.ts` — 26 tests: same shape
  as bookings, plus quote-amount validation (negative/NaN rejected),
  `setQuoteStatus(id, "converted")` explicitly rejected, and 6 dedicated
  `convertQuoteToBooking` tests — successful conversion with full
  field-preservation assertions, duplicate-conversion prevented **with a
  booking-count assertion proving no orphan row was created**, wrong-status
  rejection, viewer denied, fleet_manager denied (has only one of the two
  required permissions).
- `lib/__tests__/api-lead-handler.integration.test.ts` — 7 tests for
  `persistBooking`/`persistQuote` against real Postgres: full field
  mapping, vehicle-name resolution (match and no-match cases), duplicate
  reference handled without throwing, quote's `serviceType`/message
  folding, quote's blank-date fallback + note, quote's vehicle resolution.
- Full suite: **363 tests across 25 files, all passing** (up from 309/22
  at the end of Phase 9).

## Browser verification

Playwright against a running dev server: admin login → dashboard (0 → 1/1
after real submissions) → submitted a real booking and a real quote
through the actual public forms (not fixtures) → confirmed both persisted
correctly in Postgres → bookings list/search/detail → notes saved →
status `pending → confirmed` (caught and fixed the Server/Client boundary
bug here) → quotes list/search/detail → amount saved → notes saved →
status `pending → sent → accepted` → **Convert to Booking** → verified the
resulting booking's fields, `source: "admin"`, carried-over amount, and
the quote's `convertedBookingId`/`status: "converted"` directly in
Postgres → confirmed the Convert button disappears and a "converted to
a booking" notice appears on the now-converted quote → mobile (390×844)
for both list and detail pages on both modules, no horizontal overflow →
Arabic `/ar/booking`/`/ar/quote`, `dir="rtl"`, no overflow → regression
spot-checks on Fleet vehicles list (still 13) and Users page (still
loads) → zero real console errors after the fix. Test data cleaned up
afterward; dashboard/lists verified back to a clean 0/0 baseline.

A pre-existing, unrelated dev-mode `next-intl` warning
(`booking.serviceRequestedTemplate`, the same "fetch a raw ICU template
string for manual `.replace()`" pattern already documented for Fleet's
`whatsappMessageTemplate` in `FLEET_CMS.md`) reproduces on the booking
form's success screen — confirmed pre-existing in `BookingForm.tsx`, a
file this phase never touched, not a regression.

## Deferred / explicitly out of scope

Per the phase brief's own boundary: payment gateway integration, driver
management/assignment (the schema's `driverId` column stays a bare,
unused nullable string — no `Driver` model exists, and none was added),
GPS/live tracking, RTA integration, a dispatch system, WhatsApp
automation (still the existing link-based CTA, not the API), a CRM beyond
the existing no-op stub, accounting/invoicing, a refund system, dynamic
pricing, AI automation, and a customer-facing portal. None of these were
touched or required for a safe, complete booking/quote management CMS.

Also deferred, noted but not built: automatic quote expiry (flipping
`status` to `expired` when `expiresAt` passes would need a scheduled job —
out of scope as automation infrastructure this phase didn't ask for);
customer-facing confirmation/notification emails on admin status changes
(the existing Resend integration only sends the one internal ops
notification on submission — extending it to notify customers on
confirm/cancel is a natural but separate follow-up, not built here to
avoid introducing new email templates/infrastructure unprompted).

## Git

Branch: `claude/enterprise-architecture-foundation-d53rn8`. Not merged to
main, not deployed. `.env` untouched and still git-ignored.
