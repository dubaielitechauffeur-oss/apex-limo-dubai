"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_METADATA } from "@/i18n/locale-metadata";
import type { Locale } from "@/i18n/routing";

interface LanguageSwitcherProps {
  /** "compact" drops the language code label, showing only the globe icon
   *  — for tight header space. Defaults to showing the code. */
  compact?: boolean;
  className?: string;
}

/**
 * Globe + language-code trigger that opens a dropdown of the 6 supported
 * languages. Switching locale swaps only the locale segment of the current
 * URL (via next-intl's locale-aware router) and preserves the rest of the
 * path, so a visitor stays on the same page they were viewing.
 */
export default function LanguageSwitcher({ compact = false, className = "" }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common.header");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = LOCALE_METADATA.find((l) => l.code === locale) ?? LOCALE_METADATA[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectLocale(nextLocale: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("changeLanguage")}
        className="flex items-center gap-1.5 text-[13px] uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:text-champagne"
      >
        <Globe className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        {!compact ? <span>{current.code}</span> : null}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      <div
        role="listbox"
        className={`absolute end-0 top-full z-50 mt-3 w-44 origin-top-right rtl:origin-top-left rounded-md border border-charcoal bg-black py-2 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] transition-all duration-150 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {LOCALE_METADATA.map((option) => {
          const selected = option.code === current.code;
          return (
            <button
              key={option.code}
              role="option"
              aria-selected={selected}
              onClick={() => selectLocale(option.code)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-start text-sm transition-colors duration-150 hover:bg-champagne/10 ${
                selected ? "text-champagne" : "text-smoke"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true">{option.flag}</span>
                <span>{option.nativeLabel}</span>
              </span>
              {selected ? <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
