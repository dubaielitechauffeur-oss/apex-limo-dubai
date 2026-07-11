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
  getWhatsAppLink,
} from "@/lib/constants";

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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-obsidian/95 backdrop-blur" : "bg-obsidian/70 backdrop-blur-sm"
      }`}
    >
      <Container>
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/images/brand/apex-logo.webp"
              alt={`${SITE.name} logo`}
              width={220}
              height={225}
              className="h-12 w-auto sm:h-14"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    className="font-body text-sm uppercase tracking-wide text-ivory/90 transition-colors duration-200 hover:text-gold"
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

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={getPhoneLink()}
              className="text-sm tracking-wide text-ivory/90 transition-colors hover:text-gold"
            >
              {SITE.phoneDisplay}
            </a>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              {PRIMARY_CTA.whatsapp.label}
            </a>
            <Link href={PRIMARY_CTA.book.href} className="btn-gold">
              {PRIMARY_CTA.book.label}
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          >
            <span className="h-px w-6 bg-gold" />
            <span className="h-px w-6 bg-gold" />
            <span className="h-px w-4 self-end bg-gold" />
          </button>
        </div>
      </Container>

      {/* Bottom hairline — thin gold route line under the header */}
      <div className="route-line opacity-60" />

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
