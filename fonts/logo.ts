import { Saira } from "next/font/google";

/**
 * Brand wordmark font — always Latin. "APEX" never translates (it's a
 * proper noun), so this loads unconditionally regardless of locale rather
 * than being split per-script like the display/body fonts below.
 */
export const logoFont = Saira({
  subsets: ["latin"],
  weight: ["800", "900"],
  style: ["italic"],
  variable: "--font-logo",
  display: "swap",
});
