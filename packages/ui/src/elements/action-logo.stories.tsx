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
import { ActionLogo } from "./action-logo";
import { Action } from "@lightdotso/const";

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

export const ERC20_APPROVE: Story = {
  render: args => <ActionLogo action={Action.ERC20_APPROVE} />,
  args: {},
};
export const ERC20_RECEIVE: Story = {
  render: args => <ActionLogo action={Action.ERC20_RECEIVE} />,
  args: {},
};
export const ERC20_TRANSFER: Story = {
  render: args => <ActionLogo action={Action.ERC20_TRANSFER} />,
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
export const ERC721_TRANSFER: Story = {
  render: args => <ActionLogo action={Action.ERC721_TRANSFER} />,
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
export const ERC1155_TRANSFER: Story = {
  render: args => <ActionLogo action={Action.ERC1155_TRANSFER} />,
  args: {},
};
export const ERC1155_BATCH_APPROVE: Story = {
  render: args => <ActionLogo action={Action.ERC1155_BATCH_APPROVE} />,
  args: {},
};
export const ERC1155_BATCH_RECEIVE: Story = {
  render: args => <ActionLogo action={Action.ERC1155_BATCH_RECEIVE} />,
  args: {},
};
export const ERC1155_BATCH_TRANSFER: Story = {
  render: args => <ActionLogo action={Action.ERC1155_BATCH_TRANSFER} />,
  args: {},
};
