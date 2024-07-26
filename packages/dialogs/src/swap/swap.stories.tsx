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

import { TokenModal } from "@lightdotso/modals/src/token/token-modal";
import { useAuth } from "@lightdotso/stores";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { SwapDialog } from "./swap";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof SwapDialog> = {
  title: "dialog/SwapDialog",
  component: SwapDialog,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof SwapDialog>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: () => {
    const { setAddress } = useAuth();

    useEffect(() => {
      setAddress("0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <>
        <SwapDialog />
        <TokenModal />
      </>
    );
  },
  args: {},
};
