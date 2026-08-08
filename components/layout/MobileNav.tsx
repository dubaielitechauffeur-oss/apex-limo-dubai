"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_METADATA } from "@/i18n/locale-metadata";
import type { Locale } from "@/i18n/routing";
import Ltr from "@/components/shared/Ltr";
import {
  NAV_LINKS,
  PRIMARY_CTA,
  getPhoneLink,
  getWhatsAppLink,
} from "@/lib/constants";
import type { SiteContact } from "@/lib/public/site-contact";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  contact: SiteContact;
}

/** Full-screen mobile navigation panel, shown when the header's menu button is tapped. */
export default function MobileNav({ open, onClose, contact }: MobileNavProps) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function selectLocale(nextLocale: Locale) {
    onClose();
    router.replace(pathname, { locale: nextLocale });
  }
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
      id="mobile-nav-panel"
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
                      {t(`nav.${link.key}`)}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenHref((current) => (current === link.href ? null : link.href))
                      }
                      aria-expanded={openHref === link.href}
                      aria-label={`${openHref === link.href ? t("mobileNav.collapse") : t("mobileNav.expand")} ${t(`nav.${link.key}`)} ${t("mobileNav.submenu")}`}
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
                    <ul className="flex flex-col gap-3 overflow-hidden ps-1">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="text-sm text-smoke transition-colors hover:text-gold"
                          >
                            {t(`nav.${link.key}Children.${child.key}`)}
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
                  {t(`nav.${link.key}`)}
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
            {t("cta.bookNow")}
          </Link>
          <a
            href={getWhatsAppLink(t("whatsappGenericMessage"), contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full"
          >
            {t("cta.whatsappUs")}
          </a>
          <a
            href={getPhoneLink(contact.phone)}
            className="mt-2 text-center text-sm tracking-wide text-smoke"
          >
            {t("mobileNav.orCall")} <Ltr>{contact.phoneDisplay}</Ltr>
          </a>
        </div>

        {/* Language — grid of flag + native-name toggles, mirrors the
            desktop header's dropdown options but laid out for touch. */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-smoke">
            {t("header.changeLanguage")}
          </p>
          <ul className="grid grid-cols-2 gap-3">
            {LOCALE_METADATA.map((option) => {
              const selected = option.code === locale;
              return (
                <li key={option.code}>
                  <button
                    type="button"
                    onClick={() => selectLocale(option.code)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors duration-150 ${
                      selected
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-white/10 text-smoke hover:border-white/20 hover:text-ivory"
                    }`}
                  >
                    <span aria-hidden="true">{option.flag}</span>
                    <span>{option.nativeLabel}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
