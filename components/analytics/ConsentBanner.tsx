"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { CONSENT_STORAGE_KEY, type ConsentDecision } from "@/lib/consent";

declare global {
  interface Window {
    // gtag is injected by @next/third-parties' <GoogleAnalytics>. Typed loosely
    // on purpose: this file only ever calls the `consent` command.
    gtag?: (...args: unknown[]) => void;
  }
}

/** Pushes a Consent Mode v2 update, so gtag switches storage on or off live. */
function applyConsent(decision: ConsentDecision) {
  window.gtag?.("consent", "update", {
    analytics_storage: decision,
    // This site runs no advertising tags today. Declaring them explicitly
    // anyway is what Consent Mode v2 expects, and it means adding Google Ads
    // later inherits the visitor's answer instead of defaulting to granted.
    ad_storage: decision,
    ad_user_data: decision,
    ad_personalization: decision,
  });
}

// ── Stored decision, read as an external store ───────────────────────────────
//
// `localStorage` is browser-only state that React does not own, which is
// exactly what `useSyncExternalStore` exists for. The obvious alternative —
// an effect that calls `setState` after mount — is what the
// `react-hooks/set-state-in-effect` lint rule forbids, and rightly: it renders
// once with the wrong answer and then re-renders, which for a banner means a
// visible flash for every returning visitor who already decided.
//
// `getServerSnapshot` returns null so the server and the first client render
// agree (nothing shown), then the store settles synchronously before paint.

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keep multiple tabs in sync: answering in one should not leave the banner
  // sitting in another.
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function emitChange() {
  for (const listener of listeners) listener();
}

function getSnapshot(): ConsentDecision | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Private mode or blocked storage. Treat as "no decision recorded" and ask
    // again — never assume consent that was not given.
    return null;
  }
}

/** Server render, and the first client render, agree on "unknown". */
function getServerSnapshot(): ConsentDecision | null {
  return null;
}

/**
 * Analytics consent prompt for visitors in jurisdictions that require one.
 *
 * Pairs with the Consent Mode v2 defaults emitted server-side in
 * `components/analytics/Analytics.tsx`: gtag boots with every storage type
 * DENIED, so no analytics cookie exists until someone accepts here. Declining
 * is a real choice that persists, not a dismissal that re-prompts.
 *
 * Rendered only when `required` is true — visitors outside those jurisdictions
 * never see a banner, and their consent defaults to granted at the gtag layer.
 */
export default function ConsentBanner({ required }: { required: boolean }) {
  const t = useTranslations("common.consent");
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Replay a previously stored decision into gtag on load. This is a genuine
  // side effect on an external system (the tag), not derived state.
  useEffect(() => {
    if (required && stored) applyConsent(stored);
  }, [required, stored]);

  const decide = useCallback((decision: ConsentDecision) => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, decision);
    } catch {
      // Storage unavailable — the decision still applies to this page view.
    }
    applyConsent(decision);
    emitChange();
  }, []);

  if (!required || stored) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-gold/25 bg-obsidian/98 px-5 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] backdrop-blur sm:px-8"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="consent-title" className="font-display text-base text-heading">
            {t("title")}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-smoke">{t("body")}</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="rounded-lg border border-ivory/35 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="rounded-lg bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-obsidian transition-colors hover:bg-gold-deep"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
