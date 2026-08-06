import type { Timestamps } from "@/types/common";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"
  | "login"
  | "logout"
  | "permission_change"
  | "settings_change"
  | "bulk_action";

export interface AuditChange {
  field: string;
  before: unknown;
  after: unknown;
}

export interface AuditLogEntry extends Timestamps {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  changes: AuditChange[];
  ipAddress: string;
  userAgent: string;
}
