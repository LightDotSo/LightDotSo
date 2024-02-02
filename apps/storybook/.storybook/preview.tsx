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

import { Toaster, ReactQueryProvider, Web3Provider } from "@lightdotso/ui";
import { DocsContainer as BaseContainer } from "@storybook/addon-docs";
import {
  INITIAL_VIEWPORTS,
  MINIMAL_VIEWPORTS,
} from "@storybook/addon-viewport";
import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import { initialize, mswLoader } from "msw-storybook-addon";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useEffect } from "react";
import * as React from "react";
import { useDarkMode } from "storybook-dark-mode";
import "./global.css";

// From: https://raw.githubusercontent.com/bendigiorgio/kiso/9de5ae4b8f9d6cab3210fdd8bbe61a5ff47243c0/src/docs/.storybook/DocContainer.tsx
// License: MIT

export const DocsContainer: typeof BaseContainer = ({ children, context }) => {
  const dark = useDarkMode();

  useEffect(() => {
    const { darkClass, lightClass } =
      // @ts-ignore
      context.store.projectAnnotations.parameters.darkMode;
    const [addClass, removeClass] = dark
      ? [darkClass, lightClass]
      : [lightClass, darkClass];
    document.body.classList.remove(removeClass);
    document.body.classList.add(addClass);
  }, [dark]);

  return (
    <BaseContainer context={context} theme={dark ? themes.dark : themes.light}>
      {children}
    </BaseContainer>
  );
};

initialize();

export const decorators = [
  Story => (
    <AppRouterContext.Provider value={{} as AppRouterInstance}>
      <ReactQueryProvider>
        <Web3Provider>
          <Story />
        </Web3Provider>
        <Toaster />
      </ReactQueryProvider>
    </AppRouterContext.Provider>
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
    },
    options: {
      storySort: {
        order: [
          "theme",
          "component",
          "svg",
          "element",
          "modal",
          "template",
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
  loaders: [mswLoader],
};

export default preview;
