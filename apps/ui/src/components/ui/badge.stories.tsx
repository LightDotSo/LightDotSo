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

const meta: Meta<typeof Badge> = {
  title: "ui/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Base: Story = {
  render: args => <Badge {...args}>Badge</Badge>,
  args: {},
};
export const Destructive: Story = {
  render: args => <Badge {...args}>Badge</Badge>,
  args: {
    variant: "destructive",
  },
};
export const Warning: Story = {
  render: args => <Badge {...args}>Badge</Badge>,
  args: {
    variant: "warning",
  },
};
export const Error: Story = {
  render: args => <Badge {...args}>Badge</Badge>,
  args: {
    variant: "error",
  },
};
export const Info: Story = {
  render: args => <Badge {...args}>Badge</Badge>,
  args: {
    variant: "info",
  },
};
export const Outline: Story = {
  render: args => <Badge {...args}>Badge</Badge>,
  args: {
    variant: "outline",
  },
};
