/**
 * Helpers for treating next-intl message trees as an override target.
 * Pure functions, no imports — used by `i18n/request.ts`, the public read
 * path and the admin forms alike.
 */

type MessageTree = Record<string, unknown>;

/** Reads a dotted message key (`about.values.items.0.title`) out of a message
 *  tree. Array segments are addressed by index. Returns undefined unless the
 *  key resolves to a string. */
export function getMessageValue(messages: unknown, key: string): string | undefined {
  let node: unknown = messages;
  for (const segment of key.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Returns a copy of `messages` with `key` replaced by `value`, copying only
 * the objects along the path.
 *
 * The imported message JSON is a module-level singleton shared by every
 * request, so it must never be mutated in place — an override for one locale
 * would otherwise leak into the cached module and survive being cleared in
 * the admin panel until the server restarted.
 *
 * A key that does not already resolve to a string is ignored: overrides can
 * only replace an existing message, never add structure a page does not read.
 */
export function withMessageValue<T extends MessageTree>(messages: T, key: string, value: string): T {
  if (getMessageValue(messages, key) === undefined) return messages;
  const segments = key.split(".");

  const copyInto = (node: unknown, depth: number): unknown => {
    if (depth === segments.length) return value;
    const segment = segments[depth];
    if (Array.isArray(node)) {
      const copy = node.slice();
      copy[Number(segment)] = copyInto(node[Number(segment)], depth + 1);
      return copy;
    }
    const source = node as Record<string, unknown>;
    return { ...source, [segment]: copyInto(source[segment], depth + 1) };
  };

  return copyInto(messages, 0) as T;
}

const PLACEHOLDER = /\{\s*([A-Za-z0-9_]+)\s*\}/g;

/** Names of the simple `{placeholder}` arguments a message uses. */
export function messagePlaceholders(message: string | undefined): string[] {
  if (!message) return [];
  return [...new Set([...message.matchAll(PLACEHOLDER)].map((m) => m[1]))];
}

/**
 * Makes editor-typed text safe to use as an ICU message.
 *
 * next-intl parses every message as ICU MessageFormat, where `{`, `}`, `<` and
 * `>` are syntax. A heading typed as "Fleet <VIP>" or "Sedans {2026}" would
 * throw at render time and show the raw message key on the public page. So:
 *
 *  - `{placeholder}` tokens the ORIGINAL message also uses are kept (an editor
 *    rewording "Why Choose Apex for {name}" needs `{name}` to keep working);
 *  - every other brace and angle bracket is removed;
 *  - an apostrophe directly before a kept placeholder is turned into a
 *    typographic one, because `'{` starts an ICU quoted literal.
 */
export function sanitizeMessageOverride(value: string, originalMessage: string | undefined): string {
  const allowed = new Set(messagePlaceholders(originalMessage));
  const kept: string[] = [];
  const withTokens = value.replace(PLACEHOLDER, (_match, name: string) => {
    if (!allowed.has(name)) return "";
    kept.push(name);
    return `\u0000${kept.length - 1}\u0000`;
  });
  const stripped = withTokens.replace(/[{}<>]/g, "");
  const restored = stripped.replace(/'?\u0000(\d+)\u0000/g, (match, index: string) => {
    const token = `{${kept[Number(index)]}}`;
    return match.startsWith("'") ? `’${token}` : token;
  });
  return restored.replace(/\s+/g, " ").trim();
}

/** Fills `{placeholder}` tokens in a per-page heading override, which is
 *  plain text rendered directly rather than passed through next-intl. */
export function fillPlaceholders(text: string, params: Record<string, string | number> = {}): string {
  return text.replace(PLACEHOLDER, (match, name: string) => (name in params ? String(params[name]) : match));
}
