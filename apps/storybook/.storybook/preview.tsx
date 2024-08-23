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

import "reactflow/dist/style.css";
import "./global.css";
import { DocsContainer as BaseContainer } from "@storybook/addon-docs";
import { withThemeFromJSXProvider } from "@storybook/addon-themes";
import {
  INITIAL_VIEWPORTS,
  MINIMAL_VIEWPORTS,
} from "@storybook/addon-viewport";
import type { Preview } from "@storybook/react";
import { ThemeProvider } from "@storybook/theming";
// import { mswLoader } from "msw-storybook-addon";

// From: https://raw.githubusercontent.com/bendigiorgio/kiso/9de5ae4b8f9d6cab3210fdd8bbe61a5ff47243c0/src/docs/.storybook/DocContainer.tsx
// License: MIT

export const DocsContainer: typeof BaseContainer = ({ children, context }) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   const { darkClass, lightClass } =
  //     // @ts-ignore
  //     context.store.projectAnnotations.parameters.darkMode;
  //   const [addClass, removeClass] = dark
  //     ? [darkClass, lightClass]
  //     : [lightClass, darkClass];
  //   document.body.classList.remove(removeClass);
  //   document.body.classList.add(addClass);
  // }, [dark]);

  return <BaseContainer context={context}>{children}</BaseContainer>;
};

const THEME = {
  typography: {
    fonts: {
      base: "Arial, sans-serif",
      mono: "Courier, monospace",
    },
  },
};

const preview: Preview = {
  decorators: [
    withThemeFromJSXProvider({
      themes: {
        dark: THEME,
        light: THEME,
      },
      defaultTheme: "dark",
      Provider: ThemeProvider,
    }),
  ],
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
    decorators: [
      (story) => {
        return <>{story()}</>;
      },
    ],
    nextjs: {
      appDirectory: true,
    },
    docs: {
      container: DocsContainer,
      toc: true,
    },
    options: {
      storySort: {
        order: [
          "theme",
          "typography",
          "component",
          "svg",
          "element",
          "flow",
          "form",
          "modal",
          "template",
          "dialog",
          "table",
        ],
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
