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

import { tokenGetData } from "@lightdotso/demo";
import type { Meta, StoryObj } from "@storybook/react";
import { TokenImage } from "./token-image";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof TokenImage> = {
  title: "element/TokenImage",
  component: TokenImage,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof TokenImage>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: (args) => <TokenImage token={tokenGetData} />,
  args: {},
};
export const isLoading: Story = {
  render: (args) => <TokenImage isLoading token={tokenGetData} />,
  args: {},
};
export const NotFound: Story = {
  render: (args) => (
    <TokenImage
      token={{
        ...tokenGetData,
        address: "0x59b8eF31a1F76d17bc67C18a304E967B34fd7100",
      }}
    />
  ),
  args: {},
};
export const WithChainLogo: Story = {
  render: (args) => <TokenImage withChainLogo token={tokenGetData} />,
  args: {},
};
export const WithChainLogoTestnet: Story = {
  render: (args) => (
    <TokenImage
      withChainLogo
      token={{ ...tokenGetData, chain_id: 11155111 }}
      size="sm"
    />
  ),
  args: {},
};
export const WithChainLogoIsLoading: Story = {
  render: (args) => <TokenImage withChainLogo isLoading token={tokenGetData} />,
  args: {},
};
export const WithChainLogoNotFound: Story = {
  render: (args) => (
    <TokenImage
      withChainLogo
      token={{
        ...tokenGetData,
        address: "0x59b8eF31a1F76d17bc67C18a304E967B34fd7100",
      }}
    />
  ),
  args: {},
};
