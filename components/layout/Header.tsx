"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar } from "lucide-react";
import Container from "@/components/shared/Container";
import MobileNav from "./MobileNav";
import LanguageSwitcher from "./LanguageSwitcher";
import ApexLogo from "./ApexLogo";
import {
  NAV_LINKS,
  PRIMARY_CTA,
  SITE,
  getPhoneLink,
} from "@/lib/constants";

/** Desktop nav order for the luxury header redesign — pulled from the
 *  shared NAV_LINKS source of truth so hrefs/children stay in sync. */
const HEADER_NAV_ORDER = ["Home", "Fleet", "Services", "Locations", "About", "FAQs", "Blog", "Contact"];
const headerNavLinks = HEADER_NAV_ORDER.map((label) =>
  NAV_LINKS.find((link) => link.label === label)
).filter((link): link is (typeof NAV_LINKS)[number] => Boolean(link));

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
      className={`fixed inset-x-0 top-0 z-50 border-b border-[#1F1F1F] bg-black transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_30px_rgba(0,0,0,0.55)]" : ""
      }`}
    >
      {/* Promotional bar */}
      <div className="flex h-9 items-center justify-center border-b border-[#1F1F1F] bg-black px-4">
        <p className="truncate text-center text-[10px] uppercase tracking-[0.2em] text-white sm:text-[11px] sm:tracking-[0.25em]">
          Premium Chauffeur Service Across Dubai &amp; UAE
        </p>
      </div>

      {/* Main nav row */}
      <Container>
        <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* Logo — far left */}
          <Link href="/" className="flex shrink-0 items-center" aria-label={SITE.name}>
            <ApexLogo size="sm" />
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden justify-self-center lg:block">
            <ul className="flex items-center gap-10">
              {headerNavLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                <li key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    className={`font-body text-[13px] uppercase tracking-[0.12em] transition-colors duration-200 hover:text-[#C8A35F] ${
                      isActive ? "text-[#C8A35F]" : "text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px w-full bg-[#C8A35F] transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />

                  {"children" in link && link.children ? (
                    <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-3 group-hover:opacity-100">
                      <div className="rounded-sm border border-[#1F1F1F] bg-black p-4 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)]">
                        <ul className="flex flex-col gap-3">
                          {link.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block text-sm text-[#BDBDBD] transition-colors hover:text-[#C8A35F]"
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
                );
              })}
            </ul>
          </nav>

          {/* Desktop CTA — far right */}
          <div className="hidden items-center gap-5 justify-self-end lg:flex">
            <a
              href={getPhoneLink()}
              className="text-[13px] tracking-wide text-[#BDBDBD] transition-colors duration-200 hover:text-[#C8A35F]"
            >
              {SITE.phoneDisplay}
            </a>
            <Link
              href={PRIMARY_CTA.book.href}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C8A35F] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-black transition-colors duration-200 hover:bg-[#B8935A]"
            >
              <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
              Book Now
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Mobile: compact language switcher + menu trigger */}
          <div className="flex items-center gap-3 justify-self-end lg:hidden">
            <LanguageSwitcher compact className="flex h-10 items-center" />
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5"
            >
              <span className="h-px w-6 bg-white" />
              <span className="h-px w-6 bg-white" />
              <span className="h-px w-6 bg-white" />
            </button>
          </div>
        </div>
      </Container>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Close trigger rendered above the overlay when open */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="fixed right-5 top-6 z-50 flex h-10 w-10 items-center justify-center text-2xl text-white lg:hidden"
        >
          ×
        </button>
      )}
    </header>
  );
}
