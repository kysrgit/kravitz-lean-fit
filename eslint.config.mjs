/**
 * Dosya: eslint.config.mjs
 * Açıklama: Kravitz Lean & Fit projesi için ESLint yapılandırması.
 */

import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "assets/**"],
  },
  js.configs.recommended,
  {
    files: ["app.js", "data.js", "src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["sw.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    files: ["scripts/**/*.mjs", "eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
];
