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
import { useState } from "react";
import { Button } from "./button";
import { Number } from "./number";

const meta: Meta<typeof Number> = {
  title: "ui/Number",
  component: Number,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Number>;

export const Base: Story = {
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let [value, setValue] = useState(300.0);

    return (
      <div className="space-x-3">
        <Button onClick={() => setValue(value - 10)}>Decrease</Button>
        <Button onClick={() => setValue(value + 10)}>Increment</Button>
        <Number value={value} {...args} id="terms1" />
      </div>
    );
  },
  args: {},
};

export const Prefix: Story = {
  render: args => <Number value={100_000_000} {...args} prefix="$" />,
  args: {},
};
export const Large: Story = {
  render: args => <Number value={100_000_000} {...args} size="xl" />,
  args: {},
};
export const Neutral: Story = {
  render: args => <Number value={300} {...args} />,
  args: {
    variant: "neutral",
  },
};
