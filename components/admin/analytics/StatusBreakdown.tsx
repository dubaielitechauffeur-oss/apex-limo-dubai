function humanizeStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBreakdown({
  title,
  rows,
}: {
  title: string;
  rows: { status: string; count: number }[];
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const percent = total === 0 ? 0 : Math.round((row.count / total) * 100);
          return (
            <div key={row.status}>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{humanizeStatus(row.status)}</span>
                <span className="tabular-nums">
                  {row.count} <span className="text-gray-400">({percent}%)</span>
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gray-900" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
        {total === 0 ? <p className="text-sm text-gray-400">No data yet.</p> : null}
      </div>
    </div>
  );
}
