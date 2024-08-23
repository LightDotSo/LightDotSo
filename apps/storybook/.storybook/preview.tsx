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
import {
  INITIAL_VIEWPORTS,
  MINIMAL_VIEWPORTS,
} from "@storybook/addon-viewport";
import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import { useEffect } from "react";
import { useDarkMode } from "./useDarkMode";
// import { mswLoader } from "msw-storybook-addon";

// From: https://raw.githubusercontent.com/bendigiorgio/kiso/9de5ae4b8f9d6cab3210fdd8bbe61a5ff47243c0/src/docs/.storybook/DocContainer.tsx
// License: MIT

export const DocsContainer: typeof BaseContainer = ({ children, context }) => {
  // ---------------------------------------------------------------------------
  // Theme Hooks
  // ---------------------------------------------------------------------------

  const isDark = useDarkMode();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const { darkClass, lightClass } =
      // @ts-ignore
      context.store.projectAnnotations.parameters.darkMode;
    const [addClass, removeClass] = isDark
      ? [darkClass, lightClass]
      : [lightClass, darkClass];
    document.body.classList.remove(removeClass);
    document.body.classList.add(addClass);
  }, [isDark]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <BaseContainer
      context={context}
      theme={isDark ? themes.dark : themes.light}
    >
      {children}
    </BaseContainer>
  );
};

export const decorators = [
  (Story) => (
    <div style={{}}>
      <Story />
    </div>
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
