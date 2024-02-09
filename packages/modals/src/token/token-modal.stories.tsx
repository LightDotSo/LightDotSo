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

/* eslint-disable react-hooks/rules-of-hooks */

import { useModals } from "@lightdotso/stores";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { TokenModal } from "./token-modal";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof TokenModal> = {
  title: "modal/TokenModal",
  component: TokenModal,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof TokenModal>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: () => {
    const { showTokenModal, setTokenModalProps } = useModals();

    useEffect(() => {
      setTokenModalProps({
        address: "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F" as Address,
        type: "native",
      });
      showTokenModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <TokenModal />;
  },
  args: {},
};
export const Socket: Story = {
  render: () => {
    const { showTokenModal, setTokenModalProps } = useModals();

    useEffect(() => {
      setTokenModalProps({
        address: "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F" as Address,
        type: "socket",
      });
      showTokenModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <TokenModal />;
  },
  args: {},
};
