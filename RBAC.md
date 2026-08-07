# Apex Limo & Chauffeur Dubai — Role-Based Access Control (RBAC)

Phase 4 of the enterprise build-out: the authorization layer on top of
Phase 3's authentication system. This phase is **authorization only** — no
admin dashboard, no CMS modules, no Users & Roles UI. Those are later
phases; this document explains the infrastructure they'll build on.

---

## 1. Architecture Summary

RBAC reuses the Phase 2B/2C database model exactly as designed —
`Role.permissions: String[]` and `User.roleId` — with no schema redesign.
The only database change this phase made was additive: one new
`AuditAction` enum value (`unauthorized_access`) so denials and escalation
attempts have somewhere to be logged. Everything else is a new application
layer, `lib/permissions/`, sitting on top of the existing tables.

**Core design decision — authorization is resolved fresh from the database
on every request, never trusted from the JWT.** Phase 3's session carries
`roleId`/`roleName` for display and identity, but an authorization
*decision* always re-reads the user's current role and that role's current
permissions from Postgres. Section 8 (Caching Strategy) explains why in
full; the short version is that a role reassignment or a permission-list
edit must take effect within one request, not "whenever the affected
user's JWT happens to expire" (up to 30 days away with "remember me").

**super_admin is unrestricted by role name, not by permission list.**
`isSuperAdmin()` checks `roleName === "super_admin"` and short-circuits
every permission check to `true` *before* ever consulting the stored
`permissions` array. This is what satisfies the requirement that
super_admin automatically gets access to permissions introduced by future
modules with no re-seed, no migration, and no per-permission hard-coding —
there is nothing to add anywhere. Every other role, including `admin`, is
checked strictly against its actual stored array.

---

## 2. Roles

The 7 approved system roles, unchanged from Phase 2B/2C — no roles were
added, removed, or renamed:

| Role | Description |
|---|---|
| `super_admin` | Full system access — all modules, all actions, user management |
| `admin` | Full operational access — all modules except user management and audit deletion |
| `fleet_manager` | Fleet management — vehicles, categories, pricing, media uploads |
| `booking_manager` | Booking & quote lifecycle management |
| `content_manager` | Content management — blog, services, locations, homepage, FAQs, media |
| `seo_manager` | SEO metadata management across all content entities |
| `viewer` | Read-only access to all modules |

`admin` is deliberately kept below `super_admin`: it holds every
permission `super_admin` does *except* `users:create`, `users:update`,
`users:delete` — user management, including role assignment, stays
super_admin-exclusive. This was already true in the Phase 2B seed; Phase 4
didn't change it, only centralized where it's defined (see §4).

---

## 3. Permissions

**57 permissions total** (53 through Phase 4, plus 4 faq:* added in Phase 7), one array entry per resource+action combination
the Phase 2B seed already used. Full catalog in
`lib/permissions/catalog.ts`:

| Resource | Actions |
|---|---|
| `fleet` | create, read, update, delete, publish |
| `bookings` | create, read, update, delete |
| `quotes` | create, read, update, delete |
| `blog` | create, read, update, delete, publish |
| `services` | create, read, update, delete, publish |
| `locations` | create, read, update, delete, publish |
| `media` | create, read, update, delete |
| `settings` | read, update |
| `seo` | read, update |
| `translations` | read, update |
| `users` | create, read, update, delete |
| `audit` | read *(never delete — the audit trail is immutable by design, see DATABASE_ARCHITECTURE.md)* |
| `analytics` | read |
| `homepage` | create, read, update, delete, publish |
| `pricing` | create, read, update, delete |

### Naming convention: `resource:action`, not `resource.action`

The task brief that scoped this phase used dot-notation examples
(`fleet.view`, `booking.create`). The actual, already-seeded, already-live
data uses colon-notation with `read` instead of `view`
(`fleet:read`, `bookings:create`) — and a real `super_admin` account,
bootstrapped in Phase 3, already depends on those exact strings. This
document's permission catalog keeps the colon convention deliberately:
renaming every permission string would mean a data migration and a re-seed
for zero behavioral gain, and risks silently breaking the live account if
any step were missed. `lib/permissions/catalog.ts` documents this decision
at the top of the file too, so it isn't just here.

Resource identifiers (`fleet`, `bookings`, `blog`, …) match
`config/modules.ts`'s `MODULE_REGISTRY` ids and `config/admin.ts`'s
`ADMIN_NAV` `moduleId` fields one-to-one — a permission's resource segment
always names a real, already-registered module.

### Known pre-existing naming drift (documented, not fixed)

`types/entities/user.ts` (Phase 1) independently defined a `Permission`
interface with a `PermissionResource` union using *singular* nouns
(`"vehicle"`, `"booking"`, `"service"`) — different from the seed's
`"fleet"`, `"bookings"`, `"services"`. That type was never wired to
anything (`grep` confirms it's referenced only by `types/index.ts`'s
barrel re-export) and Phase 4 leaves it untouched: fixing it isn't
strictly required for RBAC to work, and the task's own scope rule says to
document rather than fix an unrelated architecture problem found along the
way. Whoever eventually revisits `types/entities/user.ts` should treat
`lib/permissions/catalog.ts` as the source of truth, not that file.

---

## 4. Single Source of Truth

`lib/permissions/roles.ts`'s `ROLE_PERMISSIONS` map is now the one place
role→permission grants are defined. `prisma/seed.ts` imports from it
instead of repeating string literals:

```ts
const ROLES = SYSTEM_ROLES.map((name) => ({
  name,
  description: ROLE_DESCRIPTIONS[name],
  isSystem: true,
  permissions: ROLE_PERMISSIONS[name],
}));
```

The values transcribed into `ROLE_PERMISSIONS` are byte-for-byte identical
to the original Phase 2B/2C inline arrays — verified by re-running
`npm run db:seed` before and after the refactor and confirming every
role's permission count was unchanged (53/50/14/8/25/13/15), and by
`lib/permissions/__tests__/roles-seed.integration.test.ts`, which asserts
the live database matches this map exactly on every test run.

---

## 5. Authorization Flow

```
Request
  │
  ▼
middleware.ts (unchanged from Phase 3)
  │  Edge-safe session check — signed out on any /admin/* route (other
  │  than login/forgot-password/reset-password) → redirect to /admin/login.
  │  This is IDENTITY only: "is there a valid session at all."
  ▼
Page / Server Action / Route Handler
  │
  ▼
lib/permissions/guard.ts or api-guard.ts
  │  requirePermission("fleet:update") / requireApiPermission("fleet:update")
  │
  ├─▶ getAuthzContext()  (lib/permissions/context.ts)
  │     Re-reads User.roleId + Role.permissions fresh from Postgres by
  │     session.user.id — the JWT's roleId/roleName are never trusted for
  │     the actual decision, only used to look up "who is this."
  │
  ├─▶ isSuperAdmin(ctx) ? allow immediately, permissions array never read
  │
  ├─▶ hasPermission(ctx, permission) — array membership check
  │
  ├─▶ denied → logUnauthorizedAccess() writes an AuditLog row, then:
  │     • guard.ts:      redirect to /admin/login (no session) or
  │                       /admin/forbidden (session, wrong permission)
  │     • api-guard.ts:  NextResponse 401 (no session) or 403 (wrong permission)
  │
  └─▶ allowed → the calling code proceeds with the resolved AuthzContext
```

---

## 6. The Five Levels — And What Protects Each

The task requires authorization to hold at five levels, never relying on
UI-hiding alone. Here's what's actually built for each, and what's
explicitly *not* built yet because the module it would protect doesn't
exist:

| Level | Mechanism | Status |
|---|---|---|
| **Navigation** | `lib/permissions/nav.ts`'s `filterAdminNav()` / `canAccessModule()`, keyed off `config/admin.ts`'s existing `ADMIN_NAV` | Utility built; **not wired into any rendered sidebar** — no admin shell exists yet (out of scope this phase) |
| **Page** | `requirePermission()` at the top of a Server Component | Utility built; applied only to the one new page this phase adds (`/admin/forbidden`, which just needs a session, not a specific permission) — future CMS pages call it |
| **Server Action** | `requirePermission()` at the top of the action function | Utility built and demonstrated in `lib/permissions/roles-admin.ts`'s `assignUserRole` |
| **API** | `requireApiPermission()` at the top of a Route Handler | Utility built; no protected `/admin` API routes exist yet to apply it to (out of scope this phase) — `lib/permissions/__tests__/guard.integration.test.ts` exercises it directly |
| **Data access** | Same primitives (`getAuthzContext`/`hasPermission`), called from inside a query/mutation function, not from the route that calls it | Demonstrated fully in `roles-admin.ts` — every exported function checks permissions itself rather than trusting its caller already did |

**Why nothing is wired into a sidebar or a real CMS route yet:** those
UIs don't exist. Building the checks *and* leaving them unattached to
anything would be premature; the task is explicit that Phase 4 delivers
the infrastructure, not the modules. `roles-admin.ts` is the one place
this phase includes real, callable, fully-tested business logic (role
listing and role assignment) precisely because the task asked for that
one piece of backend foundation by name — see §9.

---

## 7. Session Integration

Nothing about the Phase 3 session shape changed. `session.user.id`,
`.roleId`, and `.roleName` are read (never written to) by
`getAuthzContext()`, which uses `.id` to look up the user fresh and
ignores `.roleId`/`.roleName` for authorization purposes entirely — they
exist for the session/UI (e.g. showing "Signed in as admin") the same way
they did in Phase 3.

The full permission matrix — the 53-entry catalog, or even a single role's
permission array — is **not** added to the JWT. Putting it there was
considered and rejected:

- It would need to be kept in sync with the database on every permission
  edit, or become stale the moment an admin changes a role's grants.
- JWTs in this app can live up to 30 days ("remember me" — see
  AUTHENTICATION.md §7). A permission change wouldn't take effect for a
  signed-in user until their token naturally expired or they logged out.
- It bloats every request's cookie for data that's cheap to look up fresh.

---

## 8. Caching Strategy

**No cross-request cache of authorization data, by design.** The only
caching involved is React's `cache()` around `getAuthzContext()` — this
deduplicates repeated calls *within a single request or Server Action
invocation* (several nested components each guarding a different
permission shouldn't each issue their own identical query), but guarantees
a completely fresh database read on the very next request. This is the
standard Next.js App Router pattern for exactly this problem, and it's the
only place caching happens in this system.

This closes both staleness windows that matter:

1. **A role's permission list changes** (an admin edits what
   `content_manager` can do). Since the permission array was never cached
   anywhere beyond a single request, the very next request for any user
   holding that role sees the change.
2. **A user's role assignment changes** (moved from `viewer` to `admin`).
   Because `getAuthzContext()` re-reads `User.roleId` by `session.user.id`
   rather than trusting the JWT's `roleId`, this also takes effect on the
   next request — not the next login, even though the JWT itself is
   unchanged and could otherwise still claim the old role for up to 30
   days.

The tradeoff is one extra `User.findUnique` (with its `Role` relation) per
request that calls a guard — acceptable for an internal admin tool at this
scale, and the request-scoped `cache()` keeps it to *one* such query no
matter how many separate `requirePermission()` calls a single page/action
makes.

---

## 9. Role Management Foundation (Backend Only)

`lib/permissions/roles-admin.ts` — no UI, per the task's explicit scope
rule, but fully working and tested:

- **`listRoles()`** — every role with its permission count. Requires
  `users:read`.
- **`listPermissionCatalog()`** — the full 57-permission catalog grouped
  by resource, for a future "what does this role grant" screen. Requires
  `users:read`.
- **`assignUserRole(targetUserId, newRoleId)`** — the actual role-change
  operation, with three layered guards:
  1. Caller must hold `users:update` (currently `super_admin` only, per
     the existing seed).
  2. **No self-role-change.** A user can never change their own role,
     regardless of permissions — this forces a second administrator into
     the loop for any role change, preventing both accidental lockout and
     silent self-escalation.
  3. **Only a *current* `super_admin` may grant or revoke the
     `super_admin` role**, checked on the caller's actual role name — not
     on `users:update` — as defense in depth. `users:update` happens to
     only belong to `super_admin` today, but this guard doesn't rely on
     that staying true; a future role edit that accidentally grants
     `users:update` to some other role still can't be used to mint a new
     super_admin. `lib/permissions/__tests__/roles-admin.integration.test.ts`
     proves this specific scenario with a throwaway custom role that has
     `users:update` but isn't `super_admin`.

Every denial (missing permission, self-change attempt, escalation
attempt) and every successful change is written to `AuditLog` — see §10.

These are plain async functions, not Server Actions themselves (no
`"use server"`), deliberately: they return a typed
`{ success: true, data } | { success: false, error }` result rather than
redirecting, so a future Server Action can wrap one of them and shape the
result into `useActionState` form state — the same pattern
`lib/auth/actions.ts` already established in Phase 3.

---

## 10. Audit Logging

`lib/audit/log.ts`'s `writeAuditLog()` is a small, generic wrapper around
`prisma.auditLog.create()` — fire-and-forget (a logging failure must never
block or fail the security check it's logging), best-effort IP/user-agent
capture via `headers()` when a request context is available.

`lib/permissions/audit.ts` builds the two RBAC-specific events on top of
it:

- **`logUnauthorizedAccess(ctx, permission, reason, path?)`** — called by
  every guard on every denial for an *authenticated* user (an anonymous
  visitor being told to sign in isn't a security event). Covers both
  plain permission denials and privilege-escalation attempts; `reason`
  distinguishes them (`missing_permission`, `self_role_change_attempt`,
  `super_admin_role_change_by_non_super_admin`, etc.).
- **`logRoleChange(actor, targetUserId, targetUserName, before, after)`**
  — called by `assignUserRole` on every successful change. Reuses the
  existing `update` `AuditAction` (an `entityType: "user"` row with a
  `{ field: "role", before, after }` diff) rather than adding another enum
  value for what is, at the data level, an ordinary field update — "role
  assigned" (brand-new user) and "role changed" (reassignment) share this
  same shape.

The only schema change either of these needed was the single
`unauthorized_access` enum value (§1) — there was no existing `AuditAction`
that fit a security-denial event without being misleading.

No Audit Logs UI was built (out of scope) — these are write-only from this
phase's perspective, queryable directly via Prisma/`psql` today, ready for
a future `audit:read`-gated viewer.

---

## 11. Error Handling

| Situation | Page/Action/Data level (`guard.ts`) | API level (`api-guard.ts`) |
|---|---|---|
| No session at all | Redirect to `/admin/login` | `401 Unauthorized` |
| Signed in, missing permission | Redirect to `/admin/forbidden` (logged) | `403 Forbidden` (logged) |

**Why pages redirect instead of returning a literal 401/403 status:**
Next.js 16 has an experimental `forbidden()`/`unauthorized()` pair
(`next/navigation`, gated behind `experimental.authInterrupts` in
`next.config.ts`) that can render a real 401/403 for a page. This phase
deliberately does **not** enable it — it's experimental, and doing so
would mean touching `next.config.ts`, which the task's scope rules single
out as off-limits absent a strict RBAC requirement. A redirect to a
dedicated, clearly-labeled `/admin/forbidden` page (itself gated the same
way every other protected page is) is the same pattern Phase 3 already
established for the unauthenticated case (`/admin/login`), and is standard
Next.js App Router UX. Route Handlers have no such ambiguity — they return
real `401`/`403` status codes via `NextResponse.json(..., { status })`,
satisfying the task's status-code requirement exactly where it's actually
meaningful (a JSON API consumer, not a browser navigation).

No response body ever includes *which* permission was required or *why*
in more detail than "Unauthorized"/"Forbidden" — that detail goes only to
the server-side audit log, never back to the client.

---

## 12. Protecting Future Modules — Developer Guide

### A new admin page (Server Component)

```ts
// app/admin/fleet/page.tsx
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";

export default async function FleetPage() {
  const ctx = await requirePermission(PERMISSIONS.FLEET_READ);
  // ctx.userId / ctx.roleName available if the page needs them
  // ... fetch and render
}
```

### A new Server Action (mutation)

```ts
// lib/fleet/actions.ts
"use server";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";

export async function deleteVehicleAction(vehicleId: string) {
  await requirePermission(PERMISSIONS.FLEET_DELETE);
  // ... perform the mutation; requirePermission already redirected away
  //     if the caller isn't allowed to get here
}
```

### A new API Route Handler

```ts
// app/api/admin/fleet/route.ts
import { requireApiPermission } from "@/lib/permissions/api-guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";

export async function DELETE(request: Request) {
  const authz = await requireApiPermission(PERMISSIONS.FLEET_DELETE);
  if (!authz.authorized) return authz.response; // already a 401 or 403
  // ... perform the mutation using authz.ctx
}
```

### A new data-access function meant to return a typed result, not redirect

Use the non-throwing primitives directly, the same way
`lib/permissions/roles-admin.ts` does — this is the right choice whenever
the caller (typically a Server Action already using the `{ error }` form-
state pattern from `lib/auth/actions.ts`) needs to show an inline message
rather than have the whole page yanked away:

```ts
import { getAuthzContext, hasPermission } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";

export async function updateVehiclePricing(vehicleId: string, rates: VehicleRates) {
  const ctx = await getAuthzContext();
  if (!ctx || !hasPermission(ctx, PERMISSIONS.PRICING_UPDATE)) {
    return { success: false as const, error: "You do not have permission to update pricing." };
  }
  // ...
}
```

### A new nav item

Add it to `config/admin.ts`'s `ADMIN_NAV` with the right `moduleId` — if
that id matches an existing resource (`fleet`, `bookings`, …),
`lib/permissions/nav.ts` already knows how to gate it once a future
sidebar calls `filterAdminNav()`. **This alone never protects the route it
links to** — the page/action/API behind it still needs its own
`requirePermission`/`requireApiPermission` call regardless of whether the
link is shown.

### Never write a raw role check

```ts
// ❌ Don't do this
if (user.role === "admin") { ... }

// ✅ Do this instead
await requirePermission(PERMISSIONS.FLEET_UPDATE);
```

The one legitimate exception is a true role-level operation that isn't
about a resource+action at all (the super_admin-only grant/revoke guard in
`assignUserRole` is the one example in this codebase) — use `requireRole()`
there, not an inline `===` check, so the denial is still audit-logged
consistently.

---

## 13. Files Created

```
lib/permissions/
  catalog.ts             57-permission catalog, Permission/Resource types
  roles.ts                 SYSTEM_ROLES, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS
  context.ts                 getAuthzContext (DB-fresh), isSuperAdmin, hasPermission
  guard.ts                     requirePermission / requireAnyPermission /
                                requireAllPermissions / requireRole (redirect-based)
  api-guard.ts                   requireApiPermission / requireAnyApiPermission (401/403)
  nav.ts                           canAccessModule / filterAdminNav
  audit.ts                          logUnauthorizedAccess / logRoleChange
  roles-admin.ts                      listRoles / listPermissionCatalog / assignUserRole
  index.ts                              barrel export
  __tests__/
    fixtures.ts                          shared test-user creation/cleanup
    catalog.test.ts                       pure catalog tests
    context.pure.test.ts                    pure hasPermission/isSuperAdmin tests
    roles-seed.integration.test.ts            DB ↔ catalog drift guard
    guard.integration.test.ts                   requirePermission/requireApiPermission
    roles-admin.integration.test.ts               assignUserRole + escalation guards

lib/audit/
  log.ts                  generic writeAuditLog()

app/admin/forbidden/page.tsx    minimal 403 landing page

vitest.config.mts / vitest.setup.ts   test runner config
```

## 14. Files Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | One new `AuditAction` enum value: `unauthorized_access`. Nothing else. |
| `prisma/seed.ts` | Role definitions now import from `lib/permissions/roles.ts` instead of repeating string literals — same values, single source of truth. |
| `package.json` / `package-lock.json` | Added `vitest` (devDependency), `test`/`test:watch` scripts. |

No file under `app/[locale]/`, `middleware.ts`, `components/` (other than
the new `app/admin/forbidden/`), `i18n/`, `messages/`, `data/`, or
`.env.example` was touched.

---

## 15. Verification Results

| Gate | Result |
|---|---|
| `prisma validate` | Schema valid |
| `prisma generate` | Client generated (7.9.1) |
| `tsc --noEmit` | 0 errors |
| `eslint .` | 0 errors, 0 warnings |
| `next build` | 301/301 pages (300 from Phase 3 + the new `/admin/forbidden`) |
| `npm run test` (Vitest) | **75/75 passing**, 5 test files |

Test coverage by scenario (mapped to the task's required list):

| Scenario | Covered by |
|---|---|
| super_admin access | `guard.integration.test.ts`, `context.pure.test.ts` |
| admin access | same — granted vs. super_admin-only permissions |
| fleet_manager restrictions | same — `fleet:update` passes, `bookings:update` forbidden |
| booking_manager restrictions | same — `bookings:create` passes, `fleet:update` forbidden |
| content_manager restrictions | same — `blog:publish` passes, `users:read` forbidden |
| seo_manager restrictions | same — `seo:update` passes, `blog:delete` forbidden |
| viewer restrictions | same — every read passes, every write forbidden |
| unauthenticated access | `guard.integration.test.ts` — redirect to login / 401 |
| direct URL / API access | `requireApiPermission` tests — DB-resolved, not client-trusted |
| Server Action authorization | `roles-admin.integration.test.ts` (`assignUserRole` is a real, protected mutation) |
| API authorization | `guard.integration.test.ts`'s `requireApiPermission` suite (401/403) |
| unauthorized mutation attempts | `roles-admin.integration.test.ts` — denied + audit-logged |
| role changes | `roles-admin.integration.test.ts` — successful change + audit row asserted |
| privilege escalation attempts | `roles-admin.integration.test.ts` — self-change, non-super-admin granting/revoking super_admin (including the defense-in-depth custom-role scenario) |

**End-to-end note:** Phase 3 already proved the middleware-level
unauthenticated-redirect and direct-URL-access behavior with a real
browser (Playwright, documented in AUTHENTICATION.md). That middleware is
completely unchanged in this phase, so it wasn't re-proven with a browser
again — Phase 4's genuinely new surface (the permission layer on top) is
what the Vitest suite above targets, against a real local Postgres
instance with the real seeded roles, not mocks of the authorization logic
itself.

---

## 16. Risks & Recommendations for Phase 5

1. **`roles-admin.ts` has real, callable, permission-checked mutation
   logic with no UI in front of it yet.** That's intentional (§9), but
   whoever builds the Users & Roles module should call these functions
   directly rather than re-implementing role-assignment logic — the
   escalation guards live here, not in any future UI layer.
2. **The audit log has no retention/archival policy.** `AuditLog` rows are
   never deleted (by design — DATABASE_ARCHITECTURE.md). At meaningful
   admin-panel usage volume, a future phase should decide on an archival
   strategy before the table grows unbounded.
3. **Non-system (custom) roles are already possible at the data level**
   (`Role.isSystem: false`) and `hasPermission`/`isSuperAdmin` handle them
   correctly (a custom role is just checked against its own array, same as
   any non-super_admin system role) — but there's no UI to create one yet.
   `hasSystemRole()`/`isSystemRoleName()` exist specifically so a future
   custom-roles feature can distinguish "one of the 7 built-ins" from
   "admin-created" without another schema change.
4. **The pre-existing `types/entities/user.ts` naming mismatch** (§3) is
   worth cleaning up whenever that file is next touched for an unrelated
   reason — not urgent, documented rather than fixed per this phase's
   scope rules.
5. **Rate limiting and account lockout (Phase 3) are unaffected by and
   independent of RBAC** — a locked-out or rate-limited user never reaches
   a permission check at all, since they can't establish a session in the
   first place.
