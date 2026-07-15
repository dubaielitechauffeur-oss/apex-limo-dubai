"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface Language {
  code: "EN" | "AR" | "RU";
  label: string;
  nativeLabel: string;
  flag: string;
}

/**
 * UI-only language list for the header switcher. Selecting an option
 * updates `language` in context but does not (yet) translate any page
 * content — this is the seam a future i18n implementation plugs into.
 */
export const LANGUAGES: Language[] = [
  { code: "EN", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "AR", label: "Arabic", nativeLabel: "العربية", flag: "🇦🇪" },
  { code: "RU", label: "Russian", nativeLabel: "Русский", flag: "🇷🇺" },
];

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Shared selected-language state — kept in sync between the desktop
 *  header switcher and the mobile menu's copy of it. */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
