import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PageSeoListItem } from "@/lib/cms/page-seo";
import type { PageSeoGroup } from "@/lib/seo-pages/catalog";

const GROUP_ORDER: PageSeoGroup[] = ["Main pages", "Fleet categories", "Legal pages", "Shared sections & templates"];

/** Pages whose SEO lives on a CMS record, edited in that record's own form. */
const RECORD_MODULES = [
  { label: "Services", href: "/admin/services", detail: "each /services/… page" },
  { label: "Locations", href: "/admin/locations", detail: "each /locations/… page" },
  { label: "Fleet vehicles", href: "/admin/fleet/vehicles", detail: "each vehicle page" },
  { label: "Blog posts", href: "/admin/blog", detail: "each /blog/… article" },
];

export function PageSeoList({ items }: { items: PageSeoListItem[] }) {
  return (
    <div className="mt-4 space-y-6">
      {GROUP_ORDER.map((group) => {
        const groupItems = items.filter((item) => item.entry.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{group}</h3>
            <ul className="mt-2 divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
              {groupItems.map(({ entry, customisedCount }) => (
                <li key={entry.page}>
                  <Link
                    href={`/admin/seo/pages/${entry.page}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900">{entry.label}</span>
                      <span className="block truncate text-xs text-gray-500">
                        {entry.publicPath ?? "Used on several pages"}
                        {" · "}
                        {entry.meta ? "meta, " : ""}
                        {entry.h1 ? "H1, " : ""}
                        {entry.headings.length} heading{entry.headings.length === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          customisedCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {customisedCount > 0 ? `${customisedCount} customised` : "Default"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Service, location, vehicle and blog pages</h3>
        <p className="mt-1 text-sm text-gray-500">
          These are edited on the item itself — open one and scroll to its SEO section for meta title, meta
          description, H1 and section headings.
        </p>
        <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {RECORD_MODULES.map((module) => (
            <li key={module.href}>
              <Link
                href={module.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <span>
                  <span className="block text-sm font-medium text-gray-900">{module.label}</span>
                  <span className="block text-xs text-gray-500">{module.detail}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
