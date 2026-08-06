import type { Timestamps, SoftDeletable } from "@/types/common";

export type UserRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "viewer"
  | "driver";

export type UserStatus = "active" | "inactive" | "suspended";

export interface UserEntity extends Timestamps, SoftDeletable {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
}

export interface RoleEntity extends Timestamps {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export type PermissionAction = "create" | "read" | "update" | "delete" | "publish";

export type PermissionResource =
  | "vehicle"
  | "booking"
  | "quote"
  | "blog"
  | "service"
  | "location"
  | "media"
  | "settings"
  | "user"
  | "analytics"
  | "audit"
  | "seo"
  | "translation"
  | "pricing"
  | "homepage";

export interface Permission {
  action: PermissionAction;
  resource: PermissionResource;
}
