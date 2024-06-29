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
import { Button } from "./button";
import { Label } from "./label";
import { Textarea } from "./textarea";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Textarea> = {
  title: "component/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Textarea>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Default: Story = {
  render: args => <Textarea {...args} />,
  args: {
    placeholder: "Type your message here.",
  },
};

export const Disabled: Story = {
  render: args => <Textarea {...args} />,
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: args => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea {...args} id="message" />
    </div>
  ),
  args: { ...Default.args },
};

export const WithText: Story = {
  render: args => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message-2">Your Message</Label>
      <Textarea {...args} id="message-2" />
      <p className="text-sm text-text-primary">
        Your message will be copied to the support team.
      </p>
    </div>
  ),
  args: { ...Default.args },
};

export const WithButton: Story = {
  render: args => (
    <div className="grid w-full gap-2">
      <Textarea {...args} />
      <Button>Send message</Button>
    </div>
  ),
  args: { ...Default.args },
};
