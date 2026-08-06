export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  deletedAt: Date | null;
}

export type PublishStatus = "draft" | "published" | "archived";

export interface Publishable {
  status: PublishStatus;
  publishedAt: Date | null;
}

export interface Sluggable {
  slug: string;
}

export interface Sortable {
  sortOrder: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type SortDirection = "asc" | "desc";

export interface SortParams {
  field: string;
  direction: SortDirection;
}

export interface FilterParams {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in";
  value: unknown;
}

export interface ListQuery {
  pagination: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams[];
  search?: string;
}
