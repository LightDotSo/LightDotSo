import "@lightdotso/styles/global.css";
import { Toaster, ReactQueryProvider } from "@lightdotso/ui";
import type { Preview } from "@storybook/react";
import {
  INITIAL_VIEWPORTS,
  MINIMAL_VIEWPORTS,
} from "@storybook/addon-viewport";
import * as React from "react";

export const decorators = [
  Story => (
    <ReactQueryProvider showDevTools={false}>
      <Story />
      <Toaster />
    </ReactQueryProvider>
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
    options: {
      storySort: {
        order: ["theme", "ui", "template", "table"],
      },
    },
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        ...MINIMAL_VIEWPORTS,
      },
    },
  },
};

export default preview;
