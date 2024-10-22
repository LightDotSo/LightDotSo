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

import { Popover, PopoverTrigger } from "@lightdotso/ui/components/popover";
import type { Meta, StoryObj } from "@storybook/react";
import { BellIcon } from "lucide-react";
import { BadgeCountButton } from "./badge-count-button";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof BadgeCountButton> = {
  title: "template/BadgeCountButton",
  component: BadgeCountButton,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof BadgeCountButton>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: (_args) => (
    <Popover>
      <PopoverTrigger asChild>
        <BadgeCountButton count={0}>
          <BellIcon className="size-4" />
        </BadgeCountButton>
      </PopoverTrigger>
    </Popover>
  ),
  args: {},
};
export const WithNotifications: Story = {
  render: (args) => (
    <Popover>
      <PopoverTrigger asChild>
        <BadgeCountButton count={args.count}>
          <BellIcon className="size-4" />
        </BadgeCountButton>
      </PopoverTrigger>
    </Popover>
  ),
  args: {
    count: 1,
  },
};
