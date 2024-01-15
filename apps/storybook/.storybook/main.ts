import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: [
    "../../../packages/table/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  addons: [
    "@storybook/addon-viewport",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-styling",
    "storybook-dark-mode",
    "storybook-addon-next-router",
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
};

export default config;
