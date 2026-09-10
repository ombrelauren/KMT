import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Sanity's DocumentActionComponent convention is a plain, lowercase-
    // named function that calls hooks internally (see sanity/actions/*) —
    // that's Sanity's own documented pattern, not a real React component,
    // so react-hooks' naming-based detection flags it as a false positive.
    files: ["sanity/actions/**/*.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
]);

export default eslintConfig;
