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

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type SettingsStore = {
  isQueryDevToolsOpen: boolean;
  setIsQueryDevToolsOpen: (isQueryDevToolsOpen: boolean) => void;
  toggleQueryDevTools: () => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useSettings = create(
  devtools(
    persist<SettingsStore>(
      set => ({
        isQueryDevToolsOpen: false,
        setIsQueryDevToolsOpen: (isQueryDevToolsOpen: boolean) =>
          set(() => ({ isQueryDevToolsOpen: isQueryDevToolsOpen })),
        toggleQueryDevTools: () =>
          set(({ isQueryDevToolsOpen }) => ({
            isQueryDevToolsOpen: !isQueryDevToolsOpen,
          })),
      }),
      {
        name: "settings-state-v1",
        storage: createJSONStorage(() => sessionStorage),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useSettings",
      name: "SettingsStore",
      serialize: { options: true },
    },
  ),
);
