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

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof ButtonGroup> = {
  title: "component/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof ButtonGroup>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => (
    <ButtonGroup {...args}>
      <Button size="sm" variant="outline">
        First
      </Button>
      <Button size="sm" variant="outline">
        Second
      </Button>
      <Button size="sm" variant="outline">
        Third
      </Button>
    </ButtonGroup>
  ),
  args: {},
};
export const Unstyled: Story = {
  render: args => (
    <ButtonGroup {...args}>
      <Button size="sm">First</Button>
      <Button size="sm" variant="ghost">
        Second
      </Button>
      <Button size="sm" variant="ghost">
        Third
      </Button>
    </ButtonGroup>
  ),
  args: {
    variant: "unstyled",
  },
};
