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

import "@lightdotso/styles/global.css";
import { Toaster, ReactQueryProvider, Web3Provider } from "@lightdotso/ui";
import type { Preview } from "@storybook/react";
import {
  INITIAL_VIEWPORTS,
  MINIMAL_VIEWPORTS,
} from "@storybook/addon-viewport";
import * as React from "react";
import { initialize, mswLoader } from "msw-storybook-addon";

initialize();

export const decorators = [
  Story => (
    <ReactQueryProvider showDevTools={false}>
      <Web3Provider>
        <Story />
      </Web3Provider>
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
        order: ["theme", "component", "svg", "element", "template", "table"],
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
