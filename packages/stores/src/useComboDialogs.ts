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

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type ComboDialogsStore = {
  isChainComboDialogOpen: boolean;
  toggleIsChainComboDialogOpen: () => void;
  setIsChainComboDialogOpen: (isOpen: boolean) => void;
  isFeedbackComboDialogOpen: boolean;
  toggleIsFeedbackComboDialogOpen: () => void;
  setIsFeedbackComboDialogOpen: (isOpen: boolean) => void;
  isNotificationComboDialogOpen: boolean;
  toggleIsNotificationComboDialogOpen: () => void;
  setIsNotificationComboDialogOpen: (isOpen: boolean) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useComboDialogs = create(
  devtools<ComboDialogsStore>(
    (set) => ({
      isChainComboDialogOpen: false,
      toggleIsChainComboDialogOpen: () =>
        set((state) => ({
          isChainComboDialogOpen: !state.isChainComboDialogOpen,
        })),
      setIsChainComboDialogOpen: (isOpen) =>
        set(() => ({ isChainComboDialogOpen: isOpen })),
      isFeedbackComboDialogOpen: false,
      toggleIsFeedbackComboDialogOpen: () =>
        set((state) => ({
          isFeedbackComboDialogOpen: !state.isFeedbackComboDialogOpen,
        })),
      setIsFeedbackComboDialogOpen: (isOpen) =>
        set(() => ({ isFeedbackComboDialogOpen: isOpen })),
      isNotificationComboDialogOpen: false,
      toggleIsNotificationComboDialogOpen: () =>
        set((state) => ({
          isNotificationComboDialogOpen: !state.isNotificationComboDialogOpen,
        })),
      setIsNotificationComboDialogOpen: (isOpen) =>
        set(() => ({ isNotificationComboDialogOpen: isOpen })),
    }),
    {
      anonymousActionType: "useComboDialogs",
      name: "ComboDialogsStore",
      serialize: { options: true },
    },
  ),
);
