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

import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Badge> = {
  title: "component/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Badge>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Single: Story = {
  render: args => <Badge {...args}>Default</Badge>,
  args: {
    variant: "default",
  },
};
export const Default: Story = {
  render: args => (
    <div className="flex items-center space-x-2">
      <Badge {...args} intent="default">
        Default
      </Badge>
      <Badge {...args} intent="destructive">
        Destructive
      </Badge>
      <Badge {...args} intent="error">
        Error
      </Badge>
      <Badge {...args} intent="warning">
        Warning
      </Badge>
      <Badge {...args} intent="info">
        Info
      </Badge>
      <Badge {...args} intent="success">
        Success
      </Badge>
      <Badge {...args} intent="indigo">
        Indigo
      </Badge>
      <Badge {...args} intent="pink">
        Pink
      </Badge>
      <Badge {...args} intent="purple">
        Purple
      </Badge>
    </div>
  ),
  args: {
    variant: "default",
  },
};
export const Shadow: Story = {
  render: args => (
    <div className="flex items-center space-x-2">
      <Badge {...args} intent="default">
        Default
      </Badge>
      <Badge {...args} intent="destructive">
        Destructive
      </Badge>
      <Badge {...args} intent="error">
        Error
      </Badge>
      <Badge {...args} intent="warning">
        Warning
      </Badge>
      <Badge {...args} intent="info">
        Info
      </Badge>
      <Badge {...args} intent="success">
        Success
      </Badge>
      <Badge {...args} intent="indigo">
        Indigo
      </Badge>
      <Badge {...args} intent="pink">
        Pink
      </Badge>
      <Badge {...args} intent="purple">
        Purple
      </Badge>
    </div>
  ),
  args: {
    variant: "shadow",
  },
};
export const Size: Story = {
  render: args => (
    <div className="flex items-center space-x-2">
      <Badge {...args} size="sm">
        Small
      </Badge>
      <Badge {...args} size="md">
        Medium
      </Badge>
      <Badge {...args} size="lg">
        Large
      </Badge>
    </div>
  ),
  args: {
    variant: "default",
  },
};
export const Type: Story = {
  render: args => (
    <div className="flex items-center space-x-2">
      <Badge {...args} type="number">
        1
      </Badge>
      <Badge {...args} type="number">
        300
      </Badge>
      <Badge {...args} type="text">
        Text
      </Badge>
    </div>
  ),
  args: {
    variant: "default",
  },
};
