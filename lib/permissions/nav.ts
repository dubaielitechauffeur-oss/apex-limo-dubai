import type { AdminNavItem, AdminNavSection } from "@/config/admin";
import { PERMISSIONS, type Permission } from "./catalog";
import { hasPermission, type AuthzContext } from "./context";

/**
 * `moduleId` → the permission that gates seeing that nav item. Module ids
 * come from `config/admin.ts` / `config/modules.ts` and match a permission
 * resource one-to-one for every module except `"admin"` (the Dashboard
 * overview item), which has no dedicated resource and is visible to any
 * signed-in admin — same gate `app/admin/page.tsx` already uses via
 * `requireUser()`.
 */
const MODULE_VIEW_PERMISSION: Partial<Record<string, Permission>> = {
  fleet: PERMISSIONS.FLEET_READ,
  bookings: PERMISSIONS.BOOKINGS_READ,
  quotes: PERMISSIONS.QUOTES_READ,
  blog: PERMISSIONS.BLOG_READ,
  services: PERMISSIONS.SERVICES_READ,
  locations: PERMISSIONS.LOCATIONS_READ,
  faq: PERMISSIONS.FAQ_READ,
  media: PERMISSIONS.MEDIA_READ,
  settings: PERMISSIONS.SETTINGS_READ,
  seo: PERMISSIONS.SEO_READ,
  translations: PERMISSIONS.TRANSLATIONS_READ,
  users: PERMISSIONS.USERS_READ,
  audit: PERMISSIONS.AUDIT_READ,
  analytics: PERMISSIONS.ANALYTICS_READ,
  homepage: PERMISSIONS.HOMEPAGE_READ,
  pricing: PERMISSIONS.PRICING_READ,
};

export function canAccessModule(ctx: AuthzContext | null, moduleId: string): boolean {
  const permission = MODULE_VIEW_PERMISSION[moduleId];
  if (!permission) return !!ctx; // no dedicated resource — any signed-in admin
  return hasPermission(ctx, permission);
}

/**
 * Filters a nav tree shaped like `config/admin.ts`'s `ADMIN_NAV` down to
 * the items the current user may see. **UI convenience only** — hiding a
 * link here does not protect the route it points to. Every route it links
 * to must independently call `requirePermission` (guard.ts) at the
 * page/action/API level; this function exists purely so a future sidebar
 * doesn't have to duplicate that mapping. Not wired into any rendered
 * layout in this phase — no admin sidebar/shell is built yet.
 */
export function filterAdminNav(sections: AdminNavSection[], ctx: AuthzContext | null): AdminNavSection[] {
  return sections
    .map((section) => ({ ...section, items: filterNavItems(section.items, ctx) }))
    .filter((section) => section.items.length > 0);
}

function filterNavItems(items: AdminNavItem[], ctx: AuthzContext | null): AdminNavItem[] {
  return items
    .filter((item) => canAccessModule(ctx, item.moduleId))
    .map((item) => ({
      ...item,
      children: item.children ? filterNavItems(item.children, ctx) : undefined,
    }));
}
