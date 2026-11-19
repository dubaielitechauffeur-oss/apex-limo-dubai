import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/permissions/context", () => ({ getAuthzContext: vi.fn(), isSuperAdmin: vi.fn() }));
vi.mock("@/lib/permissions/audit", () => ({ logUnauthorizedAccess: vi.fn() }));
vi.mock("@/lib/audit/log", () => ({ writeAuditLog: vi.fn() }));
vi.mock("@/lib/notifications", () => ({ FROM_ADDRESS: "test@example.com" }));

import { diffSnapshots, DETAIL_FIELD, RECORD_FIELD } from "@/lib/audit/records";
import { describeAuditValue, readableChanges } from "@/lib/audit/present";
import { isUndoable } from "@/lib/audit/undo";
import { previousDubaiDay } from "@/lib/audit/daily-report";

describe("diffSnapshots", () => {
  it("lists only changed columns with both values and ignores bookkeeping", () => {
    const before = { id: "1", updatedAt: "a", title: { en: "Old" }, status: "draft", slug: "x" };
    const after = { id: "1", updatedAt: "b", title: { en: "New" }, status: "draft", slug: "x" };
    expect(diffSnapshots(before, after)).toEqual([{ field: "title", before: { en: "Old" }, after: { en: "New" } }]);
  });

  it("skips gallery/tags when the before row never loaded them", () => {
    expect(diffSnapshots({ name: "a" }, { name: "a", __images: [{ mediaId: "m" }] })).toEqual([]);
  });

  it("reports gallery/tags when both sides have them", () => {
    expect(diffSnapshots({ __tags: ["a"] }, { __tags: ["a", "b"] })).toEqual([{ field: "__tags", before: ["a"], after: ["a", "b"] }]);
  });
});

describe("isUndoable", () => {
  const detail = { field: DETAIL_FIELD, value: 1 };
  it("needs full before/after values", () => {
    expect(isUndoable({ action: "update", entityType: "service", changes: [detail, { field: "name", before: "a", after: "b" }] })).toBe(true);
    // Older summary-only entries are never undoable.
    expect(isUndoable({ action: "update", entityType: "service", changes: [{ field: "slug", before: "a", after: "a" }] })).toBe(false);
  });
  it("covers creates and hard deletes, never logins or uncovered types", () => {
    expect(isUndoable({ action: "create", entityType: "faq", changes: [detail] })).toBe(true);
    expect(isUndoable({ action: "delete", entityType: "brand", changes: [detail, { field: RECORD_FIELD, before: { id: "1" } }] })).toBe(true);
    expect(isUndoable({ action: "login", entityType: "user", changes: [detail] })).toBe(false);
    expect(isUndoable({ action: "update", entityType: "booking", changes: [detail, { field: "status", before: "a", after: "b" }] })).toBe(false);
  });
});

describe("readableChanges / describeAuditValue", () => {
  it("hides markers, keeps the label and names pseudo-fields", () => {
    const out = readableChanges([
      { field: DETAIL_FIELD, value: 1 },
      { field: "__label", value: "BYD Han" },
      { field: "__images", before: [], after: [{ mediaId: "m" }] },
    ]);
    expect(out.label).toBe("BYD Han");
    expect(out.rows.map((r) => r.field)).toEqual(["Gallery images"]);
  });
  it("shows the English text of localized values", () => {
    expect(describeAuditValue({ en: "Hello", ar: "مرحبا", ru: "" })).toBe("Hello  [+1 other language]");
    expect(describeAuditValue(null)).toBe("(empty)");
  });
});

describe("previousDubaiDay", () => {
  it("at 00:05 Dubai covers the whole previous Dubai day", () => {
    const now = new Date("2026-11-19T20:05:00Z"); // 00:05 on 20 Nov in Dubai
    const { day, start, end } = previousDubaiDay(now);
    expect(day).toBe("2026-11-19");
    expect(start.toISOString()).toBe("2026-11-18T20:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-19T20:00:00.000Z");
  });
});
