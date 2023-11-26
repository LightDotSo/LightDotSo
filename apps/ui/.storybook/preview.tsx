import type { Preview } from "@storybook/react";
import "@lightdotso/styles/global.css";
import * as React from "react";
import { ToastProvider } from "../src/components/ui/toast";
import { Toaster } from "../src/components/ui/toaster";

export const decorators = [
  Story => (
    <ToastProvider>
      <Story />
      <Toaster />
    </ToastProvider>
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
