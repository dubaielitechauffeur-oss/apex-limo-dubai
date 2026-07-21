"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LANGUAGES, useLanguage } from "./LanguageContext";

interface LanguageSwitcherProps {
  /** "compact" drops the language code label, showing only the globe icon
   *  — for tight header space. Defaults to showing the code. */
  compact?: boolean;
  className?: string;
}

/**
 * Globe + language-code trigger that opens a small dropdown of the 3
 * supported languages. Selecting an option only updates shared context
 * state (see LanguageContext) — no translation happens yet, so every
 * page keeps rendering in English until real i18n is wired up here.
 */
export default function LanguageSwitcher({ compact = false, className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="flex items-center gap-1.5 text-[13px] uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:text-[#C8A35F]"
      >
        <Globe className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        {!compact ? <span>{language.code}</span> : null}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      <div
        role="listbox"
        className={`absolute right-0 top-full z-50 mt-3 w-44 origin-top-right rounded-md border border-[#1F1F1F] bg-black py-2 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] transition-all duration-150 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {LANGUAGES.map((option) => {
          const selected = option.code === language.code;
          return (
            <button
              key={option.code}
              role="option"
              aria-selected={selected}
              onClick={() => {
                setLanguage(option);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors duration-150 hover:bg-[#C8A35F]/10 ${
                selected ? "text-[#C8A35F]" : "text-[#BDBDBD]"
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
