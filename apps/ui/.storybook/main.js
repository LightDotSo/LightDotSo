const path = require("path");
const { mergeConfig } = require("vite");
module.exports = {
  features: {
    storyStoreV7: true,
  },
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    /**
     * Enable TailwindCSS JIT mode
     * NOTE: fix Storybook issue with PostCSS@8
     * @see https://github.com/storybookjs/storybook/issues/12668#issuecomment-773958085
     */
    {
      name: "@storybook/addon-styling",
      options: {
        postCss: true,
      },
    },
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
