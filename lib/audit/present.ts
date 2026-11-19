import { RECORD_FIELD, UNDO_OF_FIELD, type AuditFieldChange } from "./records";

/** Human-readable text for a stored audit value, shared by the audit page
 *  and the daily email. Localized JSON shows its English text (plus how many
 *  other languages it holds); long text is cut so one entry stays readable. */
export function describeAuditValue(value: unknown, max = 220): string {
  if (value === null || value === undefined || value === "") return "(empty)";
  let text: string;
  if (typeof value === "string") text = value;
  else if (typeof value === "number" || typeof value === "boolean") text = String(value);
  else if (typeof value === "object" && !Array.isArray(value) && "en" in (value as Record<string, unknown>)) {
    const record = value as Record<string, unknown>;
    const en = typeof record.en === "string" ? record.en : JSON.stringify(record.en);
    const others = Object.keys(record).filter((k) => k !== "en" && record[k]).length;
    text = others > 0 ? `${en || "(empty)"}  [+${others} other language${others === 1 ? "" : "s"}]` : en || "(empty)";
  } else text = JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export interface ReadableChangeRow {
  field: string;
  before?: unknown;
  after?: unknown;
  value?: unknown;
  hasBefore: boolean;
  hasAfter: boolean;
}

const FIELD_NAMES: Record<string, string> = {
  __images: "Gallery images",
  __tags: "Tags",
  [RECORD_FIELD]: "Deleted record",
  deletedAt: "Deleted",
  seo: "SEO (meta, headings)",
};

/** Splits an entry's `changes` into its label, undo marker and display rows. */
export function readableChanges(changes: unknown): { label: string | null; undoOf: string | null; rows: ReadableChangeRow[] } {
  const list = Array.isArray(changes) ? (changes as AuditFieldChange[]) : [];
  let label: string | null = null;
  let undoOf: string | null = null;
  const rows: ReadableChangeRow[] = [];
  for (const change of list) {
    if (!change || typeof change !== "object") continue;
    if (change.field === "__label") label = String(change.value ?? "");
    else if (change.field === UNDO_OF_FIELD) undoOf = String(change.after ?? "");
    else if (change.field.startsWith("__") && !(change.field in FIELD_NAMES)) continue;
    else {
      rows.push({
        field: FIELD_NAMES[change.field] ?? change.field,
        before: change.before,
        after: change.after,
        value: change.value,
        hasBefore: "before" in change,
        hasAfter: "after" in change,
      });
    }
  }
  return { label, undoOf, rows };
}
