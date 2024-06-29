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

import type { Meta, StoryObj } from "@storybook/react";
import { Mail } from "lucide-react";
import { Button } from "./button";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Button> = {
  title: "component/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Button>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

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
    isLoading: true,
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
      <Mail className="mr-2 size-4" /> Login with Email Button
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
      <Button {...args} isLoading>
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
      <Button {...args} isLoading>
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
export const Error: Story = {
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
      <Button {...args} isLoading>
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "error",
  },
};
export const Warning: Story = {
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
      <Button {...args} isLoading>
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "warning",
  },
};
export const Info: Story = {
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
      <Button {...args} isLoading>
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "info",
  },
};
export const Success: Story = {
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
      <Button {...args} isLoading>
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "success",
  },
};
export const Indigo: Story = {
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
      <Button {...args} isLoading>
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "indigo",
  },
};
export const Pink: Story = {
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
      <Button {...args} isLoading>
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "pink",
  },
};
export const Purple: Story = {
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
      <Button {...args} isLoading>
        Loading
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
  args: {
    intent: "purple",
  },
};
