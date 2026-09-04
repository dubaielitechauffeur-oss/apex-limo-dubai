import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "@/lib/json-ld";

/**
 * Guards the fix for the JSON-LD script-breakout defect.
 *
 * Every structured-data block on the site is injected with
 * `dangerouslySetInnerHTML`, and the site's CSP must allow `'unsafe-inline'`
 * for scripts (JSON-LD and next-intl both require it), so CSP does not
 * mitigate a breakout. `JSON.stringify` alone leaves `<` untouched, which
 * means CMS-authored text containing `</script>` closes the block early and
 * everything after it is parsed as HTML.
 */
describe("serializeJsonLd", () => {
  it("escapes a </script> breakout attempt", () => {
    const payload = { name: 'Rolls</script><script>alert(1)</script>' };
    const out = serializeJsonLd(payload);

    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c");
  });

  it("escapes every HTML-significant character", () => {
    const out = serializeJsonLd({ v: "<>&" });
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u003e");
    expect(out).toContain("\\u0026");
    expect(out).not.toMatch(/[<>&]/);
  });

  it("escapes the JS line terminators U+2028 / U+2029", () => {
    const out = serializeJsonLd({ v: "a b c" });
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");
    expect(out).not.toContain(" ");
    expect(out).not.toContain(" ");
  });

  it("does not change the parsed value — consumers see identical data", () => {
    const payload = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ name: "Is 5 > 3 & 2 < 4?", answer: "</script> yes" }],
      nested: { arabic: "شركة", chinese: "豪华轿车" },
    };
    expect(JSON.parse(serializeJsonLd(payload))).toEqual(payload);
  });

  it("never double-escapes an already-escaped sequence", () => {
    // The replacements introduce backslash-u sequences; none of them contain a
    // character a later replacement matches, so running once is stable.
    const out = serializeJsonLd({ v: "<" });
    expect(out).toBe('{"v":"\\u003c"}');
  });

  it("produces valid JSON for every escaped form", () => {
    const out = serializeJsonLd({ a: "<script>", b: "&amp;", c: " " });
    expect(() => JSON.parse(out)).not.toThrow();
  });
});
