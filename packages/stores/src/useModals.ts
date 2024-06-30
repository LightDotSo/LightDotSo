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
  isAddressModalBackground: boolean;
  isAuthModalBackground: boolean;
  isCartModalBackground: boolean;
  isChainModalBackground: boolean;
  isConnectModalBackground: boolean;
  isCreateModalBackground: boolean;
  isDepositModalBackground: boolean;
  isNftModalBackground: boolean;
  isNotificationsModalBackground: boolean;
  isOpModalBackground: boolean;
  isOwnerModalBackground: boolean;
  isSendModalBackground: boolean;
  isTokenModalBackground: boolean;
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
  setAddressModalBackground: (isBackground: boolean) => void;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  setAuthBackgroundModal: (isBackground: boolean) => void;
  showCartModal: () => void;
  hideCartModal: () => void;
  setCartBackgroundModal: (isBackground: boolean) => void;
  showChainModal: () => void;
  hideChainModal: () => void;
  setChainBackgroundModal: (isBackground: boolean) => void;
  showConnectModal: () => void;
  hideConnectModal: () => void;
  setConnectBackgroundModal: (isBackground: boolean) => void;
  showCreateModal: () => void;
  hideCreateModal: () => void;
  setCreateBackgroundModal: (isBackground: boolean) => void;
  showDepositModal: () => void;
  hideDepositModal: () => void;
  setDepositBackgroundModal: (isBackground: boolean) => void;
  showOwnerModal: () => void;
  hideOwnerModal: () => void;
  setOwnerBackgroundModal: (isBackground: boolean) => void;
  showNftModal: () => void;
  hideNftModal: () => void;
  setNftBackgroundModal: (isBackground: boolean) => void;
  showNotificationsModal: () => void;
  hideNotificationsModal: () => void;
  setNotificationsBackgroundModal: (isBackground: boolean) => void;
  showOpModal: () => void;
  hideOpModal: () => void;
  setOpBackgroundModal: (isBackground: boolean) => void;
  showSendModal: () => void;
  hideSendModal: () => void;
  setSendBackgroundModal: (isBackground: boolean) => void;
  showTokenModal: () => void;
  hideTokenModal: () => void;
  setTokenBackgroundModal: (isBackground: boolean) => void;
  hideAllModals: () => void;
  hideAllModalsBackground: () => void;
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
      isAddressModalBackground: false,
      isAuthModalBackground: false,
      isChainModalBackground: false,
      isConnectModalBackground: false,
      isCreateModalBackground: false,
      isDepositModalBackground: false,
      isNftModalBackground: false,
      isNotificationsModalBackground: false,
      isOpModalBackground: false,
      isSendModalBackground: false,
      isTokenModalBackground: false,
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
      setAddressModalBackground: (isBackground: boolean) =>
        set({ isAddressModalBackground: isBackground }),
      showAuthModal: () =>
        set({
          isAuthModalVisible: true,
        }),
      hideAuthModal: () => set({ isAuthModalVisible: false }),
      setAuthBackgroundModal: (isBackground: boolean) =>
        set({ isAuthModalBackground: isBackground }),
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
      setChainBackgroundModal: (isBackground: boolean) =>
        set({ isChainModalBackground: isBackground }),
      showConnectModal: () =>
        set({
          isConnectModalVisible: true,
        }),
      hideConnectModal: () => set({ isConnectModalVisible: false }),
      setConnectBackgroundModal: (isBackground: boolean) =>
        set({ isConnectModalBackground: isBackground }),
      showCreateModal: () =>
        set({
          isCreateModalVisible: true,
        }),
      hideCreateModal: () => set({ isCreateModalVisible: false }),
      setCreateBackgroundModal: (isBackground: boolean) =>
        set({ isCreateModalBackground: isBackground }),
      showDepositModal: () =>
        set({
          isDepositModalVisible: true,
        }),
      hideDepositModal: () => set({ isDepositModalVisible: false }),
      setDepositBackgroundModal: (isBackground: boolean) =>
        set({ isDepositModalBackground: isBackground }),
      showNotificationsModal: () =>
        set({
          isNotificationsModalVisible: true,
        }),
      hideNotificationsModal: () => set({ isNotificationsModalVisible: false }),
      setNotificationsBackgroundModal: (isBackground: boolean) =>
        set({ isNftModalBackground: isBackground }),
      showOpModal: () =>
        set({
          isOpModalVisible: true,
        }),
      hideOpModal: () => set({ isOpModalVisible: false }),
      setOpBackgroundModal: (isBackground: boolean) =>
        set({ isOpModalBackground: isBackground }),
      showNftModal: () =>
        set({
          isNftModalVisible: true,
        }),
      showOwnerModal: () =>
        set({
          isOwnerModalVisible: true,
        }),
      hideOwnerModal: () => set({ isOwnerModalVisible: false }),
      setOwnerBackgroundModal: (isBackground: boolean) =>
        set({ isOwnerModalBackground: isBackground }),
      hideNftModal: () => set({ isNftModalVisible: false }),
      setNftBackgroundModal: (isBackground: boolean) =>
        set({ isNftModalBackground: isBackground }),
      showSendModal: () =>
        set({
          isSendModalVisible: true,
        }),
      hideSendModal: () => set({ isSendModalVisible: false }),
      setSendBackgroundModal: (isBackground: boolean) =>
        set({ isSendModalBackground: isBackground }),
      showTokenModal: () =>
        set({
          isTokenModalVisible: true,
        }),
      hideTokenModal: () => set({ isTokenModalVisible: false }),
      setTokenBackgroundModal: (isBackground: boolean) =>
        set({ isTokenModalBackground: isBackground }),
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
      hideAllModalsBackground: () =>
        set({
          isAddressModalBackground: false,
          isAuthModalBackground: false,
          isChainModalBackground: false,
          isConnectModalBackground: false,
          isCreateModalBackground: false,
          isDepositModalBackground: false,
          isNftModalBackground: false,
          isNotificationsModalBackground: false,
          isOpModalBackground: false,
          isOwnerModalBackground: false,
          isSendModalBackground: false,
          isTokenModalBackground: false,
        }),
    }),
    {
      anonymousActionType: "useModals",
      name: "ModalsStore",
      serialize: { options: true },
    },
  ),
);
