"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { AdminNavSection } from "@/config/admin";
import { AdminNavIcon } from "@/components/admin/ui/Icon";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Pure nav-list renderer shared by the desktop sidebar and the mobile
 *  drawer — both wrap this same component so active-state logic and markup
 *  never drift between the two breakpoints. `sections` has already been
 *  filtered server-side by `filterAdminNav()`; this component does not
 *  re-check permissions (see PermissionGate.tsx's doc comment — nav
 *  visibility is UI convenience only, never the real guard). */
export function SidebarNav({ sections, onNavigate }: { sections: AdminNavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.heading}>
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{section.heading}</h3>
          <ul className="mt-2 space-y-0.5">
            {section.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(pathname, item.href)
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <AdminNavIcon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
                {item.children && item.children.length > 0 ? (
                  <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 pl-3">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          onClick={onNavigate}
                          aria-current={isActive(pathname, child.href) ? "page" : undefined}
                          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                            isActive(pathname, child.href)
                              ? "font-medium text-gray-900"
                              : "text-gray-500 hover:text-gray-900"
                          }`}
                        >
                          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
