import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["lib/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    // The integration suites share fixture rows (upserted by a fixed email
    // per role, e.g. content_manager) against one live Postgres database.
    // Running test FILES in parallel (Vitest's default) races those
    // shared rows' audit-log counts across files. Sequential file
    // execution avoids that without weakening any single test's isolation
    // — tests within a file already run sequentially either way.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
