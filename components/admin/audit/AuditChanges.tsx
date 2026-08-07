export function AuditChanges({ changes }: { changes: unknown }) {
  const text = JSON.stringify(changes);
  if (!text || text === "{}" || text === "null") return <span className="text-gray-400">—</span>;
  const truncated = text.length > 90 ? `${text.slice(0, 90)}…` : text;
  return (
    <code className="block max-w-xs truncate font-mono text-xs text-gray-500" title={text}>
      {truncated}
    </code>
  );
}
