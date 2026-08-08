import { describe, it, expect } from "vitest";
import { formatAedPrice, formatDate } from "@/lib/format";

describe("formatAedPrice", () => {
  it("formats a whole number with thousands separators and an AED prefix", () => {
    expect(formatAedPrice(2500)).toBe("AED 2,500");
    expect(formatAedPrice(400)).toBe("AED 400");
    expect(formatAedPrice(11000)).toBe("AED 11,000");
  });

  it("formats zero as AED 0", () => {
    expect(formatAedPrice(0)).toBe("AED 0");
  });
});

describe("formatDate", () => {
  it("formats an ISO date with the English locale by default", () => {
    expect(formatDate("2026-06-15")).toBe("15 June 2026");
  });
});
