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
  plugins: ["@typescript-eslint", "neverthrow"],
  rules: {
    "import/newline-after-import": "error",
    "import/no-anonymous-default-export": "off",
    "import/no-named-as-default": "off",
    "import/order": [
      "error",
      {
        alphabetize: {
          caseInsensitive: false,
          order: "asc",
        },
        "newlines-between": "never",
        pathGroups: [
          {
            pattern: "@lightdotso/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "@/**",
            group: "internal",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
      },
    ],
    "no-console": ["error", { allow: ["warn", "error", "info"] }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react/jsx-closing-bracket-location": ["error", "line-aligned"],
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react/react-in-jsx-scope": "off",
    "react/jsx-sort-props": [
      "error",
      {
        callbacksLast: true,
        ignoreCase: true,
        noSortAlphabetically: true,
        reservedFirst: true,
        shorthandFirst: true,
        shorthandLast: true,
      },
    ],
    "react/self-closing-comp": "error",
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
        "no-unused-vars": "off",
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["**//**"],
                message: "Import duplicates are not allowed.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["*.stories.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
      },
    },
    {
      files: ["**/subgraph/**/*.ts"],
      rules: {
        "@typescript-eslint/consistent-type-imports": "off",
      },
    },
    {
      files: ["**/apps/app/**/*.ts", "**/apps/app/**/*.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["./*", "**../"],
                message: "Relative imports are not allowed.",
              },
              {
                group: ["**//**"],
                message: "Import duplicates are not allowed.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["**/apps/app/**/index.ts", "**/apps/app/**/index.tsx"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
    {
      files: ["**/apps/ui/src/components/ui/**.tsx"],
      rules: {
        "react/display-name": "off",
        "react/prop-types": "off",
      },
    },
    {
      files: ["*.config.js"],
      rules: {
        "import/order": "off",
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
