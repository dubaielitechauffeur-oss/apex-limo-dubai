// Runs `npm run build`, and retries it once if it failed only because the
// Google Fonts download hiccupped.
//
// next/font/google downloads font files from Google at build time. When that
// download fails, the build fails with "module-not-found" errors under
// `[next]/internal/font/google/...` even though the code is fine (Vercel
// production deploys of PRs #169 and #170, and CI, on 12 Nov 2026; the
// preview builds of the same commits passed). Any other build failure fails
// immediately, exactly as before.
//
// Used by vercel.json (`buildCommand`) and by .github/workflows/ci.yml.
// Local `npm run build` is unchanged.
import { spawn } from "node:child_process";

const FONT_ERROR = /next\/font\/google|internal\/font\/google|fonts\.googleapis\.com|fonts\.gstatic\.com/;
const RETRY_DELAY_MS = 20_000;

function build() {
  return new Promise((resolve) => {
    let output = "";
    const child = spawn("npm", ["run", "build"], {
      stdio: ["inherit", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
      output += chunk;
    });
    child.on("close", (code) => resolve({ code: code ?? 1, output }));
  });
}

const first = await build();
if (first.code === 0) process.exit(0);

if (!FONT_ERROR.test(first.output)) process.exit(first.code);

console.warn(
  `\n::warning::Google Fonts download failed during the build; retrying once in ${RETRY_DELAY_MS / 1000}s\n`,
);
await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
const second = await build();
process.exit(second.code);
