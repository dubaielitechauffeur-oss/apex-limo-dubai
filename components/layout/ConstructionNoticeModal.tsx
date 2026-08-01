"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { getWhatsAppLink } from "@/lib/constants";

/** Matches the fleet listing ("/fleet") and every vehicle detail page
 *  ("/fleet/[vehicle]") — locale-stripped, since usePathname() from
 *  i18n/navigation already excludes the locale segment. */
const FLEET_PATH_PATTERN = /^\/fleet(\/.*)?$/;

/**
 * Welcome / pricing notice — shown on every fresh page load (no
 * persistence, unlike a typical one-time dismissal), and re-shown
 * whenever the visitor navigates to the fleet listing or a vehicle
 * detail page, since that's where demo pricing is displayed. Renders
 * nothing during SSR/first paint to avoid a hydration mismatch; the
 * open state is only ever set client-side.
 */
export default function ConstructionNoticeModal() {
  const t = useTranslations("common.constructionNotice");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const previousPathname = useRef(pathname);

  // Every time the site loads (first visit, reload, or direct link), show it.
  useEffect(() => {
    setOpen(true);
  }, []);

  // Re-show it on client-side navigation into the fleet listing or any
  // vehicle detail page, even if it was already dismissed earlier.
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (FLEET_PATH_PATTERN.test(pathname)) {
      setOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    ctaRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="construction-notice-heading"
      aria-describedby="construction-notice-body"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <div
        aria-hidden="true"
        onClick={dismiss}
        className="absolute inset-0 animate-fade-in bg-obsidian/80 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md animate-fade-in-up rounded-2xl border border-gold/25 bg-obsidian p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] sm:p-10">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("closeAriaLabel")}
          className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-smoke transition-colors hover:bg-white/5 hover:text-gold"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
        </span>

        <span className="label-eyebrow mt-5 block">{t("eyebrow")}</span>
        <h2 id="construction-notice-heading" className="mt-3 font-display text-2xl text-heading sm:text-3xl">
          {t("heading")}
        </h2>
        <p id="construction-notice-body" className="mt-4 text-sm leading-relaxed text-smoke sm:text-base">
          {t("body")}
        </p>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-gold/30 bg-gold/[0.08] p-4 text-start">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
          <p className="text-xs leading-relaxed text-ivory sm:text-sm">
            {t.rich("priceNotice", {
              b: (chunks) => <strong className="font-semibold text-gold">{chunks}</strong>,
              whatsappLink: (chunks) => (
                <a
                  href={getWhatsAppLink(t("priceNoticeWhatsappMessage"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="font-semibold text-gold underline underline-offset-4 transition-colors hover:text-gold-pale"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>

        <button ref={ctaRef} type="button" onClick={dismiss} className="btn-gold mt-6 w-full">
          {t("cta")}
        </button>
      </div>
    </div>
  );
}
