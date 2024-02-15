// Copyright 2023-2024 Light, Inc.
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

import { tokenListData } from "@lightdotso/demo";
import { handlers } from "@lightdotso/msw";
import type { Meta, StoryObj } from "@storybook/react";
import { TokenTable } from "./token-table";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof TokenTable> = {
  title: "table/TokenTable",
  component: TokenTable,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof TokenTable>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  parameters: {
    msw: {
      handlers: handlers,
    },
  },
  render: args => (
    <TokenTable isLoading={false} pageSize={10} data={tokenListData} />
  ),
  args: {},
};
