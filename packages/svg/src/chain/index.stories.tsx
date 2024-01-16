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
