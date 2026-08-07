import type { ReactNode } from "react";

export function SettingsSection({
  title,
  description,
  comingSoon,
  children,
}: {
  title: string;
  description?: string;
  comingSoon?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {comingSoon ? (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">Coming soon</span>
        ) : null}
      </div>
      {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

export function SettingsField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-gray-900">{value}</dd>
    </div>
  );
}
