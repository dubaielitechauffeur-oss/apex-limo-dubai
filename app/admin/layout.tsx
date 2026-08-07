import type { Metadata } from "next";
import "../globals.css";
import { displayFont, bodyFont } from "@/fonts/latin";
import { logoFont } from "@/fonts/logo";

/**
 * Root layout for the entire `/admin` tree — a sibling of `app/[locale]`,
 * not nested under it, so it needs its own `<html>`/`<body>` exactly like
 * `app/[locale]/layout.tsx` does (see ARCHITECTURE.md: admin is
 * code-split from the public bundle and intentionally outside next-intl's
 * locale prefixing — English-only by design for this internal tool).
 * No Header/Footer/GA/JSON-LD from the public site; `noindex` since none
 * of this should ever appear in search results.
 */
export const metadata: Metadata = {
  title: "Admin — Apex Limo & Chauffeur Dubai",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${displayFont.variable} ${bodyFont.variable} ${logoFont.variable}`}>
      <body className="min-h-screen bg-obsidian font-body text-ivory antialiased">{children}</body>
    </html>
  );
}
