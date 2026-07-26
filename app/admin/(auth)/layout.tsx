import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Minimal centered-card shell for unauthenticated admin pages (login only, for now). */
export default function AdminAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4">
      {children}
    </div>
  );
}
