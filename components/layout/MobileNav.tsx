"use client";

import { useState } from "react";
import Link from "next/link";
import {
  NAV_LINKS,
  PRIMARY_CTA,
  SITE,
  getPhoneLink,
  getWhatsAppLink,
} from "@/lib/constants";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen mobile navigation panel, shown when the header's menu button is tapped. */
export default function MobileNav({ open, onClose }: MobileNavProps) {
  // Tracks which single nav item's submenu is expanded (accordion-style).
  // Kept by href rather than a per-item boolean so Services and Locations
  // each expand/collapse independently via their own "+" toggle, while the
  // label itself stays a plain link straight to that section's main page.
  const [openHref, setOpenHref] = useState<string | null>(null);

  return (
    // `inert` removes the panel's links/buttons from keyboard tab order and
    // interaction when closed (not just visually hidden via translate-x) —
    // aria-hidden alone doesn't affect tab order, so it's kept alongside
    // `inert` for broader assistive-tech/browser support.
    <div
      className={`fixed inset-0 z-40 flex flex-col bg-obsidian transition-transform duration-300 ease-in-out lg:hidden ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
      inert={!open}
    >
      <nav className="flex flex-1 flex-col overflow-y-auto px-6 pb-10 pt-28">
        <ul className="flex flex-col divide-y divide-white/10">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="py-4">
              {"children" in link && link.children ? (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="font-display text-2xl text-ivory transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenHref((current) => (current === link.href ? null : link.href))
                      }
                      aria-expanded={openHref === link.href}
                      aria-label={`${openHref === link.href ? "Collapse" : "Expand"} ${link.label} submenu`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center text-2xl text-gold"
                    >
                      <span
                        className={`inline-block transition-transform duration-200 ${
                          openHref === link.href ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                  </div>
                  <div
                    className={`grid overflow-hidden transition-all duration-300 ${
                      openHref === link.href
                        ? "mt-3 grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                    aria-hidden={openHref !== link.href}
                    inert={openHref !== link.href}
                  >
                    <ul className="flex flex-col gap-3 overflow-hidden pl-1">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="text-sm text-smoke transition-colors hover:text-gold"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="font-display text-2xl text-ivory transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={PRIMARY_CTA.book.href}
            onClick={onClose}
            className="btn-gold w-full"
          >
            {PRIMARY_CTA.book.label}
          </Link>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full"
          >
            {PRIMARY_CTA.whatsapp.label}
          </a>
          <a
            href={getPhoneLink()}
            className="mt-2 text-center text-sm tracking-wide text-smoke"
          >
            Or call {SITE.phoneDisplay}
          </a>
        </div>
      </nav>
    </div>
  );
}
