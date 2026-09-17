import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/** Apply Next.js, React, accessibility, and TypeScript lint rules to maintained source. */
export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // MAblog loads remote data inside named effects; the React compiler rule flags those async loaders indirectly.
      "react-hooks/set-state-in-effect": "off",
      // User-uploaded protected media uses natural dimensions and cannot use Next's optimizer safely.
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    ".npm-cache/**",
    "test-results/**",
    "playwright-report/**",
    "next-env.d.ts",
  ]),
]);
