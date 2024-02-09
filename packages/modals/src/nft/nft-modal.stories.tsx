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
import type { NftModalProps } from "@lightdotso/stores";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { NftModal } from "./nft-modal";
import { Address } from "viem";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof NftModal> = {
  title: "modal/NftModal",
  component: NftModal,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof NftModal>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

const nftModalProps: NftModalProps = {
  address: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed" as Address,
  isTestnet: false,
  onClose: () => {},
  onNftSelect: () => {},
};

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: () => {
    const { showNftModal, setNftModalProps } = useModals();

    useEffect(() => {
      setNftModalProps(nftModalProps);
      showNftModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <NftModal />;
  },
  args: {},
};
export const Empty: Story = {
  render: () => {
    const { showTokenModal, setNftModalProps } = useModals();

    useEffect(() => {
      setNftModalProps({
        ...nftModalProps,
        address: "0x07beCa880a83b93983604157fefCC57377977300",
      });
      showTokenModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <NftModal />;
  },
  args: {},
};
