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
