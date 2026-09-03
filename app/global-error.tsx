"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Last-resort boundary for errors thrown in a root layout itself — the one
 * place `app/[locale]/error.tsx` cannot reach, because that boundary renders
 * *inside* the layout that failed. This file replaces the whole document, so
 * it must supply its own `<html>`/`<body>`.
 *
 * Styling is inline rather than Tailwind classes on purpose: if the failure
 * happened while the layout was setting up (fonts, stylesheet link, providers),
 * no site CSS is guaranteed to have loaded, and a class-only fallback would
 * render as unstyled black-on-white text. These few rules keep the brand
 * intact with zero external dependencies.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[global error boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
          color: "#F5F5F5",
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#D4AF37",
              margin: "0 0 1rem",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Apex Limo &amp; Chauffeur Dubai
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 500, margin: "0 0 1rem", lineHeight: 1.2 }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#A7A7A7",
              margin: "0 0 2rem",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            We hit an unexpected problem loading this page. Please try again — if it keeps
            happening, call or WhatsApp us on +971 52 942 6152 and we&apos;ll take your booking
            directly.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "3.5rem",
              padding: "0 1.75rem",
              border: "none",
              borderRadius: "0.5rem",
              backgroundColor: "#C9A96E",
              color: "#1A1A1A",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
