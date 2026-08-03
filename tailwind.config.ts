import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand palette
        obsidian: {
          DEFAULT: "#0A0A0A", // primary background
          light: "#141414",
        },
        charcoal: {
          DEFAULT: "#18181B", // surface / card background
          light: "#232326",
        },
        ink: "#111111", // booking CTA panel background
        linen: "#FAF8F3", // fleet showcase section background
        pearl: "#F5F2EB", // testimonials section background
        gold: {
          DEFAULT: "#D4AF37", // primary accent
          deep: "#A8842C", // hover / active state, and accent text/icons on light backgrounds
          pale: "#E9D68A", // subtle highlight, borders
        },
        ivory: {
          DEFAULT: "#FFFFFF",
          off: "#F6F4EF", // light-section background
        },
        smoke: "#A7A7A7", // paragraph text on dark backgrounds
        graphite: "#57534E", // muted text on light backgrounds
        heading: "#F5F5F5", // heading text on dark backgrounds
        champagne: {
          DEFAULT: "#C9A96E", // primary button background
          bright: "#D3B988", // primary button hover (lighter — used on light-section CTAs)
          dark: "#B8935A", // primary button hover (darker — used on the black header's CTA)
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "Arial Narrow", "sans-serif"],
      },
      letterSpacing: {
        widest: ".24em",
      },
      backgroundImage: {
        "route-line":
          "linear-gradient(90deg, transparent 0%, #D4AF37 15%, #D4AF37 85%, transparent 100%)",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(212,175,55,0.35)",
        "gold-lg": "0 20px 40px -12px rgba(212,175,55,0.25)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "pulse-slow": "pulse 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "brand-marquee": "marquee 36s linear infinite",
        "fade-in": "fade-in 0.8s ease-out both",
        "fade-in-up": "fade-in-up 0.8s ease-out both",
        "slide-in-left": "slide-in-left 0.8s ease-out both",
      },
      maxWidth: {
        "8xl": "90rem",
      },
      spacing: {
        section: "6rem", // standard vertical section padding (py-section)
        "section-sm": "4rem", // denser section padding for legal/utility pages
      },
    },
  },
  plugins: [],
};

export default config;
