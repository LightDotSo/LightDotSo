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
import { TimeAgo } from "./time-ago";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof TimeAgo> = {
  title: "component/TimeAgo",
  component: TimeAgo,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof TimeAgo>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: (args) => <TimeAgo value={new Date()} {...args} />,
  args: {},
};
// export const Prefix: Story = {
//   render: args => <TimeAgo value={new Date("")} {...args} />,
//   args: {},
// };
// export const Large: Story = {
//   render: args => <TimeAgo value={100_000_000} {...args} />,
//   args: {},
// };
// export const Neutral: Story = {
//   render: args => <TimeAgo value={300} {...args} />,
//   args: {
//   },
// };
