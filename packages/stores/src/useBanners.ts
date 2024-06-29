// Copyright 2023-2024 Light.
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
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type BannersStore = {
  isBetaClosed: boolean;
  isNotOwner: boolean;
  setIsBetaClosed: (isBetaClosed: boolean) => void;
  setIsNotOwner: (isNotOwner: boolean) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useBanners = create(
  devtools(
    persist<BannersStore>(
      set => ({
        isBetaClosed: false,
        isNotOwner: false,
        setIsBetaClosed: (isBetaClosed: boolean) =>
          set(() => ({ isBetaClosed: isBetaClosed })),
        setIsNotOwner: (isNotOwner: boolean) =>
          set(() => ({ isNotOwner: isNotOwner })),
      }),
      {
        name: "banners-state-v1",
        storage: createJSONStorage(() => sessionStorage),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useBanners",
      name: "BannersStore",
      serialize: { options: true },
    },
  ),
);
