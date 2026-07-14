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
        smoke: "#B8B5AE", // muted text on dark backgrounds
        graphite: "#57534E", // muted text on light backgrounds
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
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
      animation: {
        "pulse-slow": "pulse 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
