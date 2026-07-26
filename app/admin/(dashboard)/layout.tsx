import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Dashboard shell for authenticated admin pages. The `requireAdmin()`
 * session guard and sidebar/topbar navigation land in a later phase, once
 * Supabase Auth is wired up — for now this only establishes the route-group
 * split from `(auth)` so the login page's layout never nests under this one.
 */
export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-obsidian text-heading">
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
