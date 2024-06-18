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

import type { ClientType } from "@lightdotso/client";
import type { Address } from "viem";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

interface AuthState {
  address: Address | undefined;
  setAddress: (address: Address | undefined) => void;
  clientType: ClientType | undefined;
  setClientType: (clientType: ClientType | undefined) => void;
  ens: string | undefined;
  setEns: (ens: string | undefined) => void;
  userId: string | undefined;
  setUserId: (userId: string | undefined) => void;
  sessionId: string | undefined;
  setSessionId: (session: string | undefined) => void;
  wallet: Address | undefined;
  setWallet: (wallet: Address | undefined) => void;
  logout: () => void;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useAuth = create(
  devtools(
    persist<AuthState>(
      set => ({
        address: undefined,
        setAddress: (address: Address | undefined) => set({ address: address }),
        clientType: undefined,
        setClientType: (clientType: ClientType | undefined) =>
          set({ clientType: clientType }),
        ens: undefined,
        setEns: (ens: string | undefined) => set({ ens: ens }),
        userId: undefined,
        setUserId: (userId: string | undefined) => set({ userId: userId }),
        sessionId: undefined,
        setSessionId: (sessionId: string | undefined) => {
          set({ sessionId: sessionId });
          if (sessionId) {
            set({ clientType: "authenticated" });
          } else {
            set({ clientType: undefined });
          }
        },
        wallet: undefined,
        setWallet: (wallet: Address | undefined) => set({ wallet: wallet }),
        logout: () =>
          set({ address: undefined, wallet: undefined, userId: undefined }),
      }),
      {
        name: "auth-state-v1",
        storage: createJSONStorage(() => sessionStorage),
        skipHydration: true,
      },
    ),
    {
      anonymousActionType: "useAuth",
      name: "AuthState",
      serialize: { options: true },
    },
  ),
);
