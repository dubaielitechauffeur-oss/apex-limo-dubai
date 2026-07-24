/** Formats an ISO date string (e.g. "2026-06-15") for display, e.g. "15 June 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
