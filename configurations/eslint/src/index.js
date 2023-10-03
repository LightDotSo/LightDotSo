// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:cypress/recommended",
    "plugin:import/errors",
    "plugin:import/typescript",
    "plugin:import/warnings",
    "plugin:prettier/recommended",
    "plugin:jsonc/recommended-with-jsonc",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@next/next/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:turbo/recommended",
  ],
  ignorePatterns: [
    "**/lib/**",
    "**/__next/**",
    "**/_next/**",
    "**/generated/**",
    "generated.ts",
    "apps/ui/src/components/ui/**",
    "apps/extension/*/**.js",
    "packages/client/src/**.d.ts",
    "ios/LightWalletSafariExtension/Resources/**",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
    createDefaultProgram: true,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "import/no-named-as-default": "off",
    "no-console": ["error", { allow: ["warn", "error", "info"] }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react/react-in-jsx-scope": "off",
    "tailwindcss/no-custom-classname": [
      0,
      {
        cssFiles: [
          "**/*.css",
          "!**/node_modules",
          "!**/.*",
          "!**/dist",
          "!**/build",
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "no-undef": "off",
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "import/no-unresolved": "off",
        "no-undef": "off",
      },
    },
    {
      files: ["**/subgraph/**/*.ts"],
      rules: {
        "@typescript-eslint/consistent-type-imports": "off",
      },
    },
    {
      files: ["turbo.json"],
      parser: "jsonc-eslint-parser",
      rules: {
        "jsonc/sort-keys": [
          "error",
          "asc",
          {
            caseSensitive: true,
            natural: false,
            minKeys: 2,
            allowLineSeparatedGroups: false,
          },
        ],
      },
    },
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        project: [
          "apps/*/tsconfig.json",
          "configurations/*/tsconfig.json",
          "packages/*/tsconfig.json",
        ],
      },
    },
    react: {
      version: "detect",
    },
  },
};
