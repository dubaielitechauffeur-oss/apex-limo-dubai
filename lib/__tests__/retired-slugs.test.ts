import { describe, it, expect } from "vitest";
import { RETIRED_VEHICLE_REDIRECTS, rewriteRetiredLinks } from "@/lib/retired-slugs";

describe("rewriteRetiredLinks", () => {
  it("repoints a markdown link to a retired slug", () => {
    expect(rewriteRetiredLinks("Book the [V-Class](/fleet/mercedes-v-class) for groups.")).toBe(
      "Book the [V-Class](/fleet/mercedes-v-class-v300-v250) for groups."
    );
  });

  it("keeps the locale prefix and works on absolute URLs", () => {
    expect(rewriteRetiredLinks("[x](/ar/fleet/mercedes-v-class)")).toBe("[x](/ar/fleet/mercedes-v-class-v300-v250)");
    expect(rewriteRetiredLinks("https://apexchauffeurdubai.com/fleet/bentley-flying-spur")).toBe(
      "https://apexchauffeurdubai.com/fleet/ultra-luxury"
    );
  });

  it("never touches a live slug that merely starts with a retired one", () => {
    const live = "[V](/fleet/mercedes-v-class-v300-v250) and [S](/fleet/mercedes-s-class)";
    expect(rewriteRetiredLinks(live)).toBe(live);
  });

  it("maps the intermediate V-Class slug too", () => {
    expect(rewriteRetiredLinks("(/fleet/mercedes-v-class-v300)")).toBe("(/fleet/mercedes-v-class-v300-v250)");
  });

  it("leaves text without fleet links alone", () => {
    expect(rewriteRetiredLinks("Airport transfers across Dubai.")).toBe("Airport transfers across Dubai.");
    expect(rewriteRetiredLinks("")).toBe("");
  });

  it("only points at targets that are not themselves retired", () => {
    const retired = new Set(RETIRED_VEHICLE_REDIRECTS.map(([from]) => from));
    for (const [, to] of RETIRED_VEHICLE_REDIRECTS) expect(retired.has(to)).toBe(false);
  });
});
