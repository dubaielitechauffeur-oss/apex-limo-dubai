"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/shared/Container";
import MobileNav from "./MobileNav";
import {
  NAV_LINKS,
  PRIMARY_CTA,
  SITE,
  getPhoneLink,
} from "@/lib/constants";

/** Desktop nav order for the luxury header redesign — pulled from the
 *  shared NAV_LINKS source of truth so hrefs/children stay in sync. */
const HEADER_NAV_ORDER = ["Services", "Fleet", "About", "Locations", "Contact"];
const headerNavLinks = HEADER_NAV_ORDER.map((label) =>
  NAV_LINKS.find((link) => link.label === label)
).filter((link): link is (typeof NAV_LINKS)[number] => Boolean(link));

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile panel is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-obsidian transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_30px_rgba(0,0,0,0.55)]" : ""
      }`}
    >
      {/* Promotional bar */}
      <div className="flex h-9 items-center justify-center border-b border-gold/20 bg-obsidian px-4">
        <p className="truncate text-center text-[10px] uppercase tracking-[0.2em] text-gold/90 sm:text-[11px] sm:tracking-[0.25em]">
          Premium Chauffeur Service Across Dubai &amp; UAE
        </p>
      </div>

      {/* Main nav row */}
      <Container>
        <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* Logo — far left */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/images/brand/apex-logo.webp"
              alt={`${SITE.name} logo`}
              width={220}
              height={225}
              className="h-11 w-auto sm:h-12"
              priority
            />
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden justify-self-center lg:block">
            <ul className="flex items-center gap-10">
              {headerNavLinks.map((link) => (
                <li key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    className="font-body text-[13px] uppercase tracking-[0.12em] text-ivory/90 transition-colors duration-200 hover:text-gold"
                  >
                    {link.label}
                  </Link>

                  {"children" in link && link.children ? (
                    <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-3 group-hover:opacity-100">
                      <div className="rounded-sm border border-gold/20 bg-charcoal p-4 shadow-gold-lg">
                        <ul className="flex flex-col gap-3">
                          {link.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block text-sm text-smoke transition-colors hover:text-gold"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop CTA — far right */}
          <div className="hidden items-center gap-5 justify-self-end lg:flex">
            <a
              href={getPhoneLink()}
              className="text-[13px] tracking-wide text-ivory/80 transition-colors duration-200 hover:text-gold"
            >
              {SITE.phoneDisplay}
            </a>
            <Link
              href={PRIMARY_CTA.book.href}
              className="inline-flex items-center justify-center rounded-sm bg-gold px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep"
            >
              Book Chauffeur
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 flex-col items-center justify-center justify-self-end gap-1.5 lg:hidden"
          >
            <span className="h-px w-6 bg-gold" />
            <span className="h-px w-6 bg-gold" />
            <span className="h-px w-4 self-end bg-gold" />
          </button>
        </div>
      </Container>

      {/* Bottom hairline — thin gold border under the header */}
      <div className="h-px w-full bg-gold/30" />

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Close trigger rendered above the overlay when open */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="fixed right-5 top-6 z-50 flex h-10 w-10 items-center justify-center text-2xl text-gold lg:hidden"
        >
          ×
        </button>
      )}
    </header>
  );
}
