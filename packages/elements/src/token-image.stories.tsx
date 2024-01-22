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

import { tokenGetData } from "@lightdotso/demo";
import type { Meta, StoryObj } from "@storybook/react";
import { TokenImage } from "./token-image";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof TokenImage> = {
  title: "element/TokenImage",
  component: TokenImage,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof TokenImage>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => <TokenImage token={tokenGetData} />,
  args: {},
};
export const NotFound: Story = {
  render: args => (
    <TokenImage
      token={{
        ...tokenGetData,
        address: "0x59b8eF31a1F76d17bc67C18a304E967B34fd7100",
      }}
    />
  ),
  args: {},
};
