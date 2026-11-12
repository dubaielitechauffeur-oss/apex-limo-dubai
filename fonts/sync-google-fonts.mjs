#!/usr/bin/env node
/**
 * Vendors the site's Google Fonts into the repo and regenerates the
 * `next/font/local` modules in `fonts/generated/`.
 *
 * WHY: `next/font/google` downloads font files from fonts.googleapis.com /
 * fonts.gstatic.com during `next build`. When that download fails the build
 * fails ("Can't resolve '@vercel/turbopack-next/internal/font/google/font'"),
 * which broke CI on main and on a PR in Nov 2026. With the files committed,
 * `next build` needs no network for fonts.
 *
 * HOW: for every family below this script makes exactly the request
 * `next/font/google` made (same URL builder, same User-Agent, imported from
 * Next's own font loader). It saves every .woff2 file Google returns and
 * writes one `localFont()` call per file, with the same `unicode-range`,
 * weights, style, `font-stretch` and `display` as Google's CSS. The browser
 * gets the same @font-face rules and the same font bytes as before, so pages
 * render identically, and Chinese still downloads only the slices a page needs.
 *
 * Why one call per file: `next/font/local` cannot set a different
 * `unicode-range` per `src` entry. Every call sets its `font-family` (in
 * `declarations`) to the main call's const name. That is the family name
 * Turbopack gives a local font, and webpack uses the first @font-face's
 * family. So all slices of a font form one CSS family in either bundler.
 *
 * Fallback face: `next/font/google` sizes its "<family> Fallback" face (shown
 * until the web font loads) from metrics Next precomputed for the whole
 * family. `next/font/local` would compute them from the one slice file
 * instead, which gives different numbers (6% off for Noto Sans SC) and
 * more layout shift while loading. So the main call turns that off and
 * lists "<name> Fallback" in `fallback`, and the generated
 * `<family>.fallback.css` defines that face with the exact metrics
 * `next/font/google` used, taken from the same Next helper.
 *
 * Google does not always serve the same bytes: in Nov 2026 two fetches of
 * the same Cairo URL a few minutes apart returned differently-subset builds
 * of the same release (wght axis 400-700 vs 200-1000). Both render the same
 * glyphs, but check `git diff --stat fonts/files` after a run and keep
 * unchanged families' files as they were.
 *
 * Only needed when changing a family, weight or subset (edit FONTS, then run
 * `npm run fonts:sync`). Needs network access to Google Fonts.
 * The build itself never runs it.
 */
import { createRequire } from "node:module";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const loaderDir = "next/dist/compiled/@next/font/dist/google";
const { getFontAxes } = require(`${loaderDir}/get-font-axes`);
const { getGoogleFontsUrl } = require(`${loaderDir}/get-google-fonts-url`);
const { fetchResource } = require(`${loaderDir}/fetch-resource`);
const { getFallbackFontOverrideMetrics } = require(`${loaderDir}/get-fallback-font-override-metrics`);

/**
 * The exact options the `next/font/google` calls used before the switch.
 * `subsets` = slices to preload (Google returns all slices either way).
 * `name` = const name in the generated module, which is also the CSS family.
 * `variable` = the CSS custom property the consumer layouts and Tailwind read.
 */
const FONTS = [
  { name: "playfairDisplay", family: "Playfair Display", variable: "--font-display", weight: ["400", "500", "600", "700"], style: ["normal"], subsets: ["latin", "latin-ext", "cyrillic"] },
  { name: "inter", family: "Inter", variable: "--font-body", weight: ["400", "500", "600", "700", "800"], style: ["normal"], subsets: ["latin", "latin-ext", "cyrillic"] },
  { name: "saira", family: "Saira", variable: "--font-logo", weight: ["800", "900"], style: ["italic"], subsets: ["latin"] },
  { name: "amiri", family: "Amiri", variable: "--font-display", weight: ["400", "700"], style: ["normal"], subsets: ["arabic", "latin"] },
  { name: "cairo", family: "Cairo", variable: "--font-body", weight: ["400", "500", "600", "700"], style: ["normal"], subsets: ["arabic", "latin"] },
  { name: "notoSerifSc", family: "Noto Serif SC", variable: "--font-display", weight: ["400", "600", "700"], style: ["normal"], subsets: ["latin"] },
  { name: "notoSansSc", family: "Noto Sans SC", variable: "--font-body", weight: ["400", "500", "600", "700"], style: ["normal"], subsets: ["latin"] },
];

const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/** Parses Google's css2 response into @font-face records. */
function parseCss(css) {
  const faces = [];
  // Named subsets carry a `/* latin */` comment; numbered CJK slices do not,
  // and are identified by the `.N.woff2` suffix of their URL instead.
  const re = /(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*{([^}]*)}/g;
  for (const m of css.matchAll(re)) {
    const body = m[2];
    const get = (prop) => body.match(new RegExp(`${prop}:\\s*([^;]+);`))?.[1].trim();
    const url = body.match(/url\(([^)]+)\)/)[1];
    const slice = url.match(/\.(\d+)\.woff2$/)?.[1];
    if (!m[1] && !slice) {
      // Google's response varies between requests; this has been seen once.
      throw new Error(`Unrecognised @font-face (no subset comment, no slice number): ${url}. Re-run.`);
    }
    const subset = m[1] ? m[1].replace(/[[\]]/g, "").trim() : slice.padStart(3, "0");
    faces.push({
      subset,
      url,
      style: get("font-style"),
      weight: get("font-weight"),
      stretch: get("font-stretch"),
      unicodeRange: get("unicode-range"),
    });
  }
  return faces;
}

async function syncFont(font) {
  const axes = getFontAxes(font.family, font.weight, font.style, undefined);
  const url = getGoogleFontsUrl(font.family, axes, "swap");
  const faces = parseCss((await fetchResource(url, false)).toString("utf8"));
  if (faces.length === 0) throw new Error(`No @font-face in ${url}`);

  // Group faces by font file: variable fonts reuse one file for every weight
  // of a slice; static fonts (Amiri) have one file per weight.
  const files = new Map();
  for (const face of faces) {
    if (!files.has(face.url)) files.set(face.url, { ...face, variants: [] });
    files.get(face.url).variants.push({ weight: face.weight, style: face.style });
  }

  const dir = path.join(root, "fonts/files", slug(font.family));
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const perSubset = new Map();
  for (const file of files.values()) {
    perSubset.set(file.subset, (perSubset.get(file.subset) ?? 0) + 1);
  }
  const calls = [];
  for (const file of files.values()) {
    const suffix = perSubset.get(file.subset) > 1 ? `-${file.weight}` : "";
    const fileName = `${file.subset}${font.style[0] === "italic" ? "-italic" : ""}${suffix}.woff2`;
    await writeFile(path.join(dir, fileName), await fetchResource(file.url, false));
    calls.push({ ...file, fileName, suffix, preload: font.subsets.includes(file.subset) });
  }

  // The main call is the one that carries `variable` and the fallback stack.
  // Use the latin slice, the one most body text renders from.
  const main = calls.find((c) => c.subset === "latin") ?? calls[calls.length - 1];
  const declarations = (c) => [
    `    { prop: "font-family", value: "${font.name}" },`,
    ...(c.stretch ? [`    { prop: "font-stretch", value: "${c.stretch}" },`] : []),
    `    { prop: "unicode-range", value: "${c.unicodeRange}" },`,
  ];
  const callSource = (c) => {
    const isMain = c === main;
    const constName = isMain ? font.name : `${font.name}${camel(`-${/^\d/.test(c.subset) ? "slice-" : ""}${c.subset}${c.suffix}`)}`;
    return [
      `export const ${constName} = localFont({`,
      "  src: [",
      ...c.variants.map(
        (v) => `    { path: "../files/${slug(font.family)}/${c.fileName}", weight: "${v.weight}", style: "${v.style}" },`,
      ),
      "  ],",
      ...(isMain ? [`  variable: "${font.variable}",`, `  fallback: ["${font.name} Fallback"],`] : []),
      '  display: "swap",',
      `  preload: ${c.preload},`,
      "  adjustFontFallback: false,",
      "  declarations: [",
      ...declarations(c),
      "  ],",
      "});",
      "",
    ].join("\n");
  };

  const source = [
    "// AUTO-GENERATED by fonts/sync-google-fonts.mjs. Do not edit by hand.",
    `// ${font.family}: ${font.weight.join(", ")} ${font.style.join(", ")}, ${calls.length} file(s), ${faces.length} @font-face rule(s).`,
    `// Mirrors ${url}`,
    'import localFont from "next/font/local";',
    `import "./${slug(font.family)}.fallback.css";`,
    "",
    ...calls.map(callSource),
  ].join("\n");
  await mkdir(path.join(root, "fonts/generated"), { recursive: true });
  await writeFile(path.join(root, "fonts/generated", `${slug(font.family)}.ts`), source);

  const m = getFallbackFontOverrideMetrics(font.family);
  if (!m) throw new Error(`No precomputed fallback metrics for ${font.family}`);
  const fallbackCss = [
    "/* AUTO-GENERATED by fonts/sync-google-fonts.mjs. Do not edit by hand.",
    ` * Size-adjusted fallback for ${font.family}, shown until the web font loads.`,
    " * Same metrics next/font/google generated (Next's precomputed values). */",
    "@font-face {",
    `  font-family: "${font.name} Fallback";`,
    `  src: local("${m.fallbackFont}");`,
    `  ascent-override: ${m.ascentOverride};`,
    `  descent-override: ${m.descentOverride};`,
    `  line-gap-override: ${m.lineGapOverride};`,
    `  size-adjust: ${m.sizeAdjust};`,
    "}",
    "",
  ].join("\n");
  await writeFile(path.join(root, "fonts/generated", `${slug(font.family)}.fallback.css`), fallbackCss);
  return { font, files: calls.length, faces: faces.length };
}

const results = [];
for (const font of FONTS) results.push(await syncFont(font));
console.log(results.map((r) => `${r.font.family}: ${r.files} files, ${r.faces} faces`).join("\n"));
