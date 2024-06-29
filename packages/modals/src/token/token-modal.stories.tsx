// Copyright 2023-2024 Light
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

/* eslint-disable react-hooks/rules-of-hooks */

import { useModals } from "@lightdotso/stores";
import type { TokenModalProps } from "@lightdotso/stores";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import type { Address } from "viem";
import { TokenModal } from "./token-modal";

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
// Props
// -----------------------------------------------------------------------------

const tokenModalProps: TokenModalProps = {
  address: "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F" as Address,
  isTestnet: false,
  onClose: () => {},
  onTokenSelect: () => {},
  type: "native",
};

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: () => {
    const { showTokenModal, setTokenModalProps } = useModals();

    useEffect(() => {
      setTokenModalProps(tokenModalProps);
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
      setTokenModalProps({ ...tokenModalProps, type: "socket" });
      showTokenModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <TokenModal />;
  },
  args: {},
};
export const Empty: Story = {
  render: () => {
    const { showTokenModal, setTokenModalProps } = useModals();

    useEffect(() => {
      setTokenModalProps({
        ...tokenModalProps,
        address: "0x07beCa880a83b93983604157fefCC57377977300",
      });
      showTokenModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <TokenModal />;
  },
  args: {},
};
