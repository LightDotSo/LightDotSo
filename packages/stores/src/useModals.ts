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

import type { NftData, TokenData } from "@lightdotso/data";
import type { Address } from "viem";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type AddressModalProps = {
  address: Address;
  isTestnet?: boolean;
  onClose?: () => void;
  onAddressSelect: (address: Address) => void;
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
  nftModalProps: NftModalProps;
  setNftModalProps: (props: NftModalProps) => void;
  tokenModalProps: TokenModalProps;
  setTokenModalProps: (props: TokenModalProps) => void;
  isAddressModalBackground: boolean;
  isAuthModalBackground: boolean;
  isConnectModalBackground: boolean;
  isDepositModalBackground: boolean;
  isNftModalBackground: boolean;
  isNotificationsModalBackground: boolean;
  isOpModalBackground: boolean;
  isSendModalBackground: boolean;
  isTokenModalBackground: boolean;
  isAddressModalVisible: boolean;
  isAuthModalVisible: boolean;
  isConnectModalVisible: boolean;
  isDepositModalVisible: boolean;
  isNftModalVisible: boolean;
  isNotificationsModalVisible: boolean;
  isOpModalVisible: boolean;
  isSendModalVisible: boolean;
  isTokenModalVisible: boolean;
  showAddressModal: () => void;
  hideAddressModal: () => void;
  setAddressModalBackground: (isBackground: boolean) => void;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  setBackgroundAuthModal: (isBackground: boolean) => void;
  showConnectModal: () => void;
  hideConnectModal: () => void;
  setBackgroundConnectModal: (isBackground: boolean) => void;
  showDepositModal: () => void;
  hideDepositModal: () => void;
  setBackgroundDepositModal: (isBackground: boolean) => void;
  showNftModal: () => void;
  hideNftModal: () => void;
  setBackgroundNftModal: (isBackground: boolean) => void;
  showNotificationsModal: () => void;
  hideNotificationsModal: () => void;
  setBackgroundNotificationsModal: (isBackground: boolean) => void;
  showOpModal: () => void;
  hideOpModal: () => void;
  setBackgroundOpModal: (isBackground: boolean) => void;
  showSendModal: () => void;
  hideSendModal: () => void;
  setBackgroundSendModal: (isBackground: boolean) => void;
  showTokenModal: () => void;
  hideTokenModal: () => void;
  setBackgroundTokenModal: (isBackground: boolean) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useModals = create(
  devtools<ModalsStore>(
    set => ({
      addressModalProps: {
        address: "",
        isAddressModalVisible: false,
        onAddressSelect: () => {},
      },
      nftModalProps: {
        // @ts-expect-error
        address: "",
        isNftModalVisible: false,
        onNftSelect: () => {},
      },
      setNftModalProps: (props: NftModalProps) => set({ nftModalProps: props }),
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
      isConnectModalBackground: false,
      isDepositModalBackground: false,
      isNftModalBackground: false,
      isNotificationsModalBackground: false,
      isOpModalBackground: false,
      isSendModalBackground: false,
      isTokenModalBackground: false,
      isAuthModalVisible: false,
      isConnectModalVisible: false,
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
      setBackgroundAuthModal: (isBackground: boolean) =>
        set({ isAuthModalBackground: isBackground }),
      showConnectModal: () =>
        set({
          isConnectModalVisible: true,
        }),
      hideConnectModal: () => set({ isConnectModalVisible: false }),
      setBackgroundConnectModal: (isBackground: boolean) =>
        set({ isConnectModalBackground: isBackground }),
      showDepositModal: () =>
        set({
          isDepositModalVisible: true,
        }),
      hideDepositModal: () => set({ isDepositModalVisible: false }),
      setBackgroundDepositModal: (isBackground: boolean) =>
        set({ isDepositModalBackground: isBackground }),
      showNotificationsModal: () =>
        set({
          isNotificationsModalVisible: true,
        }),
      hideNotificationsModal: () => set({ isNotificationsModalVisible: false }),
      setBackgroundNotificationsModal: (isBackground: boolean) =>
        set({ isNftModalBackground: isBackground }),
      showOpModal: () =>
        set({
          isOpModalVisible: true,
        }),
      hideOpModal: () => set({ isOpModalVisible: false }),
      setBackgroundOpModal: (isBackground: boolean) =>
        set({ isOpModalBackground: isBackground }),
      showNftModal: () =>
        set({
          isNftModalVisible: true,
        }),
      hideNftModal: () => set({ isNftModalVisible: false }),
      setBackgroundNftModal: (isBackground: boolean) =>
        set({ isNftModalBackground: isBackground }),
      showSendModal: () =>
        set({
          isSendModalVisible: true,
        }),
      hideSendModal: () => set({ isSendModalVisible: false }),
      setBackgroundSendModal: (isBackground: boolean) =>
        set({ isSendModalBackground: isBackground }),
      showTokenModal: () =>
        set({
          isTokenModalVisible: true,
        }),
      hideTokenModal: () => set({ isTokenModalVisible: false }),
      setBackgroundTokenModal: (isBackground: boolean) =>
        set({ isTokenModalBackground: isBackground }),
    }),
    {
      anonymousActionType: "useModals",
      name: "ModalsStore",
      serialize: { options: true },
    },
  ),
);
