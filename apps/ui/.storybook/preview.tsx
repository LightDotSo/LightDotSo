import type { Preview } from "@storybook/react";
import "@lightdotso/styles/global.css";
import * as React from "react";
import { Toaster } from "../src/components/ui/toast";

export const decorators = [
  Story => (
    <>
      <Story />
      <Toaster />
    </>
  ),
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    darkMode: {
      darkClass: "dark",
      lightClass: "light",
      stylePreview: true,
    },
  },
};

export default preview;
