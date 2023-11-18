import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import * as path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-styling",
    "storybook-dark-mode"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config, { configType }) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@lightdotso/ui": path.resolve(__dirname, "../src/"),
        },
      },
    });
  },
  docs: {
    autodocs: true,
  },
};

export default config;
