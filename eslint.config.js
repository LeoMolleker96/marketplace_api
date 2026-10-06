// @ts-check
// ESLint "flat config". Lint rules catch bugs and bad patterns that the
// TypeScript compiler alone does not. Run with `npm run lint`.
// Every choice here is explained in DECISIONS.md.
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/", "coverage/"] },

  eslint.configs.recommended,

  // "TypeChecked" presets use type information from tsconfig.json, so they can
  // catch things like floating promises or unsafe `any` usage.
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // drizzle.config.ts lives outside `src/` (so outside tsconfig.json);
        // this lets ESLint type-check it anyway.
        projectService: { allowDefaultProject: ["drizzle.config.ts"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Plain JS config files (like this one) are not part of tsconfig.json,
  // so type-aware rules cannot run on them.
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Project conventions from CLAUDE.md that a rule can enforce.
  {
    files: ["src/**/*.ts"],
    rules: {
      // Numbers in template strings are safe and common (`port ${PORT}`);
      // `undefined`, objects, etc. are still rejected.
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      // `describe`/`it` from node:test return promises that the test runner
      // itself tracks, so not awaiting them is safe. Every other promise
      // must still be awaited or handled.
      "@typescript-eslint/no-floating-promises": [
        "error",
        { allowForKnownSafeCalls: [{ from: "package", package: "node:test", name: ["describe", "it", "suite", "test"] }] },
      ],
      // Exported functions/methods must declare their return type.
      "@typescript-eslint/explicit-module-boundary-types": "error",
      // Named exports only.
      "no-restricted-exports": [
        "error",
        { restrictDefaultExports: { direct: true, named: true, defaultFrom: true, namedFrom: true, namespaceFrom: true } },
      ],
      // Use the `node:` prefix for built-in modules (e.g. "node:http").
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(assert|buffer|child_process|crypto|events|fs|http|https|net|os|path|stream|test|url|util|zlib)(/.*)?$",
              message: "Use the `node:` prefix for Node built-in modules.",
            },
          ],
        },
      ],
    },
  },
);
