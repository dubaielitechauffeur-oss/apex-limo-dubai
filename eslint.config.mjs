import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * ESLint flat config, replacing the previous `.eslintrc.json`.
 *
 * Next.js 16 removed the `next lint` command, and ESLint 10 dropped support
 * for the legacy `.eslintrc.*` format, so the project now invokes the ESLint
 * CLI directly (see the `lint` script in package.json). `eslint-config-next`
 * v16 ships flat config natively, so no `FlatCompat` shim is needed.
 *
 * Rule selection is unchanged from before: `next/core-web-vitals` only, no
 * extra custom rules — this migration is about the config format and the
 * removed command, not about tightening or loosening linting.
 */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts", "lib/generated/**"],
  },
  ...nextCoreWebVitals,
  {
    settings: {
      // Pinned rather than left to eslint-plugin-react's auto-detection.
      // eslint-config-next@16 bundles eslint-plugin-react@7.37.5, whose
      // version-detection path still calls `context.getFilename()` — removed
      // in ESLint 10 — so auto-detect throws "contextOrFilename.getFilename
      // is not a function" on the first file it lints. Declaring the version
      // explicitly skips that code path entirely. Keep this in step with the
      // `react` version in package.json.
      react: { version: "19.2" },
    },
  },
];

export default config;
