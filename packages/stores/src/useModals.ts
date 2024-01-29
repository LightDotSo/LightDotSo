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

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type ModalsStore = {
  isAuthModalVisible: boolean;
  isDepositModalVisible: boolean;
  isNftModalVisible: boolean;
  isNotificationsModalVisible: boolean;
  isOpModalVisible: boolean;
  isSendModalVisible: boolean;
  isTokenModalVisible: boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
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
      isAuthModalVisible: false,
      isDepositModalVisible: false,
      isNftModalVisible: false,
      isNotificationsModalVisible: false,
      isOpModalVisible: false,
      isSendModalVisible: false,
      isTokenModalVisible: false,
      showAuthModal: () =>
        set({
          isAuthModalVisible: true,
        }),
      hideAuthModal: () => set({ isAuthModalVisible: false }),
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
    }),
    {
      anonymousActionType: "useModals",
      name: "ModalsStore",
      serialize: { options: true },
    },
  ),
);
