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

import { Action } from "@lightdotso/const";
import type { Meta, StoryObj } from "@storybook/react";
import { ActionLogo } from "./action-logo";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof ActionLogo> = {
  title: "element/ActionLogo",
  component: ActionLogo,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof ActionLogo>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const NATIVE_RECEIVE: Story = {
  render: (_args) => <ActionLogo action={Action.NATIVE_RECEIVE} />,
  args: {},
};
export const NATIVE_SEND: Story = {
  render: (_args) => <ActionLogo action={Action.NATIVE_SEND} />,
  args: {},
};
export const ERC20_APPROVE: Story = {
  render: (_args) => <ActionLogo action={Action.ERC20_APPROVE} />,
  args: {},
};
export const ERC20_RECEIVE: Story = {
  render: (_args) => <ActionLogo action={Action.ERC20_RECEIVE} />,
  args: {},
};
export const ERC20_SEND: Story = {
  render: (_args) => <ActionLogo action={Action.ERC20_SEND} />,
  args: {},
};
export const ERC20_MINT: Story = {
  render: (_args) => <ActionLogo action={Action.ERC20_MINT} />,
  args: {},
};
export const ERC20_BURN: Story = {
  render: (_args) => <ActionLogo action={Action.ERC20_BURN} />,
  args: {},
};
export const ERC721_APPROVE: Story = {
  render: (_args) => <ActionLogo action={Action.ERC721_APPROVE} />,
  args: {},
};
export const ERC721_RECEIVE: Story = {
  render: (_args) => <ActionLogo action={Action.ERC721_RECEIVE} />,
  args: {},
};
export const ERC721_SEND: Story = {
  render: (_args) => <ActionLogo action={Action.ERC721_SEND} />,
  args: {},
};
export const ERC721_MINT: Story = {
  render: (_args) => <ActionLogo action={Action.ERC721_MINT} />,
  args: {},
};
export const ERC721_BURN: Story = {
  render: (_args) => <ActionLogo action={Action.ERC721_BURN} />,
  args: {},
};
export const ERC1155_APPROVE: Story = {
  render: (_args) => <ActionLogo action={Action.ERC1155_APPROVE} />,
  args: {},
};
export const ERC1155_RECEIVE: Story = {
  render: (_args) => <ActionLogo action={Action.ERC1155_RECEIVE} />,
  args: {},
};
export const ERC1155_SEND: Story = {
  render: (_args) => <ActionLogo action={Action.ERC1155_SEND} />,
  args: {},
};
export const ERC1155_MINT: Story = {
  render: (_args) => <ActionLogo action={Action.ERC1155_MINT} />,
  args: {},
};
export const ERC1155_BURN: Story = {
  render: (_args) => <ActionLogo action={Action.ERC1155_BURN} />,
  args: {},
};
