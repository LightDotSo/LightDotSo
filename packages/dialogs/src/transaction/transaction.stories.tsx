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
import { TransactionDialog } from "./transaction";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof TransactionDialog> = {
  title: "dialog/TransactionDialog",
  component: TransactionDialog,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof TransactionDialog>;

// -----------------------------------------------------------------------------
// MSW
// -----------------------------------------------------------------------------

if (typeof window !== "undefined") {
  const { worker } = await import("@lightdotso/msw");
  worker.start();
}

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: (_args) => (
    <TransactionDialog address="0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F" />
  ),
  args: {},
};
