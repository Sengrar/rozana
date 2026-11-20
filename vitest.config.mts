import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup-env.ts"],
    // These tests talk to the real Supabase project: run files one at a time
    // and allow time for network round trips to Mumbai.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
