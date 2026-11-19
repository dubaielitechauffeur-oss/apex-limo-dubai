import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/spam-protection";
import { AuditAction, type Prisma } from "@/lib/generated/prisma/client";
import {
  AUDITED_RECORDS,
  CREATED_FIELD,
  DETAIL_FIELD,
  RECORD_FIELD,
  diffSnapshots,
  readSnapshot,
  snapshotLabel,
  type AuditFieldChange,
} from "./records";

export interface WriteAuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string | null;
  userName?: string;
  changes: Prisma.InputJsonValue;
  /**
   * The record as it was before this write (the row the caller already
   * loaded, or a `readSnapshot()`). For types in `AUDITED_RECORDS` the entry
   * then stores every changed column with its old and new value, which is
   * what the audit page, the daily email and Undo read. `changes` stays the
   * fallback when nothing differs or the type is not covered.
   */
  before?: unknown;
  /** Marker entries kept in front of the computed diff (e.g. `__undoOf`). */
  extra?: AuditFieldChange[];
}

/** "Name · role" for the entry, so two people sharing a role (two agency
 *  logins) can be told apart. Falls back to whatever the caller passed. */
async function describeUser(userId: string | null | undefined, fallback: string | undefined): Promise<string> {
  if (!userId) return fallback ?? "System";
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: { select: { name: true } } },
    });
    if (!user) return fallback ?? "System";
    const who = user.name?.trim() || user.email;
    return user.role?.name ? `${who} · ${user.role.name}` : who;
  } catch {
    return fallback ?? "System";
  }
}

/** Field-level changes for covered record types; null to keep `changes`. */
async function detailedChanges(input: WriteAuditLogInput): Promise<AuditFieldChange[] | null> {
  if (!AUDITED_RECORDS[input.entityType]) return null;
  const summary = Array.isArray(input.changes) ? (input.changes as unknown as AuditFieldChange[]) : [];
  const after = await readSnapshot(input.entityType, input.entityId);
  const label = snapshotLabel(after) ?? snapshotLabel((input.before as Record<string, unknown>) ?? null);
  // `__detail` marks an entry whose before/after values are complete, which
  // is what makes it undoable. Entries written before this existed only hold
  // a summary (often just the slug), so Undo must not trust them.
  const labelField: AuditFieldChange[] = [{ field: DETAIL_FIELD, value: 1 }, ...(label ? [{ field: "__label", value: label }] : [])];

  if (input.action === "create") return [...labelField, ...summary];
  if (input.before === undefined) return null;
  const before = input.before ? (JSON.parse(JSON.stringify(input.before)) as Record<string, unknown>) : null;
  if (!after && before) return [...labelField, { field: RECORD_FIELD, before }];
  const diff = diffSnapshots(before, after);
  // An upsert that created the row (first Page SEO / page hero save): Undo
  // removes the row, which puts the page back on its built-in defaults.
  if (!before && after) return [...labelField, { field: CREATED_FIELD, value: true }, ...diff];
  return diff.length > 0 ? [...labelField, ...diff] : null;
}

/**
 * Generic writer for the `AuditLog` model (schema unchanged from Phase 2B
 * except the one new `unauthorized_access` enum value RBAC needed — see
 * RBAC.md). Not RBAC-specific itself; `lib/permissions/audit.ts` builds the
 * authorization-specific event helpers on top of this. IP/user-agent are
 * read from the current request's headers when available (Server
 * Components/Actions/Route Handlers all expose `headers()`) — best-effort,
 * since a script/cron context calling this would have neither.
 *
 * Fire-and-forget by design: a logging failure must never block or fail
 * the operation being logged (an unauthorized-access denial must still
 * deny access even if the audit write itself throws). Callers that need to
 * know the write succeeded should catch around this call themselves;
 * `logUnauthorizedAccess`/`logRoleChange` in lib/permissions/audit.ts
 * already swallow errors for this reason.
 */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  let ipAddress: string | undefined;
  let userAgent: string | undefined;
  try {
    const requestHeaders = await headers();
    ipAddress = getClientIp(requestHeaders);
    userAgent = requestHeaders.get("user-agent") ?? undefined;
  } catch {
    // headers() throws outside a request context (e.g. a background job) —
    // the audit entry is still worth writing without them.
  }

  const [userName, detailed] = await Promise.all([
    describeUser(input.userId, input.userName),
    detailedChanges(input).catch((error) => {
      console.error("[audit] diff failed", input.entityType, input.entityId, error);
      return null;
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId ?? null,
      userName,
      changes: input.extra?.length
        ? ([...input.extra, ...(detailed ?? (Array.isArray(input.changes) ? (input.changes as unknown[]) : []))] as unknown as Prisma.InputJsonValue)
        : detailed
          ? (detailed as unknown as Prisma.InputJsonValue)
          : input.changes,
      ipAddress,
      userAgent,
    },
  });
}
