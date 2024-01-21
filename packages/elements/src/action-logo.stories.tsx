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
  render: args => <ActionLogo action={Action.NATIVE_RECEIVE} />,
  args: {},
};
export const NATIVE_SEND: Story = {
  render: args => <ActionLogo action={Action.NATIVE_SEND} />,
  args: {},
};
export const ERC20_APPROVE: Story = {
  render: args => <ActionLogo action={Action.ERC20_APPROVE} />,
  args: {},
};
export const ERC20_RECEIVE: Story = {
  render: args => <ActionLogo action={Action.ERC20_RECEIVE} />,
  args: {},
};
export const ERC20_SEND: Story = {
  render: args => <ActionLogo action={Action.ERC20_SEND} />,
  args: {},
};
export const ERC20_MINT: Story = {
  render: args => <ActionLogo action={Action.ERC20_MINT} />,
  args: {},
};
export const ERC20_BURN: Story = {
  render: args => <ActionLogo action={Action.ERC20_BURN} />,
  args: {},
};
export const ERC721_APPROVE: Story = {
  render: args => <ActionLogo action={Action.ERC721_APPROVE} />,
  args: {},
};
export const ERC721_RECEIVE: Story = {
  render: args => <ActionLogo action={Action.ERC721_RECEIVE} />,
  args: {},
};
export const ERC721_SEND: Story = {
  render: args => <ActionLogo action={Action.ERC721_SEND} />,
  args: {},
};
export const ERC721_MINT: Story = {
  render: args => <ActionLogo action={Action.ERC721_MINT} />,
  args: {},
};
export const ERC721_BURN: Story = {
  render: args => <ActionLogo action={Action.ERC721_BURN} />,
  args: {},
};
export const ERC1155_APPROVE: Story = {
  render: args => <ActionLogo action={Action.ERC1155_APPROVE} />,
  args: {},
};
export const ERC1155_RECEIVE: Story = {
  render: args => <ActionLogo action={Action.ERC1155_RECEIVE} />,
  args: {},
};
export const ERC1155_SEND: Story = {
  render: args => <ActionLogo action={Action.ERC1155_SEND} />,
  args: {},
};
export const ERC1155_MINT: Story = {
  render: args => <ActionLogo action={Action.ERC1155_MINT} />,
  args: {},
};
export const ERC1155_BURN: Story = {
  render: args => <ActionLogo action={Action.ERC1155_BURN} />,
  args: {},
};
