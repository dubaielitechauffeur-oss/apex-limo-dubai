const TONE_CLASSES = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  neutral: "bg-gray-100 text-gray-700 ring-gray-500/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
} as const;

export type StatusTone = keyof typeof TONE_CLASSES;

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
