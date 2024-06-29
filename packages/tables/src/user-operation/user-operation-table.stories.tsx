// Copyright 2023-2024 Light.
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
      isTestnet={false}
      data={userOperationListData}
      configuration={configurationGetData}
    />
  ),
  args: {},
};
export const Null: Story = {
  render: args => (
    <UserOperationTable
      isLoading={false}
      pageSize={10}
      address={null}
      isTestnet={false}
      data={userOperationListData}
      configuration={configurationGetData}
    />
  ),
  args: {},
};
