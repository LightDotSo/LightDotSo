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
import { useState } from "react";
import { Button } from "./button";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Number } from "./number";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Number> = {
  title: "component/Number",
  component: Number,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Number>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState(300.0);

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
  render: (args) => <Number value={100_000_000} {...args} prefix="$" />,
  args: {},
};
export const Large: Story = {
  render: (args) => <Number value={100_000_000} {...args} size="xl" />,
  args: {},
};
export const Neutral: Story = {
  render: (args) => <Number value={300} {...args} />,
  args: {
    variant: "neutral",
  },
};
