"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { ALL_FAQS, FAQ_CATEGORIES, type FaqHubEntry } from "@/data/faqHub";

const CHIPS = [
  { key: "all", chipLabel: "All" },
  ...FAQ_CATEGORIES.filter((c) => c.chipLabel).map((c) => ({ key: c.key, chipLabel: c.chipLabel! })),
];

const SUGGESTION_LIMIT = 8;
const HIGHLIGHT_DURATION_MS = 1800;

export default function FaqHubClient() {
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return ALL_FAQS.filter((faq) => faq.question.toLowerCase().includes(trimmed)).slice(0, SUGGESTION_LIMIT);
  }, [query]);

  const visibleFaqs = useMemo(() => {
    if (activeCategory === "all") return ALL_FAQS;
    return ALL_FAQS.filter((faq) => faq.category === activeCategory);
  }, [activeCategory]);

  const groupedFaqs = useMemo(() => {
    const groups = new Map<string, FaqHubEntry[]>();
    for (const faq of visibleFaqs) {
      const list = groups.get(faq.category) ?? [];
      list.push(faq);
      groups.set(faq.category, list);
    }
    return groups;
  }, [visibleFaqs]);

  function toggleFaq(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function goToFaq(entry: FaqHubEntry) {
    setQuery("");
    setSuggestionsOpen(false);
    setActiveCategory("all");
    setExpandedIds((prev) => new Set(prev).add(entry.id));
    setHighlightedId(entry.id);

    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(`faq-${entry.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    });

    window.setTimeout(() => {
      setHighlightedId((current) => (current === entry.id ? null : current));
    }, HIGHLIGHT_DURATION_MS);
  }

  return (
    <>
      {/* Search bar */}
      <div ref={searchWrapRef} className="relative mx-auto max-w-2xl">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999999]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setSuggestionsOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSuggestionsOpen(false);
              if (event.key === "Enter" && suggestions.length > 0) {
                event.preventDefault();
                goToFaq(suggestions[0]);
              }
            }}
            placeholder="What would you like to know?"
            aria-label="Search frequently asked questions"
            className="w-full rounded-full border border-[rgba(201,161,74,0.25)] bg-[#151515] py-5 pl-14 pr-6 text-base text-white placeholder:text-[#999999] outline-none transition-shadow duration-200 focus:border-[#C9A14A] focus:shadow-[0_0_0_4px_rgba(201,161,74,0.18)]"
          />
        </div>

        {suggestionsOpen && query.trim() ? (
          <div className="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl border border-[rgba(201,161,74,0.2)] bg-[#151515] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
            {suggestions.length > 0 ? (
              suggestions.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => goToFaq(entry)}
                  className="block w-full border-b border-white/5 px-6 py-4 text-left text-sm text-white transition-colors duration-150 last:border-0 hover:bg-[rgba(201,161,74,0.08)]"
                >
                  {entry.question}
                </button>
              ))
            ) : (
              <p className="px-6 py-4 text-sm text-[#999999]">No matching questions found.</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Category filter chips */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {CHIPS.map((chip) => {
          const isActive = activeCategory === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setActiveCategory(chip.key)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${
                isActive
                  ? "bg-[#C9A14A] text-black"
                  : "border border-[rgba(201,161,74,0.2)] bg-[#111111] text-[#B8B8B8] hover:bg-[rgba(201,161,74,0.08)]"
              }`}
            >
              {chip.chipLabel}
            </button>
          );
        })}
      </div>

      {/* FAQ list, grouped by category */}
      <div className="mt-16 space-y-16">
        {FAQ_CATEGORIES.filter((cat) => groupedFaqs.has(cat.key)).map((cat) => (
          <div key={cat.key}>
            {activeCategory === "all" ? (
              <h2 className="font-display text-2xl text-white sm:text-3xl">{cat.label}</h2>
            ) : null}
            <div className={activeCategory === "all" ? "mt-6 space-y-3" : "space-y-3"}>
              {(groupedFaqs.get(cat.key) ?? []).map((entry) => {
                const isOpen = expandedIds.has(entry.id);
                const isHighlighted = highlightedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    id={`faq-${entry.id}`}
                    className={`scroll-mt-28 rounded-xl border border-[rgba(201,161,74,0.15)] transition-all duration-300 ${
                      isOpen ? "bg-[#171717]" : "bg-[#121212]"
                    } ${isHighlighted ? "border-[#C9A14A] shadow-[0_0_0_1px_rgba(201,161,74,0.5),0_0_35px_rgba(201,161,74,0.3)]" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(entry.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                    >
                      <span className="font-display text-base text-white sm:text-lg">{entry.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-[#C9A14A] transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </button>
                    <div
                      className={`grid overflow-hidden transition-all duration-300 ${
                        isOpen ? "grid-rows-[1fr] px-6 pb-5 opacity-100" : "grid-rows-[0fr] px-6 opacity-0"
                      }`}
                    >
                      <p className="overflow-hidden text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
                        {entry.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
