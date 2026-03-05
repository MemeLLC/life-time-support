import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "**/dist/",
      "**/node_modules/",
      "**/.astro/",
      "**/.wrangler/",
      "**/*.astro",
      "**/coverage/",
      ".agents/",
      ".claude/",
      "**/lighthouserc.cjs",
    ],
  },

  // Base: recommended JS rules
  eslint.configs.recommended,

  // TypeScript: type-checked rules for all TS files
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },

  // React Hooks (landing-page, line)
  {
    files: ["apps/landing-page/**/*.{tsx,jsx}", "apps/line/**/*.{tsx,jsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  // Node.js scripts
  {
    files: ["**/scripts/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        URL: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },

  // Disable type-checked rules for plain JS/config files
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },

  // Prettier: must be last to override formatting rules
  eslintConfigPrettier,
);
