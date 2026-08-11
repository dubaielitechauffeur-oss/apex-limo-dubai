"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

interface CountryOption {
  value?: string;
  label: string;
  divider?: boolean;
}

interface FlagIconProps {
  country?: string;
  label?: string;
  "aria-hidden"?: boolean;
}

interface CountrySelectDropdownProps {
  value?: string;
  options: CountryOption[];
  onChange: (value?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  iconComponent?: ComponentType<FlagIconProps>;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  "aria-label"?: string;
}

/**
 * Replaces react-phone-number-input's default country selector — an
 * invisible native `<select>` overlaid on the flag button — with a real,
 * app-styled searchable dropdown. The native select's popup is OS/browser
 * chrome that app CSS cannot restyle (always renders in the browser's
 * light-theme default, clashing with the site's dark theme, and offers no
 * search box), so it's replaced entirely rather than patched.
 */
export default function CountrySelectDropdown({
  value,
  options,
  onChange,
  onFocus,
  onBlur,
  iconComponent: Icon,
  disabled,
  readOnly,
  name,
  "aria-label": ariaLabel,
}: CountrySelectDropdownProps) {
  const t = useTranslations("forms.fields");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => !option.divider && option.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const selectable = options.filter((option) => !option.divider);
    if (!query.trim()) return selectable;
    const q = query.trim().toLowerCase();
    return selectable.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) setQuery("");
      return next;
    });
  }

  function selectOption(nextValue?: string) {
    onChange(nextValue);
    setOpen(false);
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const first = listRef.current?.querySelector<HTMLButtonElement>("button[data-option]");
      first?.focus();
      return;
    }
    if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      selectOption(filteredOptions[0].value);
    }
  }

  function handleOptionKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-option]");
    if (!buttons) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      buttons[index + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        searchRef.current?.focus();
      } else {
        buttons[index - 1]?.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className="PhoneInputCountry relative" ref={containerRef}>
      <button
        type="button"
        name={name}
        aria-label={ariaLabel ?? t("countrySelectorLabel")}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || readOnly}
        onClick={toggleOpen}
        onFocus={onFocus}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            onBlur?.();
          }
        }}
        className="flex h-full items-center gap-1.5 bg-transparent px-0 disabled:cursor-default"
      >
        {Icon ? <Icon country={value} label={selectedOption?.label} aria-hidden /> : null}
        <span className="PhoneInputCountrySelectArrow" />
      </button>

      {open ? (
        <div
          className="absolute start-0 top-full z-50 mt-2 w-72 max-w-[80vw] overflow-hidden rounded-lg border border-gold/20 bg-charcoal shadow-[0_20px_45px_-15px_rgba(0,0,0,0.6)]"
          role="listbox"
        >
          <div className="border-b border-gold/15 p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("searchCountry")}
              className="w-full rounded-md border border-gold/15 bg-obsidian px-3 py-2 text-sm text-ivory placeholder:text-smoke/50 focus:border-gold focus:outline-none"
            />
          </div>
          <ul ref={listRef} className="max-h-64 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-smoke">{t("noCountryFound")}</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li key={option.value ?? "ZZ"}>
                  <button
                    type="button"
                    data-option
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => selectOption(option.value)}
                    onKeyDown={(e) => handleOptionKeyDown(e, index)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm transition-colors duration-100 hover:bg-gold/10 focus:bg-gold/10 focus:outline-none ${
                      option.value === value ? "bg-gold/10 text-gold" : "text-ivory"
                    }`}
                  >
                    {Icon ? <Icon country={option.value} label={option.label} aria-hidden /> : null}
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
