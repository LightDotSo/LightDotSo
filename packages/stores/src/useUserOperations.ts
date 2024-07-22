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
import { ExecutionWithChainId } from "@lightdotso/types";
import type { Hex } from "viem";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type UserOperationsStore = {
  executionParams: ExecutionWithChainId[];
  setExecutionParamsByChainId: (
    chainId: bigint,
    executionParams: ExecutionWithChainId[],
  ) => void;
  prependExecutionParamsByChainId: (
    chainId: bigint,
    executionParams: ExecutionWithChainId[],
  ) => void;
  resetExecutionParams: () => void;
  partialUserOperations: Partial<UserOperation>[];
  resetPartialUserOperations: () => void;
  setPartialUserOperations: (operations: Partial<UserOperation>[]) => void;
  setPartialUserOperationByChainIdAndNonce: (
    chainId: bigint,
    nonce: bigint,
    operation: Partial<UserOperation>,
  ) => void;
  userOperations: UserOperation[];
  resetUserOperations: () => void;
  setUserOperationByChainIdAndNonce: (
    chainId: bigint,
    nonce: bigint,
    operation: UserOperation,
  ) => void;
  pendingUserOperationMerkleRoot: Hex | null;
  addPendingUserOperationMerkleRoot: (hash: Hex) => void;
  resetPendingUserOperationMerkleRoot: () => void;
  pendingUserOperationHashes: Hex[];
  addPendingUserOperationHash: (hash: Hex) => void;
  resetPendingUserOperationHashes: () => void;
  resetAll: () => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperations = create(
  devtools(
    persist<UserOperationsStore>(
      set => ({
        executionParams: [],
        setExecutionParamsByChainId: (chainId, execution) =>
          set(state => {
            // Gets the current executionParams
            const executionParams = [...state.executionParams];

            // Removes all the operations with the same chainId
            const newExecutionParams = executionParams.filter(
              execution => execution.chainId !== chainId,
            );

            // Adds the new operations
            newExecutionParams.push(...execution);

            return { executionParams: newExecutionParams };
          }),
        prependExecutionParamsByChainId: (chainId, execution) =>
          set(state => {
            // Gets the current executionParams
            const executionParams = [...state.executionParams];

            // Gets the first operation with the same chainId
            const firstOperationIndex = executionParams.findIndex(
              execution => execution.chainId === chainId,
            );

            // If the operation is found, it prepends the execution before it, otherwise it appends it
            if (firstOperationIndex !== -1) {
              executionParams.splice(firstOperationIndex, 0, ...execution);
            } else {
              executionParams.push(...execution);
            }

            return { executionParams: executionParams };
          }),
        resetExecutionParams: () =>
          set(() => {
            return { executionParams: [] };
          }),
        partialUserOperations: [],
        resetPartialUserOperations: () =>
          set(() => {
            return { partialUserOperations: [] };
          }),
        setPartialUserOperations: (operations: Partial<UserOperation>[]) =>
          set(() => {
            return { partialUserOperations: operations };
          }),
        setPartialUserOperationByChainIdAndNonce: (chainId, nonce, operation) =>
          set(state => {
            // Gets the current partialUserOperations
            const partialUserOperations = [...state.partialUserOperations];

            // Finds the index of the operation matching the chainId
            const operationIndex = partialUserOperations.findIndex(
              op => op.chainId === chainId && op.nonce === nonce,
            );

            // If the operation is found, it updates it, otherwise it adds it to the array
            if (operationIndex !== -1) {
              partialUserOperations[operationIndex] = operation;
            } else {
              partialUserOperations.push(operation);
            }

            return { partialUserOperations: partialUserOperations };
          }),
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
        pendingUserOperationMerkleRoot: null,
        addPendingUserOperationMerkleRoot: hash =>
          set(() => {
            return { pendingUserOperationMerkleRoot: hash };
          }),
        resetPendingUserOperationMerkleRoot: () =>
          set(() => {
            return { pendingUserOperationMerkleRoot: null };
          }),
        pendingUserOperationHashes: [],
        addPendingUserOperationHash: hash =>
          set(state => {
            return {
              pendingUserOperationHashes: [
                ...state.pendingUserOperationHashes,
                hash,
              ],
            };
          }),
        resetPendingUserOperationHashes: () =>
          set(() => {
            return { pendingUserOperationHashes: [] };
          }),
        resetAll: () =>
          set(() => {
            return {
              executionParams: [],
              partialUserOperations: [],
              userOperations: [],
              pendingUserOperationMerkleRoot: null,
              pendingUserOperationHashes: [],
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
