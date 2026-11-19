import { describeAuditValue, readableChanges } from "@/lib/audit/present";

/**
 * Before → after for each column an entry changed. Entries written before
 * field-level auditing existed hold a short summary and still render (as the
 * same list, with whatever they recorded).
 */
export function AuditChanges({ changes }: { changes: unknown }) {
  const { label, undoOf, rows } = readableChanges(changes);
  if (!label && !undoOf && rows.length === 0) return <span className="text-gray-400">—</span>;

  return (
    <details className="max-w-md text-xs">
      <summary className="cursor-pointer text-gray-700">
        {label ? <strong className="font-medium">{label}</strong> : null}
        {label && rows.length > 0 ? " · " : null}
        {rows.length > 0 ? `${rows.length} field${rows.length === 1 ? "" : "s"} changed` : null}
        {undoOf ? <span className="ml-1 text-amber-700">(undo of an earlier change)</span> : null}
      </summary>
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li key={row.field} className="rounded border border-gray-100 bg-gray-50 p-2">
            <div className="font-mono text-[11px] text-gray-500">{row.field}</div>
            {row.hasBefore ? (
              <div className="mt-1 break-words text-red-700">
                <span className="font-medium">Before:</span> {describeAuditValue(row.before)}
              </div>
            ) : null}
            {row.hasAfter ? (
              <div className="mt-0.5 break-words text-emerald-700">
                <span className="font-medium">After:</span> {describeAuditValue(row.after)}
              </div>
            ) : null}
            {!row.hasBefore && !row.hasAfter ? <div className="mt-1 text-gray-700">{describeAuditValue(row.value)}</div> : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
