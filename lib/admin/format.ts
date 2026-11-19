/**
 * Admin-scoped date/time formatting — deliberately separate from
 * `lib/format.ts`, which is keyed to the public site's 6 locales and only
 * formats a date (no time). The admin panel is English-only and needs full
 * timestamps (last login, audit log entries), so it gets its own small
 * helper rather than reshaping the public one.
 */
/**
 * The business runs on Dubai time. Without an explicit zone these formatters
 * used the server's, which on Vercel is UTC, so every timestamp in the admin
 * (bookings, quotes, audit log, last login) read four hours early. Dubai has
 * no daylight saving, so the fixed zone is always right.
 */
export const ADMIN_TIME_ZONE = "Asia/Dubai";

/** Dubai's fixed UTC offset, for turning a Dubai calendar day into UTC bounds. */
export const DUBAI_UTC_OFFSET = "+04:00";

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ADMIN_TIME_ZONE,
});

const dateOnlyFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: ADMIN_TIME_ZONE,
});

export function formatAdminDateTime(value: Date | string): string {
  return formatter.format(new Date(value));
}

export function formatAdminDate(value: Date | string): string {
  return dateOnlyFormatter.format(new Date(value));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
