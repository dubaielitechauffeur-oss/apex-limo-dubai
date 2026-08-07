import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/spam-protection";
import { AuditAction, type Prisma } from "@/lib/generated/prisma/client";

export interface WriteAuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string | null;
  userName?: string;
  changes: Prisma.InputJsonValue;
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

  await prisma.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId ?? null,
      userName: input.userName ?? "System",
      changes: input.changes,
      ipAddress,
      userAgent,
    },
  });
}
