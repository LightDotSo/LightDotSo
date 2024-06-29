// Copyright 2023-2024 Light
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

import { Popover, PopoverTrigger } from "@lightdotso/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { NotificationComboDialogIcon } from "./notification-combo-dialog-icon";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof NotificationComboDialogIcon> = {
  title: "template/NotificationComboDialog/NotificationComboDialogIcon",
  component: NotificationComboDialogIcon,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof NotificationComboDialogIcon>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => (
    <Popover>
      <PopoverTrigger>
        <NotificationComboDialogIcon notificationsCount={0} />
      </PopoverTrigger>
    </Popover>
  ),
  args: {},
};
export const WithNotifications: Story = {
  render: args => (
    <Popover>
      <PopoverTrigger>
        <NotificationComboDialogIcon notificationsCount={1} />
      </PopoverTrigger>
    </Popover>
  ),
  args: {},
};
