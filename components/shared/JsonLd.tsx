import { serializeJsonLd } from "@/lib/json-ld";

/**
 * The single sanctioned way to emit structured data anywhere in this app.
 *
 * Every page previously hand-wrote
 * `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />`,
 * which is the unescaped form described in lib/json-ld.ts. Routing all of them
 * through one component means the escaping cannot be forgotten at a new call
 * site, and there is exactly one place to change if the encoding ever needs to
 * evolve.
 *
 * Server component by design — structured data is part of the initial HTML and
 * must never depend on hydration.
 *
 * Passing `null`/`undefined` renders nothing, so callers with an optional node
 * (e.g. the homepage's review block) can pass the value directly instead of
 * wrapping the component in a ternary.
 */
export default function JsonLd({ data }: { data: unknown }) {
  if (data === null || data === undefined) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
