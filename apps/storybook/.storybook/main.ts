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

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: [
    "../../../packages/elements/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
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
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config, { configType }) => {
    return mergeConfig(config, {
      define: { "process.env": {} },
    });
  },
  docs: {
    autodocs: true,
  },
  staticDirs: ["../public"],
};

export default config;
