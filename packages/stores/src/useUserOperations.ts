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

import type { UserOperation } from "@lightdotso/schemas";
import type { Hex } from "viem";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type UserOperationsStore = {
  userOperations: UserOperation[];
  resetUserOperations: () => void;
  setUserOperationByChainIdAndNonce: (
    chainId: bigint,
    nonce: bigint,
    operation: UserOperation,
  ) => void;
  pendingSubmitUserOperationHashes: Hex[];
  addPendingSubmitUserOperationHash: (hash: Hex) => void;
  resetPendingSubmitUserOperationHashes: () => void;
  resetAll: () => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperations = create(
  devtools(
    persist<UserOperationsStore>(
      set => ({
        userOperations: [],
        resetUserOperations: () =>
          set(() => {
            return { userOperations: [] };
          }),
        setUserOperationByChainIdAndNonce: (chainId, nonce, operation) =>
          set(state => {
            // Gets the current userOperations
            const userOperations = [...state.userOperations];

            // Finds the index of the operation matching the chainId
            const operationIndex = userOperations.findIndex(
              op => op.chainId === chainId && op.nonce === nonce,
            );

            // If the operation is found, it updates it, otherwise it adds it to the array
            if (operationIndex !== -1) {
              userOperations[operationIndex] = operation;
            } else {
              userOperations.push(operation);
            }

            return { userOperations: userOperations };
          }),
        pendingSubmitUserOperationHashes: [],
        addPendingSubmitUserOperationHash: hash =>
          set(state => {
            return {
              pendingSubmitUserOperationHashes: [
                ...state.pendingSubmitUserOperationHashes,
                hash,
              ],
            };
          }),
        resetPendingSubmitUserOperationHashes: () =>
          set(() => {
            return { pendingSubmitUserOperationHashes: [] };
          }),
        resetAll: () =>
          set(() => {
            return {
              userOperations: [],
              pendingSubmitUserOperationHashes: [],
            };
          }),
      }),
      {
        name: "user-operations-state-v1",
        storage: createJSONStorage(() => sessionStorage, {
          reviver: (_key: string, value: any): any => {
            // Ignore functions during serialization
            if (typeof value === "function") {
              return undefined;
            }
            if (value && typeof value === "object" && value.type === "bigint") {
              return BigInt(value.value);
            }
            return value;
          },
          replacer: (_key: string, value: any): any => {
            if (typeof value === "bigint") {
              return { type: "bigint", value: value.toString() };
            }
            return value;
          },
        }),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useUserOperations",
      name: "UserOperationsStore",
      serialize: {
        replacer: (_key: any, value: any) =>
          typeof value === "bigint" ? value.toString() : value,
      },
    },
  ),
);
