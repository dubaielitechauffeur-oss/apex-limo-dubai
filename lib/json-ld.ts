/**
 * Safe serialization for JSON-LD embedded in `<script type="application/ld+json">`.
 *
 * `JSON.stringify` alone is NOT safe here. It escapes what JSON requires, but
 * it leaves `<`, `>` and `&` untouched — so any CMS-authored string that
 * contains the byte sequence `</script>` terminates the script element early
 * and everything after it is parsed by the browser as HTML. Because the site's
 * CSP necessarily allows `'unsafe-inline'` for scripts (JSON-LD and next-intl
 * both require it — see next.config.ts), CSP does not mitigate this: injected
 * markup would execute.
 *
 * Every one of those characters has a valid `\uXXXX` JSON escape, so replacing
 * them changes nothing about the parsed value — a consumer (Google, an AI
 * crawler, a validator) sees byte-identical data — while making it impossible
 * to close the enclosing element from inside a string.
 *
 * U+2028/U+2029 are included because they are valid inside a JSON string but
 * are line terminators in JavaScript source; escaping them keeps the payload
 * safe if it is ever moved into a `<script>` of a different type.
 *
 * Ordering note: none of the replacements can introduce a character that a
 * later replacement matches (`<` contains no `<`, `>` or `&`), so the
 * sequence below is order-independent and cannot double-escape.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
