/**
 * Admin-scoped date/time formatting — deliberately separate from
 * `lib/format.ts`, which is keyed to the public site's 6 locales and only
 * formats a date (no time). The admin panel is English-only and needs full
 * timestamps (last login, audit log entries), so it gets its own small
 * helper rather than reshaping the public one.
 */
const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateOnlyFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
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
