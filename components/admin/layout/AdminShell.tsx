"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import type { AdminNavSection } from "@/config/admin";
import { SidebarNav } from "./SidebarNav";
import { AdminHeader } from "./AdminHeader";
import { ToastProvider } from "@/components/admin/ui/Toast";

/**
 * The full admin dashboard chrome: fixed desktop sidebar, slide-over mobile
 * drawer (both rendering the same `SidebarNav`), sticky header, and a
 * scrollable content region. `nav` arrives already permission-filtered by
 * the server layout (`filterAdminNav`) — this component only handles
 * presentation/state, never authorization.
 */
export function AdminShell({
  nav,
  name,
  email,
  roleName,
  children,
}: {
  nav: AdminNavSection[];
  name: string;
  email: string;
  roleName: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <SidebarBrand />
        <SidebarNav sections={nav} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <SidebarBrand compact />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav sections={nav} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col lg:pl-64">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} name={name} email={email} roleName={roleName} />
        <ToastProvider>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </ToastProvider>
      </div>
    </div>
  );
}

function SidebarBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/admin"
      className={`flex items-center border-b border-gray-200 px-5 font-semibold tracking-tight text-gray-900 ${
        compact ? "h-auto py-0" : "h-16"
      }`}
    >
      Apex Admin
    </Link>
  );
}
