import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Shared shell for the login / forgot-password / reset-password screens —
 *  the obsidian + gold-hairline card treatment from DESIGN_SYSTEM.md's
 *  `Card tone="dark"`, reproduced directly rather than importing the public
 *  `Card`/`Container` components, which assume the `[locale]`-scoped
 *  `next-intl` Link and translation context this route tree deliberately
 *  doesn't have. */
export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/admin/login" className="font-logo text-2xl italic tracking-wide text-gold">
            APEX
          </Link>
          <p className="label-eyebrow mt-2">Limo &amp; Chauffeur Dubai — Admin</p>
        </div>
        <div className="border border-gold/20 bg-charcoal p-8 shadow-gold-lg">
          <h1 className="font-display text-2xl text-heading">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-smoke">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
