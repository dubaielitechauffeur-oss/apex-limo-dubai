import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function DashboardCard({
  label,
  value,
  icon: IconComponent,
  href,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-900/5">
        <IconComponent className="h-5 w-5 text-gray-700" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums text-gray-900">{value}</p>
        <p className="truncate text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400">
      {content}
    </Link>
  ) : (
    content
  );
}

export function DashboardCardPlaceholder({ label, icon: IconComponent }: { label: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-200">
        <IconComponent className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-400">Coming soon</p>
        <p className="truncate text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}
