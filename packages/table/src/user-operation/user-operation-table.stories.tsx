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

import { configurationGetData, userOperationListData } from "@lightdotso/demo";
import type { Meta, StoryObj } from "@storybook/react";
import type { Address } from "viem";
import { UserOperationTable } from "./user-operation-table";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof UserOperationTable> = {
  title: "table/UserOperationTable",
  component: UserOperationTable,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof UserOperationTable>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => (
    <UserOperationTable
      isLoading={false}
      pageSize={10}
      address={"0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F" as Address}
      data={userOperationListData}
      configuration={configurationGetData}
    />
  ),
  args: {},
};
