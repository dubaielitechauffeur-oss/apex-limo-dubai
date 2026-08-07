import { PERMISSIONS, type Permission } from "./catalog";

/**
 * The 7 approved system roles — unchanged from Phase 2B/2C. This module is
 * the single source of truth for what each one grants; `prisma/seed.ts`
 * imports `ROLE_PERMISSIONS` from here instead of repeating string
 * literals, so the seeded database and this catalog can never drift apart.
 * The permission *values* below are transcribed verbatim from the
 * previously-seeded arrays — nothing was added, removed, or renamed.
 */
export const SYSTEM_ROLES = [
  "super_admin",
  "admin",
  "fleet_manager",
  "booking_manager",
  "content_manager",
  "seo_manager",
  "viewer",
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export function isSystemRoleName(name: string): name is SystemRole {
  return (SYSTEM_ROLES as readonly string[]).includes(name);
}

const P = PERMISSIONS;

/**
 * Role → permission grants, exactly as approved in Phase 2B/2C.
 *
 * `super_admin`'s array is kept for display/seeding purposes (a future
 * "view permissions" screen can read it), but it is NOT what makes
 * super_admin unrestricted at authorization-check time — `isSuperAdmin()`
 * in `context.ts` short-circuits on the role name alone, before this array
 * is ever consulted. That's what satisfies "automatic access to future
 * modules without requiring repeated hard-coded changes": a brand-new
 * permission introduced by a later phase works for super_admin immediately,
 * with no seed/migration required, because the check never looks here for
 * that role.
 */
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  super_admin: [
    P.FLEET_CREATE, P.FLEET_READ, P.FLEET_UPDATE, P.FLEET_DELETE, P.FLEET_PUBLISH,
    P.BOOKINGS_CREATE, P.BOOKINGS_READ, P.BOOKINGS_UPDATE, P.BOOKINGS_DELETE,
    P.QUOTES_CREATE, P.QUOTES_READ, P.QUOTES_UPDATE, P.QUOTES_DELETE,
    P.BLOG_CREATE, P.BLOG_READ, P.BLOG_UPDATE, P.BLOG_DELETE, P.BLOG_PUBLISH,
    P.SERVICES_CREATE, P.SERVICES_READ, P.SERVICES_UPDATE, P.SERVICES_DELETE, P.SERVICES_PUBLISH,
    P.LOCATIONS_CREATE, P.LOCATIONS_READ, P.LOCATIONS_UPDATE, P.LOCATIONS_DELETE, P.LOCATIONS_PUBLISH,
    P.FAQ_CREATE, P.FAQ_READ, P.FAQ_UPDATE, P.FAQ_DELETE,
    P.MEDIA_CREATE, P.MEDIA_READ, P.MEDIA_UPDATE, P.MEDIA_DELETE,
    P.SETTINGS_READ, P.SETTINGS_UPDATE,
    P.SEO_READ, P.SEO_UPDATE,
    P.TRANSLATIONS_READ, P.TRANSLATIONS_UPDATE,
    P.USERS_CREATE, P.USERS_READ, P.USERS_UPDATE, P.USERS_DELETE,
    P.AUDIT_READ,
    P.ANALYTICS_READ,
    P.HOMEPAGE_CREATE, P.HOMEPAGE_READ, P.HOMEPAGE_UPDATE, P.HOMEPAGE_DELETE, P.HOMEPAGE_PUBLISH,
    P.PRICING_CREATE, P.PRICING_READ, P.PRICING_UPDATE, P.PRICING_DELETE,
  ],
  admin: [
    P.FLEET_CREATE, P.FLEET_READ, P.FLEET_UPDATE, P.FLEET_DELETE, P.FLEET_PUBLISH,
    P.BOOKINGS_CREATE, P.BOOKINGS_READ, P.BOOKINGS_UPDATE, P.BOOKINGS_DELETE,
    P.QUOTES_CREATE, P.QUOTES_READ, P.QUOTES_UPDATE, P.QUOTES_DELETE,
    P.BLOG_CREATE, P.BLOG_READ, P.BLOG_UPDATE, P.BLOG_DELETE, P.BLOG_PUBLISH,
    P.SERVICES_CREATE, P.SERVICES_READ, P.SERVICES_UPDATE, P.SERVICES_DELETE, P.SERVICES_PUBLISH,
    P.LOCATIONS_CREATE, P.LOCATIONS_READ, P.LOCATIONS_UPDATE, P.LOCATIONS_DELETE, P.LOCATIONS_PUBLISH,
    P.FAQ_CREATE, P.FAQ_READ, P.FAQ_UPDATE, P.FAQ_DELETE,
    P.MEDIA_CREATE, P.MEDIA_READ, P.MEDIA_UPDATE, P.MEDIA_DELETE,
    P.SETTINGS_READ, P.SETTINGS_UPDATE,
    P.SEO_READ, P.SEO_UPDATE,
    P.TRANSLATIONS_READ, P.TRANSLATIONS_UPDATE,
    // Deliberately no users:create/update/delete — user management stays
    // super_admin-only. See "admin below super_admin" in RBAC.md.
    P.USERS_READ,
    P.AUDIT_READ,
    P.ANALYTICS_READ,
    P.HOMEPAGE_CREATE, P.HOMEPAGE_READ, P.HOMEPAGE_UPDATE, P.HOMEPAGE_DELETE, P.HOMEPAGE_PUBLISH,
    P.PRICING_CREATE, P.PRICING_READ, P.PRICING_UPDATE, P.PRICING_DELETE,
  ],
  fleet_manager: [
    P.FLEET_CREATE, P.FLEET_READ, P.FLEET_UPDATE, P.FLEET_DELETE, P.FLEET_PUBLISH,
    P.MEDIA_CREATE, P.MEDIA_READ, P.MEDIA_UPDATE,
    P.PRICING_CREATE, P.PRICING_READ, P.PRICING_UPDATE, P.PRICING_DELETE,
    P.BOOKINGS_READ,
    P.QUOTES_READ,
  ],
  booking_manager: [
    P.BOOKINGS_CREATE, P.BOOKINGS_READ, P.BOOKINGS_UPDATE,
    P.QUOTES_CREATE, P.QUOTES_READ, P.QUOTES_UPDATE,
    P.FLEET_READ,
    P.ANALYTICS_READ,
  ],
  content_manager: [
    P.BLOG_CREATE, P.BLOG_READ, P.BLOG_UPDATE, P.BLOG_DELETE, P.BLOG_PUBLISH,
    P.SERVICES_CREATE, P.SERVICES_READ, P.SERVICES_UPDATE, P.SERVICES_DELETE, P.SERVICES_PUBLISH,
    P.LOCATIONS_CREATE, P.LOCATIONS_READ, P.LOCATIONS_UPDATE, P.LOCATIONS_DELETE, P.LOCATIONS_PUBLISH,
    P.FAQ_CREATE, P.FAQ_READ, P.FAQ_UPDATE, P.FAQ_DELETE,
    P.MEDIA_CREATE, P.MEDIA_READ, P.MEDIA_UPDATE, P.MEDIA_DELETE,
    P.HOMEPAGE_CREATE, P.HOMEPAGE_READ, P.HOMEPAGE_UPDATE, P.HOMEPAGE_DELETE, P.HOMEPAGE_PUBLISH,
    P.FLEET_READ,
  ],
  seo_manager: [
    P.SEO_READ, P.SEO_UPDATE,
    P.FLEET_READ,
    P.BLOG_READ, P.BLOG_UPDATE,
    P.SERVICES_READ, P.SERVICES_UPDATE,
    P.LOCATIONS_READ, P.LOCATIONS_UPDATE,
    P.FAQ_READ,
    P.SETTINGS_READ, P.SETTINGS_UPDATE,
    P.TRANSLATIONS_READ,
    P.MEDIA_READ,
  ],
  viewer: [
    P.FLEET_READ,
    P.BOOKINGS_READ,
    P.QUOTES_READ,
    P.BLOG_READ,
    P.SERVICES_READ,
    P.LOCATIONS_READ,
    P.FAQ_READ,
    P.MEDIA_READ,
    P.SETTINGS_READ,
    P.SEO_READ,
    P.TRANSLATIONS_READ,
    P.USERS_READ,
    P.AUDIT_READ,
    P.ANALYTICS_READ,
    P.HOMEPAGE_READ,
    P.PRICING_READ,
  ],
};

export const ROLE_DESCRIPTIONS: Record<SystemRole, string> = {
  super_admin: "Full system access — all modules, all actions, user management",
  admin: "Full operational access — all modules except user management and audit deletion",
  fleet_manager: "Fleet management — vehicles, categories, pricing, media uploads",
  booking_manager: "Booking & quote lifecycle management",
  content_manager: "Content management — blog, services, locations, homepage, FAQs, media",
  seo_manager: "SEO metadata management across all content entities",
  viewer: "Read-only access to all modules",
};
