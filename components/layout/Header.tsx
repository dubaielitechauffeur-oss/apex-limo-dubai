"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import MobileNav from "./MobileNav";
import LanguageSwitcher from "./LanguageSwitcher";
import ApexLogo from "./ApexLogo";
import Ltr from "@/components/shared/Ltr";
import {
  NAV_LINKS,
  PRIMARY_CTA,
  SITE,
  getPhoneLink,
} from "@/lib/constants";
import { isConversionPath } from "@/lib/layout";
import type { SiteContact } from "@/lib/public/site-contact";

/** Desktop nav order for the luxury header redesign — pulled from the
 *  shared NAV_LINKS source of truth so hrefs/children stay in sync. */
const HEADER_NAV_ORDER = ["home", "fleet", "services", "locations", "about", "faqs", "blog", "contact"];
const headerNavLinks = HEADER_NAV_ORDER.map((key) =>
  NAV_LINKS.find((link) => link.key === key)
).filter((link): link is (typeof NAV_LINKS)[number] => Boolean(link));

export default function Header({ contact }: { contact: SiteContact }) {
  const t = useTranslations("common");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const showPromoBar = !isConversionPath(pathname);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
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
    // `sticky` rather than `fixed`: a fixed header sits outside normal flow,
    // which previously forced <main> to carry a hardcoded `pt-[117px]`
    // matching this header's exact height — two numbers with nothing keeping
    // them in sync, so any header height change silently clipped page
    // content. Sticky keeps the identical pinned-to-top behaviour while
    // staying in flow, so the header reserves its own space and the offset
    // problem disappears entirely (including when the promo bar below is
    // conditionally hidden).
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isHome && !scrolled
          ? "border-b border-white/10 bg-transparent shadow-none"
          : `border-b border-charcoal bg-black ${scrolled ? "shadow-[0_8px_30px_rgba(0,0,0,0.55)]" : ""}`
      }`}
    >
      {/* Promotional bar — hidden on conversion routes, see lib/layout.ts */}
      {showPromoBar ? (
        <div className={`flex h-9 items-center justify-center border-b px-4 transition-all duration-500 ${
          isHome && !scrolled ? "border-white/10 bg-transparent" : "border-charcoal bg-black"
        }`}>
          <p className="truncate text-center text-[10px] uppercase tracking-[0.2em] text-white sm:text-[11px] sm:tracking-[0.25em]">
            {t("header.promoBar")}
          </p>
        </div>
      ) : null}

      {/* Main nav row — a header-scoped wrapper mirrors Container's padding
          at sm/md so tablet is untouched, but uses tighter lg+ padding to
          reclaim width for the single-row desktop nav (see Container.tsx
          for the shared default, which every other section still uses). */}
      <div className="mx-auto w-full max-w-8xl px-5 sm:px-8 lg:px-5">
        <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center gap-2 lg:gap-3">
          {/* Logo — far left */}
          <Link href="/" className="flex shrink-0 items-center" aria-label={SITE.name}>
            <ApexLogo size="sm" />
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden justify-self-center lg:block">
            <ul className="flex items-center gap-3 xl:gap-6">
              {headerNavLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                <li key={link.href} className="group relative shrink-0">
                  <Link
                    href={link.href}
                    className={`font-body text-[13px] uppercase tracking-[0.02em] whitespace-nowrap transition-colors duration-200 hover:text-champagne xl:tracking-[0.08em] ${
                      isActive ? "text-champagne" : "text-white"
                    }`}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                  <span
                    className={`absolute -bottom-1.5 start-0 h-px w-full bg-champagne transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />

                  {"children" in link && link.children ? (
                    <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-3 group-hover:opacity-100">
                      <div className="rounded-sm border border-charcoal bg-black p-4 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)]">
                        <ul className="flex flex-col gap-3">
                          {link.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block text-sm text-smoke transition-colors hover:text-champagne"
                              >
                                {t(`nav.${link.key}Children.${child.key}`)}
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
          <div className="hidden items-center gap-2.5 justify-self-end lg:flex xl:gap-4">
            <a
              href={getPhoneLink(contact.phone)}
              className="shrink-0 whitespace-nowrap text-[13px] text-smoke transition-colors duration-200 hover:text-champagne"
            >
              <Ltr>{contact.phoneDisplay}</Ltr>
            </a>
            <Link
              href={PRIMARY_CTA.book.href}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-champagne px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-black transition-colors duration-200 hover:bg-champagne-dark xl:px-6 xl:py-3 xl:tracking-[0.12em]"
            >
              <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {t("cta.bookNow")}
            </Link>
            <LanguageSwitcher compact className="shrink-0" />
          </div>

          {/* Mobile: compact language switcher + menu trigger */}
          <div className="flex items-center gap-3 justify-self-end lg:hidden">
            <LanguageSwitcher compact className="flex h-10 items-center" />
            <button
              onClick={() => setMobileOpen(true)}
              aria-label={t("header.openMenu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5"
            >
              <span className="h-px w-6 bg-white" />
              <span className="h-px w-6 bg-white" />
              <span className="h-px w-6 bg-white" />
            </button>
          </div>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} contact={contact} />

      {/* Close trigger rendered above the overlay when open */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          aria-label={t("header.closeMenu")}
          className="fixed end-5 top-6 z-50 flex h-10 w-10 items-center justify-center text-2xl text-white lg:hidden"
        >
          ×
        </button>
      )}
    </header>
  );
}
