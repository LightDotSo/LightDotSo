// Copyright 2023-2024 Light.
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
