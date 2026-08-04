"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { getWhatsAppLink } from "@/lib/constants";

/** localStorage key marking that this visitor has already dismissed the
 *  notice — once set, it never shows again for them (any page, any tab). */
const DISMISSED_KEY = "apex-construction-notice-dismissed";

/** High-intent conversion pages — the notice never interrupts these, since
 *  a returning/paid-traffic visitor here is already mid-booking. */
const EXCLUDED_PATH_PATTERN = /^\/(booking|quote)(\/.*)?$/;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * One-time welcome notice — shown at most once per visitor (persisted via
 * localStorage), never on /booking or /quote, and fully keyboard-trapped
 * while open so Tab/Shift+Tab can't escape into the page behind it.
 * Renders nothing during SSR/first paint to avoid a hydration mismatch;
 * the open state is only ever set client-side.
 */
export default function ConstructionNoticeModal() {
  const t = useTranslations("common.constructionNotice");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (EXCLUDED_PATH_PATTERN.test(pathname)) return;
    try {
      if (window.localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      // localStorage unavailable (private browsing, etc.) — fall through
      // and show the notice; dismiss() below is wrapped the same way.
    }
    // react-hooks/set-state-in-effect is correct as a general rule, but this
    // is the case it can't express: the decision to open depends on
    // localStorage, which doesn't exist during SSR. Reading it in a useState
    // initializer would make the client's first render disagree with the
    // server's HTML — a hydration mismatch — so the read has to happen after
    // mount. The one resulting re-render is the intended cost.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    // Only ever evaluated once on mount — a same-session route change to
    // /booking or /quote shouldn't retroactively open/close an already
    // decided notice, so `pathname` is deliberately excluded from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    ctaRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        dismiss();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialogRef.current.contains(active)) {
        // Focus escaped the dialog (shouldn't normally happen since this
        // is the only keydown handler cycling Tab) — pull it back in.
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };

  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Ignore — worst case the notice reappears next visit.
    }
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

      <div
        ref={dialogRef}
        className="relative w-full max-w-md animate-fade-in-up rounded-2xl border border-gold/25 bg-obsidian p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] sm:p-10"
      >
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
