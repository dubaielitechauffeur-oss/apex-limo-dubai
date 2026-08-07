import { prisma } from "@/lib/db";
import { getAuthzContext, hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS, type Permission } from "@/lib/permissions/catalog";

export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  href: string;
  /** `false` when the signed-in user lacks the permission to view this
   *  count at all — the card renders as a locked/placeholder state rather
   *  than being silently omitted, so the dashboard's layout stays stable
   *  across roles. */
  visible: boolean;
}

/**
 * Real, DB-backed counts for the dashboard's summary cards — one Prisma
 * `count()` per resource, each independently gated on that resource's own
 * `:read` permission so a role only ever sees numbers it's authorized to
 * see (e.g. a fleet_manager gets the vehicle count but not the user count).
 * No module here has CRUD built yet beyond Users (Phase 5's scope), but the
 * counts themselves are real production data, not placeholders.
 */
export async function getDashboardStats(): Promise<DashboardStat[]> {
  const ctx = await getAuthzContext();
  const allowed = (permission: Permission) => isSuperAdmin(ctx) || hasPermission(ctx, permission);

  const specs: { id: string; label: string; href: string; permission: Permission; count: () => Promise<number> }[] = [
    {
      id: "vehicles",
      label: "Total Vehicles",
      href: "/admin/fleet/vehicles",
      permission: PERMISSIONS.FLEET_READ,
      count: () => prisma.vehicle.count({ where: { deletedAt: null } }),
    },
    {
      id: "bookings",
      label: "Total Bookings",
      href: "/admin/bookings",
      permission: PERMISSIONS.BOOKINGS_READ,
      count: () => prisma.booking.count({ where: { deletedAt: null } }),
    },
    {
      id: "quotes",
      label: "Pending Quotes",
      href: "/admin/quotes",
      permission: PERMISSIONS.QUOTES_READ,
      count: () => prisma.quote.count({ where: { deletedAt: null, status: "pending" } }),
    },
    {
      id: "blogs",
      label: "Published Blogs",
      href: "/admin/blog",
      permission: PERMISSIONS.BLOG_READ,
      count: () => prisma.blogPost.count({ where: { deletedAt: null, status: "published" } }),
    },
    {
      id: "services",
      label: "Active Services",
      href: "/admin/services",
      permission: PERMISSIONS.SERVICES_READ,
      count: () => prisma.service.count({ where: { deletedAt: null, status: "published" } }),
    },
    {
      id: "locations",
      label: "Active Locations",
      href: "/admin/locations",
      permission: PERMISSIONS.LOCATIONS_READ,
      count: () => prisma.location.count({ where: { deletedAt: null, status: "published" } }),
    },
    {
      id: "users",
      label: "Total Users",
      href: "/admin/users",
      permission: PERMISSIONS.USERS_READ,
      count: () => prisma.user.count({ where: { deletedAt: null } }),
    },
  ];

  return Promise.all(
    specs.map(async (spec) => {
      const visible = allowed(spec.permission);
      const value = visible ? await spec.count() : 0;
      return { id: spec.id, label: spec.label, href: spec.href, value, visible };
    })
  );
}
