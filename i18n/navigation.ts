import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware Link/redirect/usePathname/useRouter — swap the locale
 * segment while preserving the rest of the current path, which is what
 * lets the language switcher keep a visitor on the same page.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
