"use client";

import { useState } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { LOCALE_LABELS, type LocalizedText } from "@/lib/cms/localized";
import { ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";

/**
 * One SEO text field across all six locales, built for the SEO screens:
 *
 *  - English is always visible; the other five locales sit behind a disclosure
 *    so a page with twenty headings does not become 120 inputs on screen.
 *  - `defaults` shows what the page renders when the field is left blank, as
 *    the placeholder — so "empty" visibly means "keep the current text".
 *  - `limit` adds a live character counter that turns amber past the limit.
 *    It never blocks saving: the limit is what a search result shows, not a
 *    validation rule.
 *
 * Inputs are named `<prefix>_<locale>`, the convention `readSeoField()` reads.
 */
export function SeoTextField({
  prefix,
  label,
  badge,
  value,
  defaults,
  limit,
  multiline,
  hint,
}: {
  prefix: string;
  label: string;
  /** Small tag shown before the label, e.g. "H2". */
  badge?: string;
  value?: Partial<LocalizedText>;
  defaults?: Partial<Record<Locale, string>>;
  limit?: number;
  multiline?: boolean;
  hint?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(routing.locales.map((locale) => [locale, value?.[locale] ?? ""]))
  );

  const otherLocales = routing.locales.filter((locale) => locale !== routing.defaultLocale);
  const filledOthers = otherLocales.filter((locale) => values[locale]?.trim()).length;

  const renderInput = (locale: Locale) => {
    const id = `${prefix}_${locale}`;
    const current = values[locale] ?? "";
    const over = limit !== undefined && current.length > limit;
    const shared = {
      id,
      name: id,
      dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const),
      value: current,
      placeholder: defaults?.[locale] ?? "",
      className: ADMIN_INPUT_CLASSES,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((prev) => ({ ...prev, [locale]: event.target.value })),
    };
    return (
      <div key={locale}>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={id} className="block text-xs font-medium text-gray-600">
            {LOCALE_LABELS[locale]}
          </label>
          {limit !== undefined ? (
            <span className={`text-xs tabular-nums ${over ? "font-semibold text-amber-600" : "text-gray-400"}`}>
              {current.length}/{limit}
            </span>
          ) : null}
        </div>
        <div className="mt-1">{multiline ? <textarea rows={3} {...shared} /> : <input type="text" {...shared} />}</div>
        {over ? (
          <p className="mt-1 text-xs text-amber-600">
            Longer than {limit} characters — search results will cut it off.
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {badge ? (
          <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        ) : null}
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
      </div>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}

      <div className="mt-2">{renderInput(routing.defaultLocale)}</div>

      <details className="mt-2">
        <summary className="cursor-pointer select-none text-xs font-medium text-gray-500 hover:text-gray-800">
          Other languages{filledOthers > 0 ? ` (${filledOthers} filled)` : ""}
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{otherLocales.map(renderInput)}</div>
      </details>
    </div>
  );
}
