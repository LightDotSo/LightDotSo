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

import type { TokenData } from "@lightdotso/data";
import type { Address } from "viem";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

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
  tokenModalProps: TokenModalProps;
  setTokenModalProps: (props: TokenModalProps) => void;
  isAuthModalVisible: boolean;
  isConnectModalVisible: boolean;
  isDepositModalVisible: boolean;
  isNftModalVisible: boolean;
  isNotificationsModalVisible: boolean;
  isOpModalVisible: boolean;
  isSendModalVisible: boolean;
  isTokenModalVisible: boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  showConnectModal: () => void;
  hideConnectModal: () => void;
  showDepositModal: () => void;
  hideDepositModal: () => void;
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
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useModals = create(
  devtools<ModalsStore>(
    set => ({
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
      isConnectModalVisible: false,
      isDepositModalVisible: false,
      isNftModalVisible: false,
      isNotificationsModalVisible: false,
      isOpModalVisible: false,
      isSendModalVisible: false,
      isTokenModalVisible: false,
      showAuthModal: () =>
        set({
          isAuthModalVisible: true,
          isDepositModalVisible: false,
          isNftModalVisible: false,
          isNotificationsModalVisible: false,
          isOpModalVisible: false,
          isSendModalVisible: false,
          isTokenModalVisible: false,
        }),
      hideAuthModal: () => set({ isAuthModalVisible: false }),
      showConnectModal: () =>
        set({
          isConnectModalVisible: true,
          isAuthModalVisible: false,
          isDepositModalVisible: false,
          isNftModalVisible: false,
          isNotificationsModalVisible: false,
          isOpModalVisible: false,
          isSendModalVisible: false,
          isTokenModalVisible: false,
        }),
      hideConnectModal: () => set({ isConnectModalVisible: false }),
      showDepositModal: () =>
        set({
          isDepositModalVisible: true,
          isAuthModalVisible: false,
          isNftModalVisible: false,
          isNotificationsModalVisible: false,
          isOpModalVisible: false,
          isSendModalVisible: false,
          isTokenModalVisible: false,
        }),
      hideDepositModal: () => set({ isDepositModalVisible: false }),
      showNotificationsModal: () =>
        set({
          isNotificationsModalVisible: true,
          isAuthModalVisible: false,
          isDepositModalVisible: false,
          isNftModalVisible: false,
          isOpModalVisible: false,
          isSendModalVisible: false,
          isTokenModalVisible: false,
        }),
      hideNotificationsModal: () => set({ isNotificationsModalVisible: false }),
      showOpModal: () =>
        set({
          isOpModalVisible: true,
          isAuthModalVisible: false,
          isDepositModalVisible: false,
          isNftModalVisible: false,
          isNotificationsModalVisible: false,
          isSendModalVisible: false,
          isTokenModalVisible: false,
        }),
      hideOpModal: () => set({ isOpModalVisible: false }),
      showNftModal: () =>
        set({
          isNftModalVisible: true,
          isAuthModalVisible: false,
          isDepositModalVisible: false,
          isNotificationsModalVisible: false,
          isOpModalVisible: false,
          isSendModalVisible: false,
          isTokenModalVisible: false,
        }),
      hideNftModal: () => set({ isNftModalVisible: false }),
      showSendModal: () =>
        set({
          isSendModalVisible: true,
          isAuthModalVisible: false,
          isDepositModalVisible: false,
          isNftModalVisible: false,
          isNotificationsModalVisible: false,
          isOpModalVisible: false,
          isTokenModalVisible: false,
        }),
      hideSendModal: () => set({ isSendModalVisible: false }),
      showTokenModal: () =>
        set({
          isTokenModalVisible: true,
          isAuthModalVisible: false,
          isDepositModalVisible: false,
          isNftModalVisible: false,
          isNotificationsModalVisible: false,
          isOpModalVisible: false,
          isSendModalVisible: false,
        }),
      hideTokenModal: () => set({ isTokenModalVisible: false }),
    }),
    {
      anonymousActionType: "useModals",
      name: "ModalsStore",
      serialize: { options: true },
    },
  ),
);
