export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  moduleId: string;
  children?: AdminNavItem[];
}

export interface AdminNavSection {
  heading: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    heading: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/admin",
        icon: "LayoutDashboard",
        moduleId: "admin",
      },
    ],
  },
  {
    heading: "Operations",
    items: [
      {
        id: "bookings",
        label: "Bookings",
        href: "/admin/bookings",
        icon: "CalendarCheck",
        moduleId: "bookings",
      },
      {
        id: "quotes",
        label: "Quotes",
        href: "/admin/quotes",
        icon: "MessageSquareQuote",
        moduleId: "quotes",
      },
      {
        id: "contacts",
        label: "Contacts",
        href: "/admin/contacts",
        icon: "Mail",
        moduleId: "contacts",
      },
    ],
  },
  {
    heading: "Content",
    items: [
      {
        id: "homepage",
        label: "Homepage",
        href: "/admin/homepage",
        icon: "Home",
        moduleId: "homepage",
      },
      {
        id: "fleet",
        label: "Fleet",
        href: "/admin/fleet",
        icon: "Car",
        moduleId: "fleet",
        children: [
          {
            id: "fleet-vehicles",
            label: "Vehicles",
            href: "/admin/fleet/vehicles",
            icon: "Car",
            moduleId: "fleet",
          },
          {
            id: "fleet-categories",
            label: "Categories",
            href: "/admin/fleet/categories",
            icon: "FolderOpen",
            moduleId: "fleet",
          },
        ],
      },
      {
        id: "pricing",
        label: "Pricing",
        href: "/admin/pricing",
        icon: "DollarSign",
        moduleId: "pricing",
      },
      {
        id: "services",
        label: "Services",
        href: "/admin/services",
        icon: "Briefcase",
        moduleId: "services",
      },
      {
        id: "locations",
        label: "Locations",
        href: "/admin/locations",
        icon: "MapPin",
        moduleId: "locations",
      },
      {
        id: "blog",
        label: "Blog",
        href: "/admin/blog",
        icon: "FileText",
        moduleId: "blog",
      },
      {
        id: "faq",
        label: "FAQs",
        href: "/admin/faq",
        icon: "HelpCircle",
        moduleId: "faq",
      },
      {
        id: "media",
        label: "Media Library",
        href: "/admin/media",
        icon: "Image",
        moduleId: "media",
      },
    ],
  },
  {
    heading: "Configuration",
    items: [
      {
        id: "seo",
        label: "SEO Manager",
        href: "/admin/seo",
        icon: "Search",
        moduleId: "seo",
      },
      {
        id: "translations",
        label: "Translations",
        href: "/admin/translations",
        icon: "Languages",
        moduleId: "translations",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/admin/settings",
        icon: "Settings",
        moduleId: "settings",
      },
    ],
  },
  {
    heading: "Administration",
    items: [
      {
        id: "users",
        label: "Users & Roles",
        href: "/admin/users",
        icon: "Users",
        moduleId: "users",
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/admin/analytics",
        icon: "BarChart3",
        moduleId: "analytics",
      },
      {
        id: "audit",
        label: "Audit Logs",
        href: "/admin/audit",
        icon: "ScrollText",
        moduleId: "audit",
      },
    ],
  },
];
