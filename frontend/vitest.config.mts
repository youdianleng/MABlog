import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests live beside their modules as *.test.ts; Playwright owns tests/*.spec.ts.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
