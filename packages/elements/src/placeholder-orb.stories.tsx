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

import { Avatar } from "@lightdotso/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { PlaceholderOrb } from "./placeholder-orb";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof PlaceholderOrb> = {
  title: "element/PlaceholderOrb",
  component: PlaceholderOrb,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof PlaceholderOrb>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => (
    <Avatar className="size-6">
      <PlaceholderOrb {...args} />
    </Avatar>
  ),
  args: {
    address: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed",
  },
};
