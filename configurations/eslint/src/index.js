// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fixupPluginRules = require("@eslint/compat").fixupPluginRules;

module.exports = {
  ignorePatterns: [
    "**/__next/**",
    "**/_next/**",
    "**/dist/**",
    "**/generated/**",
    "**/lib/**",
    "**/notebooks/**",
    "**/public/**",
    "**/scripts/**",
    "**/target/**",
    "**/test/**",
    "generated.ts",
    "apps/extension/*/**.js",
    "packages/client/src/types/**/*.d.ts",
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
  plugins: [
    "@typescript-eslint",
    "prettier",
    "jsonc",
    "neverthrow",
    fixupPluginRules("@next/next"),
    fixupPluginRules("import"),
    fixupPluginRules("jsx-a11y"),
    fixupPluginRules("react"),
    fixupPluginRules("react-hooks"),
    fixupPluginRules("tailwindcss"),
    fixupPluginRules("turbo"),
    fixupPluginRules("unicorn"),
  ],
  rules: {
    // "import/newline-after-import": "error",
    // "import/no-anonymous-default-export": "off",
    // "import/no-named-as-default": "off",
    // "import/order": [
    //   "error",
    //   {
    //     alphabetize: {
    //       caseInsensitive: false,
    //       order: "asc",
    //     },
    //     "newlines-between": "never",
    //     pathGroups: [
    //       {
    //         pattern: "@lightdotso/**",
    //         group: "external",
    //         position: "before",
    //       },
    //       {
    //         pattern: "@/**",
    //         group: "internal",
    //         position: "after",
    //       },
    //     ],
    //     pathGroupsExcludedImportTypes: ["builtin"],
    //   },
    // ],
    "no-console": ["error", { allow: ["warn", "error", "info"] }],
    "no-multiple-empty-lines": "error",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "object-shorthand": ["error", "never"],
    // "@next/next/no-html-link-for-pages": "off",
    // "@typescript-eslint/consistent-type-imports": "error",
    // "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    // "react/react-in-jsx-scope": "off",
    // "react/jsx-closing-bracket-location": ["error", "line-aligned"],
    // "react/jsx-sort-props": [
    //   "error",
    //   {
    //     callbacksLast: true,
    //     ignoreCase: true,
    //     noSortAlphabetically: true,
    //     reservedFirst: true,
    //     shorthandFirst: true,
    //     shorthandLast: true,
    //   },
    // ],
    // "react/self-closing-comp": "error",
    "tailwindcss/enforces-shorthand": [
      "error",
      { callees: ["classnames", "clsx", "cva", "cn"] },
    ],
    "tailwindcss/classnames-order": [
      "error",
      { callees: ["classnames", "clsx", "cva", "cn"] },
    ],
    "tailwindcss/no-custom-classname": [
      "off",
      {
        callees: ["classnames", "clsx", "cva", "cn"],
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
      files: ["*.json"],
      rules: {
        "no-loss-of-precision": "off",
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
      files: ["**/apps/app/**/index.ts"],
      rules: {
        "no-restricted-imports": "off",
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
