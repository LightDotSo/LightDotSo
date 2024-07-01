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

import type { NftData, TokenData } from "@lightdotso/data";
import type { Address } from "viem";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Owner = {
  address?: Address;
  addressOrEns?: string;
  weight: number;
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type AddressModalProps = {
  addressOrEns: string;
  isTestnet?: boolean;
  onClose?: () => void;
  onAddressSelect: ({
    address,
    addressOrEns,
  }: {
    address: string;
    addressOrEns: string;
  }) => void;
};

export type CartModalProps = {
  onClose?: () => void;
};

export type ChainModalProps = {
  onClose?: () => void;
  onChainSelect: (chainId: number) => void;
};

export type OwnerModalProps = {
  initialOwners: Owner[];
  initialThreshold: number;
  onClose?: () => void;
  onOwnerSelect: (address: Address) => void;
};

export type NftModalProps = {
  address: Address;
  isTestnet?: boolean;
  onClose?: () => void;
  onNftSelect: (nft: NftData) => void;
};

export type TokenModalProps = {
  address: Address;
  isTestnet?: boolean;
  onClose?: () => void;
  onTokenSelect: (token: TokenData) => void;
  type: "native" | "socket";
};

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type ModalsStore = {
  addressModalProps: AddressModalProps;
  setAddressModalProps: (props: AddressModalProps) => void;
  cartModalProps: CartModalProps;
  setCartModalProps: (props: CartModalProps) => void;
  chainModalProps: ChainModalProps;
  setChainModalProps: (props: ChainModalProps) => void;
  ownerModalProps: OwnerModalProps;
  setOwnerModalProps: (props: OwnerModalProps) => void;
  nftModalProps: NftModalProps;
  setNftModalProps: (props: NftModalProps) => void;
  tokenModalProps: TokenModalProps;
  setTokenModalProps: (props: TokenModalProps) => void;
  isAddressModalVisible: boolean;
  isAuthModalVisible: boolean;
  isCartModalVisible: boolean;
  isChainModalVisible: boolean;
  isConnectModalVisible: boolean;
  isCreateModalVisible: boolean;
  isDepositModalVisible: boolean;
  isNftModalVisible: boolean;
  isNotificationsModalVisible: boolean;
  isOpModalVisible: boolean;
  isOwnerModalVisible: boolean;
  isSendModalVisible: boolean;
  isTokenModalVisible: boolean;
  showAddressModal: () => void;
  hideAddressModal: () => void;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  showCartModal: () => void;
  hideCartModal: () => void;
  showChainModal: () => void;
  hideChainModal: () => void;
  showConnectModal: () => void;
  hideConnectModal: () => void;
  showCreateModal: () => void;
  hideCreateModal: () => void;
  showDepositModal: () => void;
  hideDepositModal: () => void;
  showOwnerModal: () => void;
  hideOwnerModal: () => void;
  showNftModal: () => void;
  hideNftModal: () => void;
  showNotificationsModal: () => void;
  hideNotificationsModal: () => void;
  showOpModal: () => void;
  hideOpModal: () => void;
  showSendModal: () => void;
  hideSendModal: () => void;
  showTokenModal: () => void;
  hideTokenModal: () => void;
  hideAllModals: () => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useModals = create(
  devtools<ModalsStore>(
    set => ({
      addressModalProps: {
        addressOrEns: "",
        isAddressModalVisible: false,
        onAddressSelect: () => {},
      },
      setAddressModalProps: (props: AddressModalProps) =>
        set({ addressModalProps: props }),
      cartModalProps: {
        onClose: () => {},
      },
      setCartModalProps: (props: CartModalProps) =>
        set({ cartModalProps: props }),
      chainModalProps: {
        chainId: "",
        isChainModalVisible: false,
        onChainSelect: () => {},
      },
      setChainModalProps: (props: ChainModalProps) =>
        set({ chainModalProps: props }),
      nftModalProps: {
        // @ts-expect-error
        address: "",
        isNftModalVisible: false,
        onNftSelect: () => {},
      },
      setNftModalProps: (props: NftModalProps) => set({ nftModalProps: props }),
      ownerModalProps: {
        initialOwners: [],
        initialThreshold: 1,
        isOwnerModalVisible: false,
        onOwnerSelect: () => {},
      },
      setOwnerModalProps: (props: OwnerModalProps) =>
        set({ ownerModalProps: props }),
      tokenModalProps: {
        // @ts-expect-error
        address: "",
        isTokenModalVisible: false,
        onTokenSelect: () => {},
        type: "native",
      },
      setTokenModalProps: (props: TokenModalProps) =>
        set({ tokenModalProps: props }),
      isAuthModalVisible: false,
      isChainModalVisible: false,
      isConnectModalVisible: false,
      isCreateModalVisible: false,
      isDepositModalVisible: false,
      isNftModalVisible: false,
      isNotificationsModalVisible: false,
      isOpModalVisible: false,
      isSendModalVisible: false,
      isTokenModalVisible: false,
      showAddressModal: () =>
        set({
          isAddressModalVisible: true,
        }),
      hideAddressModal: () => set({ isAddressModalVisible: false }),
      showAuthModal: () =>
        set({
          isAuthModalVisible: true,
        }),
      hideAuthModal: () => set({ isAuthModalVisible: false }),
      showCartModal: () =>
        set({
          isCartModalVisible: true,
        }),
      hideCartModal: () => set({ isCartModalVisible: false }),
      showChainModal: () =>
        set({
          isChainModalVisible: true,
        }),
      hideChainModal: () => set({ isChainModalVisible: false }),
      showConnectModal: () =>
        set({
          isConnectModalVisible: true,
        }),
      hideConnectModal: () => set({ isConnectModalVisible: false }),
      showCreateModal: () =>
        set({
          isCreateModalVisible: true,
        }),
      hideCreateModal: () => set({ isCreateModalVisible: false }),
      showDepositModal: () =>
        set({
          isDepositModalVisible: true,
        }),
      hideDepositModal: () => set({ isDepositModalVisible: false }),
      showNotificationsModal: () =>
        set({
          isNotificationsModalVisible: true,
        }),
      hideNotificationsModal: () => set({ isNotificationsModalVisible: false }),
      showOpModal: () =>
        set({
          isOpModalVisible: true,
        }),
      hideOpModal: () => set({ isOpModalVisible: false }),
      showNftModal: () =>
        set({
          isNftModalVisible: true,
        }),
      showOwnerModal: () =>
        set({
          isOwnerModalVisible: true,
        }),
      hideOwnerModal: () => set({ isOwnerModalVisible: false }),
      hideNftModal: () => set({ isNftModalVisible: false }),
      showSendModal: () =>
        set({
          isSendModalVisible: true,
        }),
      hideSendModal: () => set({ isSendModalVisible: false }),
      showTokenModal: () =>
        set({
          isTokenModalVisible: true,
        }),
      hideTokenModal: () => set({ isTokenModalVisible: false }),
      hideAllModals: () =>
        set({
          isAddressModalVisible: false,
          isAuthModalVisible: false,
          isChainModalVisible: false,
          isConnectModalVisible: false,
          isCreateModalVisible: false,
          isDepositModalVisible: false,
          isNftModalVisible: false,
          isNotificationsModalVisible: false,
          isOpModalVisible: false,
          isOwnerModalVisible: false,
          isSendModalVisible: false,
          isTokenModalVisible: false,
        }),
    }),
    {
      anonymousActionType: "useModals",
      name: "ModalsStore",
      serialize: { options: true },
    },
  ),
);
