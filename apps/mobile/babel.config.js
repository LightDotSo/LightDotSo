module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxRuntime: "automatic" }]],
    plugins: [
      require.resolve("expo-router/babel"),
      [
        require.resolve("babel-plugin-module-resolver"),
        {
          root: ["../.."],
          alias: {
            // define aliases to shorten the import paths
            "@lightdotso/screens": "../../packages/screens",
            "@lightdotso/ui": "../../packages/ui",
          },
          extensions: [".js", ".jsx", ".tsx", ".ios.js", ".android.js"],
        },
      ],
      // if you want reanimated support
      "react-native-reanimated/plugin",
      ...(process.env.EAS_BUILD_PLATFORM === "android"
        ? []
        : [
            [
              "@tamagui/babel-plugin",
              {
                components: ["@lightdotso/ui", "tamagui"],
                config: "./tamagui.config.ts",
              },
            ],
          ]),
      [
        "transform-inline-environment-variables",
        {
          include: "TAMAGUI_TARGET",
        },
      ],
    ],
  };
};
