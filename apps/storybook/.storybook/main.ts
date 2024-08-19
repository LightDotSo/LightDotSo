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

import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: [
    "../../../packages/dialogs/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/elements/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/flow/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/forms/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/modals/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/states/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/svg/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/tables/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/templates/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  addons: [
    "@storybook/addon-viewport",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-styling",
    "storybook-dark-mode",
    "msw-storybook-addon",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  docs: {
    autodocs: true,
  },
  managerHead: (head) => `
    ${head}
    <meta name="description" content="Storybook of Light">
    <meta name="image" content="https://storybook.light.so/storybook.png">
    <meta name="url" content="https://storybook.light.so">
    <meta property="og:title" content="Light">
    <meta property="og:description" content="Storybook of Light">
    <meta property="og:image" content="https://storybook.light.so/storybook.png">
    <meta property="og:url" content="https://storybook.light.so">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@LightDotSo">
    <meta name="twitter:title" content="Light">
    <meta name="twitter:description" content="Storybook of Light">
    <meta name="twitter:image" content="https://storybook.light.so/storybook.png">
  `,
  env: (_config) => ({
    LOCAL_ENV: "dev",
  }),
  staticDirs: ["../public"],
};

export default config;
