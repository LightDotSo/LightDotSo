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

import type { Address } from "viem";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

interface AuthState {
  address: Address | undefined;
  setAddress: (address: Address | undefined) => void;
  ens: string | undefined;
  setEns: (ens: string | undefined) => void;
  userId: string | undefined;
  setUserId: (userId: string | undefined) => void;
  sessionId: string | undefined;
  setSessionId: (session: string | undefined) => void;
  isSessionValid: () => boolean;
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
      (set, get) => ({
        address: undefined,
        setAddress: (address: Address | undefined) => set({ address }),
        ens: undefined,
        setEns: (ens: string | undefined) => set({ ens }),
        userId: undefined,
        setUserId: (userId: string | undefined) => set({ userId }),
        sessionId: undefined,
        setSessionId: (sessionId: string | undefined) => set({ sessionId }),
        isSessionValid: () => {
          const state = get();
          return state.sessionId !== undefined;
        },
        wallet: undefined,
        setWallet: (wallet: Address | undefined) => set({ wallet }),
        logout: () =>
          set({ address: undefined, wallet: undefined, userId: undefined }),
      }),
      {
        name: "auth-state-v1", // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
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
