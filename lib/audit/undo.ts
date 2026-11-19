import { prisma } from "@/lib/db";
import { getAuthzContext, isSuperAdmin } from "@/lib/permissions/context";
import { logUnauthorizedAccess } from "@/lib/permissions/audit";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { AuditAction } from "@/lib/generated/prisma/client";
import { writeAuditLog } from "./log";
import {
  AUDITED_RECORDS,
  CREATED_FIELD,
  DETAIL_FIELD,
  RECORD_FIELD,
  UNDO_OF_FIELD,
  applyValues,
  readSnapshot,
  recreateRecord,
  removeCreatedRecord,
  type AuditFieldChange,
} from "./records";

/**
 * Undo for one audit entry: puts back exactly what that one save changed.
 *
 * Owner-only (super admin). Agencies and other roles cannot undo, and cannot
 * even see the audit log.
 *
 * Safety rules:
 *  - Only entries written with full before/after values (`__detail`) are
 *    undoable. Older summary-only entries are not, because applying a partial
 *    record back would be wrong.
 *  - If any changed column has been edited again since, the undo is refused
 *    rather than silently overwriting the newer work. Undo the newer entry
 *    first (newest to oldest).
 *  - Each entry can be undone once; the undo is itself an audit entry (and
 *    can be undone in turn).
 */

const NOT_UNDOABLE_ACTIONS = new Set<string>(["login", "logout", "unauthorized_access"]);

function asChanges(value: unknown): AuditFieldChange[] {
  return Array.isArray(value) ? (value as AuditFieldChange[]) : [];
}

function has(changes: AuditFieldChange[], field: string): boolean {
  return changes.some((c) => c.field === field);
}

/** Columns this entry changed, with both values (pseudo-fields included). */
function fieldChanges(changes: AuditFieldChange[]): AuditFieldChange[] {
  return changes.filter(
    (c) => "before" in c && "after" in c && (!c.field.startsWith("__") || c.field === "__images" || c.field === "__tags")
  );
}

/** Whether the audit page should offer Undo for this entry at all. */
export function isUndoable(entry: { action: string; entityType: string; changes: unknown }): boolean {
  if (NOT_UNDOABLE_ACTIONS.has(entry.action) || !AUDITED_RECORDS[entry.entityType]) return false;
  const changes = asChanges(entry.changes);
  if (!has(changes, DETAIL_FIELD)) return false;
  if (entry.action === "create" || has(changes, RECORD_FIELD) || has(changes, CREATED_FIELD)) return true;
  return fieldChanges(changes).length > 0;
}

/** Ids (of `ids`) that some later entry has already undone. */
export async function findUndoneIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const rows = await prisma.auditLog.findMany({
    where: { OR: ids.map((id) => ({ changes: { array_contains: [{ field: UNDO_OF_FIELD, after: id }] } })) },
    select: { changes: true },
  });
  const undone = new Set<string>();
  for (const row of rows) {
    for (const change of asChanges(row.changes)) {
      if (change.field === UNDO_OF_FIELD && typeof change.after === "string") undone.add(change.after);
    }
  }
  return undone;
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

export async function undoAuditEntry(entryId: string): Promise<RoleAdminResult<{ entityType: string; entityId: string }>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!isSuperAdmin(ctx)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.AUDIT_READ, "missing_permission");
    return { success: false, error: "Only the owner (super admin) can undo changes." };
  }

  const entry = await prisma.auditLog.findUnique({ where: { id: entryId } });
  if (!entry) return { success: false, error: "Audit entry not found." };
  if (!isUndoable(entry)) return { success: false, error: "This entry cannot be undone." };
  if ((await findUndoneIds([entry.id])).size > 0) return { success: false, error: "This change has already been undone." };

  const changes = asChanges(entry.changes);
  const { entityType, entityId } = entry;
  const current = await readSnapshot(entityType, entityId);
  const marker: AuditFieldChange[] = [{ field: UNDO_OF_FIELD, after: entry.id }];
  let action: AuditAction = "update";

  try {
    if (entry.action === "create" || has(changes, CREATED_FIELD)) {
      if (!current) return { success: false, error: "The record no longer exists, so there is nothing to undo." };
      await removeCreatedRecord(entityType, entityId);
      action = "delete";
    } else if (has(changes, RECORD_FIELD)) {
      if (current) return { success: false, error: "A record with this id exists again, so it was not recreated." };
      const record = changes.find((c) => c.field === RECORD_FIELD)?.before as Record<string, unknown>;
      await recreateRecord(entityType, record);
      action = "restore";
    } else {
      if (!current) return { success: false, error: "The record no longer exists." };
      const fields = fieldChanges(changes);
      const conflicts = fields.filter((c) => c.field in current && !same(current[c.field], c.after));
      if (conflicts.length > 0) {
        return {
          success: false,
          error: `Not undone: ${conflicts.map((c) => c.field).join(", ")} changed again after this edit. Undo the newer change first.`,
        };
      }
      const values = Object.fromEntries(fields.map((c) => [c.field, c.before]));
      const counterparts = Object.fromEntries(fields.map((c) => [c.field, c.after]));
      await applyValues(entityType, entityId, values, counterparts);
      action = entry.action === "delete" ? "restore" : "update";
    }
  } catch (error) {
    console.error("[audit] undo failed", entry.id, error);
    return { success: false, error: "Undo failed. The record may be linked to something that no longer exists." };
  }

  await writeAuditLog({
    action,
    entityType,
    entityId,
    userId: ctx.userId,
    before: current ?? null,
    extra: marker,
    changes: [],
  });

  return { success: true, data: { entityType, entityId } };
}
