# Admin Panel

Phase 5 documentation: the admin dashboard shell, navigation, and the first
real module built on top of it — Users & Roles. Read alongside
`ARCHITECTURE.md` (folder conventions, module registry), `RBAC.md`
(permission catalog, guards, escalation rules — this phase reuses that
toolkit unchanged) and `AUTHENTICATION.md` (session/login).

## Scope of this phase

Built: the admin shell (sidebar, header, mobile drawer), a real Prisma-backed
dashboard, full Users & Roles management, an audit log viewer, a read-only
Settings foundation, and "Coming Soon" placeholders for every module not yet
implemented.

Not built (explicit phase boundary — future phases): CRUD for Vehicles,
Pricing, Blog, Locations, Services, Homepage, SEO, Translations, Analytics.
Their placeholder routes exist, are permission-gated, and are ready to be
replaced module-by-module without touching the shell. The Media Library
(`/admin/media`) is real as of Phase 6 — see `MEDIA_LIBRARY.md`.

## Route structure

```
app/admin/
  layout.tsx                 Root <html>/<body> for all of /admin (unchanged)
  login/, forgot-password/, reset-password/
                              Unauthenticated auth screens — dark AuthCard
                              chrome (Phase 3), untouched by this phase
  (dashboard)/                Route group: every authenticated screen
    layout.tsx                 requireUser() + AdminShell (sidebar/header)
    page.tsx                   Dashboard ("/admin")
    change-password/
    forbidden/                 403 target for requirePermission/requireRole
    users/                     Users & Roles list
    users/[id]/                User detail + role/status/reset actions
    audit/                     Audit log viewer
    settings/                  Settings foundation (read-only)
    media/                     Media Library (Phase 6 — see MEDIA_LIBRARY.md)
    media/[id]/                Media details/edit
    bookings/, quotes/, homepage/, fleet/, fleet/vehicles/,
    fleet/categories/, pricing/, services/, locations/, blog/,
    seo/, translations/, analytics/
                                "Coming Soon" placeholders, one per module
```

A Next.js route group (`(dashboard)`) does not affect the URL — `/admin`,
`/admin/users`, `/admin/login` etc. are unchanged from Phase 3/4. The group
exists purely so login/forgot-password/reset-password (which must render
without a sidebar, for a signed-out visitor) and everything else (which must
render inside `AdminShell`) can have different layouts without duplicating
route paths.

`components/admin/AdminTopBar.tsx` (Phase 3's original authenticated header)
is retired — its jobs (name/email display, change-password link, sign out)
are now `AdminHeader` + `UserMenu`, which reuse `LogoutButton.tsx` unchanged.

## Navigation

The sidebar renders `config/admin.ts`'s `ADMIN_NAV` — the same data module
Phase 1 created for this exact purpose — filtered per request by
`lib/permissions/nav.ts`'s `filterAdminNav()` (built in Phase 4, wired into a
real layout for the first time this phase). No second nav/permission system
was created.

```
app/admin/(dashboard)/layout.tsx
  → getAuthzContext()               DB-fresh permissions for this request
  → filterAdminNav(ADMIN_NAV, ctx)  drop any item the user can't open
  → <AdminShell nav={...}>          sidebar renders only what's left
```

Icon strings in `ADMIN_NAV` (e.g. `"LayoutDashboard"`) are resolved to real
`lucide-react` components by `components/admin/ui/Icon.tsx`'s `AdminNavIcon` —
the one place a new nav item's icon name needs to be added to.

**Hiding a link is not a security boundary.** Every route behind it still
calls its own `requirePermission()` (pages) or the `roles-admin.ts` guarded
functions (mutations) — see Security below.

## Reusable component library

```
components/admin/
  layout/
    AdminShell.tsx      Desktop sidebar + mobile drawer + header + content;
                         owns the drawer open/close state
    SidebarNav.tsx       Shared nav-list renderer (desktop sidebar + mobile
                         drawer both wrap this — no markup/active-state drift)
    AdminHeader.tsx      Sticky top bar, hamburger button on mobile
    UserMenu.tsx         Name/email/role, change-password link, sign out
  ui/
    Icon.tsx             ADMIN_NAV icon-name → lucide-react component map
    PageHeader.tsx, Breadcrumbs.tsx
    DataTable.tsx         Presentational table; horizontal scroll is scoped
                         to the table's own wrapper, never the page
    SearchInput.tsx, FilterDropdown.tsx, Pagination.tsx
                         URL-driven (?q=, ?role=, ?page=) — filters are
                         shareable links and survive back/forward nav
    StatusBadge.tsx, EmptyState.tsx, LoadingState.tsx, ErrorState.tsx
    Modal.tsx, ConfirmDialog.tsx
                         Bottom-sheet on mobile, centered dialog on desktop
    PermissionGate.tsx    UI-convenience-only permission check (see Security)
    FormField.tsx, PasswordInput.tsx
                         Light-surface counterparts to the dark
                         components/admin/auth/ versions (see Design notes)
    Toast.tsx             Minimal Context-based toast provider/hook, no new
                         dependency; mounted once by AdminShell
    DashboardCard.tsx, ModulePlaceholder.tsx
  users/
    PermissionView.tsx   53-permission catalog grouped by resource, with a
                         check/muted state per permission (see below)
    RoleChangeForm.tsx, UserStatusToggle.tsx, SendPasswordResetButton.tsx
  audit/
    DateRangeFilter.tsx, AuditChanges.tsx
  settings/
    SettingsSection.tsx, SettingsField.tsx
  forms/
    AdminChangePasswordForm.tsx
```

### Design notes

The admin panel intentionally does **not** reuse the public site's obsidian/
gold marketing theme — it's a plain light dashboard surface (Tailwind's
built-in `gray`/`emerald`/`amber`/`red` scales), matching the task's "own
clean SaaS/dashboard UI" requirement. `tailwind.config.ts` was not touched;
no new design tokens were added. `components/shared/Card.tsx`/`FormField.tsx`
were evaluated but not reused directly — `DESIGN_SYSTEM.md` notes form inputs
are dark-surface-only by design, so admin gets its own light-surface
`FormField`/`PasswordInput` with the same prop contract instead of adding a
light variant to the shared public components.

## Dashboard

`lib/admin/dashboard.ts`'s `getDashboardStats()` runs one real Prisma
`count()` per resource (`Vehicle`, `Booking`, `Quote`, `BlogPost`, `Service`,
`Location`, `User`), each independently checked against that resource's own
`:read` permission. A card only renders if the signed-in role can see it — no
invented numbers, and a role with narrow access simply sees fewer cards
rather than zeroes standing in for "no permission."

## Users & Roles

- `lib/admin/users.ts` — read queries: `listUsers()` (search/filter/paginate/
  sort), `getUserDetail()`, `getUserAuditActivity()`. Gated on `users:read`.
  Selects only display-safe columns — no `passwordHash`, tokens, or session
  rows ever leave this module.
- `lib/permissions/roles-admin.ts` — mutations, extended this phase:
  - `assignUserRole()` — **unchanged from Phase 4**, reused directly.
  - `setUserActive()` — enable/disable, added this phase. Mirrors
    `assignUserRole`'s guard order: `users:update` → no self-deactivation →
    only a super_admin may change another super_admin's status (defense in
    depth, checked on the *target's* role name, not on `users:update` alone).
  - `adminSendPasswordReset()` — added this phase. Deliberately reuses the
    self-service forgot-password flow's exact token/email path
    (`generateResetToken`, `sendPasswordResetEmail`) instead of letting an
    admin type a new password for someone else. An admin never sees or
    transmits another user's plaintext password; the target still proves
    control of their mailbox before the reset takes effect.
- `app/admin/(dashboard)/users/[id]/actions.ts` — thin `"use server"`
  wrappers around the three functions above for `useActionState`/client
  calls. No authorization logic lives in this file — every check happens
  exactly once, inside `roles-admin.ts`.

All three mutations write to `AuditLog` (reusing `logRoleChange`/
`writeAuditLog` from Phase 4) and are visible in a user's "Recent Activity"
panel and in `/admin/audit`.

### Role selector & Permission View

`RoleChangeForm` shows all 7 system roles (name, description, permission
count) and, via `PermissionView`, exactly which of the 53 catalog permissions
the *currently selected* role would grant — updated live as the admin changes
the dropdown, before submitting. This phase only **displays** a role's
permissions; there is no per-user permission override UI, matching the
existing schema (`Role.permissions` is the only grant surface — see
`RBAC.md`).

## Audit Log

`/admin/audit` (`lib/admin/audit.ts`, gated on `audit:read`) lists
`AuditLog` rows with pagination, action/entity-type filters, a date range,
and a text search over `userName`/`entityId`. `changes` (a `Json` column) is
shown truncated/monospace, not parsed into an assumed shape, since its
structure varies by action. IP address is shown (standard audit-log
practice); user-agent strings are not, to keep the table readable.

## Settings foundation

`/admin/settings` (`lib/admin/settings.ts`, gated on `settings:read`) reads
the single `GlobalSettings` row if one exists and displays every field that's
safe to show (company/contact/social/business/SEO). `GlobalSettings` is never
seeded (see `prisma/seed.ts`), so an empty table renders a clear empty state,
not an error. Notifications and Security are explicit "Coming soon" sections
— no security-related columns exist on `GlobalSettings` today (password
policy, session lifetime, and lockout thresholds are enforced in code, per
`AUTHENTICATION.md`/`RBAC.md`), so nothing was invented to fill them. This
phase is read-only; an editor is future work.

## Security model

Unchanged from `RBAC.md`'s five-level protection model — this phase adds
pages and mutations to it, not a new mechanism:

1. **Navigation** — `filterAdminNav()` hides links a role can't use.
2. **Page** — every `(dashboard)` page calls `requirePermission()` (or
   `requireUser()` for the "any signed-in admin" dashboard/change-password/
   forbidden screens) before rendering.
3. **Action** — every mutation (`assignUserRole`, `setUserActive`,
   `adminSendPasswordReset`) re-checks permission and escalation rules
   itself; the Server Action wrappers in `users/[id]/actions.ts` add no
   authorization of their own.
4. **API/data** — `lib/admin/users.ts`, `lib/admin/audit.ts`,
   `lib/admin/settings.ts`, `lib/admin/dashboard.ts` all re-derive
   `getAuthzContext()` and check permissions independently of the page that
   calls them — a future API route hitting the same functions gets the same
   enforcement for free.
5. **Data exposure** — `passwordHash`, reset tokens, and session rows are
   never selected by any admin-panel query, not just hidden in the UI.

No admin page trusts a client-side role, a hidden button, or a nav item's
absence as its actual protection — `PermissionGate.tsx` and `filterAdminNav()`
are UI convenience only, documented as such at their definitions.

## Mobile

The sidebar becomes a slide-over drawer (`AdminShell`) below the `lg`
breakpoint, sharing the exact same `SidebarNav` markup as desktop so nothing
drifts between the two. Tables scroll horizontally inside their own
container (`DataTable`), never the page. Modals/dialogs render as a bottom
sheet on small screens. Verified with Playwright at a 390×844 viewport across
the dashboard, Users & Roles list/detail, and audit log — no page-level
horizontal overflow on any screen tested.

## Future CMS integration points

Each placeholder route (`bookings`, `fleet`, `blog`, …) already: resolves to
the correct `moduleId`/permission via `MODULE_VIEW_PERMISSION`
(`lib/permissions/nav.ts`), calls `requirePermission()` for that resource,
and renders inside `AdminShell` via the shared `(dashboard)` layout. Building
a module's real CRUD in a future phase means replacing one `ModulePlaceholder`
render with real content — the shell, guard, and nav entry require no change.
`DataTable`, `Pagination`, `SearchInput`, `FilterDropdown`, `FormField`,
`ConfirmDialog`, and `Toast` are written generically enough to be reused by
those modules rather than rebuilt.
