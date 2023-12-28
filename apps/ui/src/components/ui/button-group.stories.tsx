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
import { Button } from "./button";
import { ButtonGroup } from "./button-group";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof ButtonGroup> = {
  title: "ui/ButtonGroup",
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
      <Button size="sm">First</Button>
      <Button size="sm" variant="ghost">
        Second
      </Button>
      <Button size="sm" variant="ghost">
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
