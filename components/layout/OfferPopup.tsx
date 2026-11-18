"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { isConversionPath } from "@/lib/layout";
import { getWhatsAppLink } from "@/lib/constants";
import { VCLASS_OFFER, isOfferActive } from "@/lib/offer";
import TrackedCta from "@/components/shared/TrackedCta";

const SEEN_KEY = "apex_vclass_offer_seen";

/**
 * V-Class offer popup.
 *  - Any page (except /booking and /quote): opens once per browser session
 *    shortly after the site loads.
 *  - The V-Class vehicle page: opens after 5 s and again every 20 s after
 *    each dismissal while the visitor stays on that page.
 * Purely a fixed overlay — nothing in the page layout changes. Rendered only
 * after hydration, so it adds no server HTML for crawlers.
 */
export default function OfferPopup({ whatsapp }: { whatsapp: string }) {
  const t = useTranslations("common.offerPopup");
  const pathname = usePathname();
  // Open state is tied to the route it was opened on, so navigating away
  // closes it without a synchronous setState inside an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const pathnameRef = useRef(pathname);
  const setOpen = useCallback((v: boolean) => setOpenFor(v ? pathnameRef.current : null), []);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onVehiclePage = pathname === `/fleet/${VCLASS_OFFER.vehicleSlug}`;
  const blocked = isConversionPath(pathname);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  // Schedule the (first) opening whenever the route changes.
  useEffect(() => {
    clearTimer();
    pathnameRef.current = pathname;
    // The layout is statically generated, so re-check the end date here.
    if (blocked || !isOfferActive()) return;

    if (onVehiclePage) {
      timer.current = setTimeout(() => setOpen(true), VCLASS_OFFER.vehiclePageFirstDelayMs);
    } else {
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
      } catch {}
      if (!seen) {
        timer.current = setTimeout(() => {
          setOpen(true);
          try {
            sessionStorage.setItem(SEEN_KEY, "1");
          } catch {}
        }, VCLASS_OFFER.siteOpenDelayMs);
      }
    }
    return clearTimer;
  }, [pathname, onVehiclePage, blocked, setOpen]);

  const dismiss = useCallback(() => {
    setOpen(false);
    clearTimer();
    if (onVehiclePage) {
      timer.current = setTimeout(() => setOpen(true), VCLASS_OFFER.vehiclePageRepeatMs);
    }
  }, [onVehiclePage, setOpen]);

  // Focus management + Escape + simple focus trap while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const f = dialogRef.current.querySelectorAll<HTMLElement>("a[href],button");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, dismiss]);

  if (!open) return null;

  const message = t("whatsappMessage", { code: VCLASS_OFFER.code, percent: VCLASS_OFFER.discountPercent });

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-popup-title"
        className="relative max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-2xl border border-gold/35 bg-charcoal shadow-2xl shadow-black/70"
      >
        <div className="relative aspect-[3/2] bg-black">
          <Image
            src={VCLASS_OFFER.image}
            alt={t("imageAlt")}
            fill
            sizes="420px"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal to-transparent" />
          <span className="absolute start-3 top-3 rounded-md bg-gold px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-obsidian">
            {t("badge")}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            aria-label={t("close")}
            className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-obsidian/70 text-heading transition-colors hover:bg-obsidian"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-2.5 px-6 pb-6 pt-1 text-center">
          <p className="text-[11px] font-medium uppercase tracking-widest text-champagne">{t("eyebrow")}</p>
          <p className="font-display text-6xl font-semibold leading-none text-gold">
            {VCLASS_OFFER.discountPercent}%
            <span className="ms-1.5 text-2xl tracking-wider text-gold-pale">{t("off")}</span>
          </p>
          <h2 id="offer-popup-title" className="font-display text-2xl font-semibold text-heading">
            {t("title")}
          </h2>
          <p className="text-sm text-smoke">{t("description", { percent: VCLASS_OFFER.discountPercent })}</p>

          <div className="mt-1 flex items-center justify-between gap-3 rounded-lg border border-dashed border-gold px-3.5 py-2 text-start">
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-[.16em] text-smoke">
                {t("codeLabel")}
              </span>
              <strong className="text-xl font-semibold tracking-[.14em] text-gold-pale" dir="ltr">
                {VCLASS_OFFER.code}
              </strong>
            </div>
            <CopyButton text={VCLASS_OFFER.code} label={t("copy")} doneLabel={t("copied")} />
          </div>

          <div className="mt-1 flex flex-col gap-2.5 sm:flex-row">
            <TrackedCta
              href={getWhatsAppLink(message, whatsapp)}
              channel="whatsapp"
              placement="offer_popup"
              item="mercedes-v-class"
              className="flex-1 rounded-lg bg-champagne px-3 py-3 text-center text-sm font-semibold text-obsidian transition-colors hover:bg-champagne-bright"
            >
              {t("whatsappCta")}
            </TrackedCta>
            {!onVehiclePage && (
              <Link
                href={`/fleet/${VCLASS_OFFER.vehicleSlug}`}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-gold px-3 py-3 text-center text-sm font-semibold text-gold-pale transition-colors hover:bg-gold/10"
              >
                {t("viewCta")}
              </Link>
            )}
          </div>
          <button type="button" onClick={dismiss} className="text-[13px] text-smoke hover:text-heading">
            {t("later")}
          </button>
          <p className="text-xs text-smoke/80">{t("terms")}</p>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
      className="rounded-md border border-white/10 bg-charcoal-light px-3 py-2 text-xs font-semibold text-heading hover:border-gold/50"
    >
      {done ? doneLabel : label}
    </button>
  );
}
