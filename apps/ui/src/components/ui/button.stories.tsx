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
import { Mail } from "lucide-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "ui/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Base: Story = {
  render: args => <Button {...args}>Base</Button>,
  args: {},
};
export const Shadow: Story = {
  render: args => <Button {...args}>Shadow</Button>,
  args: {
    variant: "shadow",
  },
};
export const Outline: Story = {
  render: args => <Button {...args}>Outline</Button>,
  args: {
    variant: "outline",
  },
};
export const Ghost: Story = {
  render: args => <Button {...args}>Ghost</Button>,
  args: {
    variant: "ghost",
  },
};
export const Link: Story = {
  render: args => <Button {...args}>Link</Button>,
  args: {
    variant: "link",
  },
};
export const Loading: Story = {
  render: args => <Button {...args}>Loading</Button>,
  args: {
    variant: "loading",
  },
};
export const Disabled: Story = {
  render: args => <Button {...args}>Disabled</Button>,
  args: {
    disabled: true,
  },
};
export const WithIcon: Story = {
  render: args => (
    <Button {...args}>
      <Mail className="mr-2 h-4 w-4" /> Login with Email Button
    </Button>
  ),
};
export const Default: Story = {
  render: args => (
    <div className="flex items-center space-x-2">
      <Button {...args} variant="default">
        Default
      </Button>
      <Button {...args} variant="shadow">
        Shadow
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
      <Button {...args} variant="loading">
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "default",
  },
};
export const Destructive: Story = {
  render: args => (
    <div className="flex items-center space-x-2">
      <Button {...args} variant="default">
        Default
      </Button>
      <Button {...args} variant="shadow">
        Shadow
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
      <Button {...args} variant="loading">
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "destructive",
  },
};
