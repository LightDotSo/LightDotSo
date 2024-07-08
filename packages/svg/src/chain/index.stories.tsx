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
import { ChainLogo } from "./index";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof ChainLogo> = {
  title: "svg/ChainLogo",
  component: ChainLogo,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof ChainLogo>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Ethereum: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 1,
  },
};
export const Arbitrum: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 42161,
  },
};
export const Avalanche: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 43114,
  },
};
export const Base: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 8453,
  },
};
export const Bsc: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 56,
  },
};
export const Gnosis: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 100,
  },
};
export const Optimism: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 10,
  },
};
export const Polygon: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 137,
  },
};
export const Sepolia: Story = {
  render: args => <ChainLogo {...args} />,
  args: {
    chainId: 11155111,
  },
};
