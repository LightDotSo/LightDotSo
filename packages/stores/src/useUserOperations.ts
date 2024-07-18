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

import { userOperationsParser } from "@lightdotso/nuqs";
import type { UserOperation } from "@lightdotso/schemas";
import { generatePartialUserOperations } from "@lightdotso/sdk";
import { ExecutionWithChainId } from "@lightdotso/types";
import type { Address, Hex } from "viem";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type UserOperationsStore = {
  executionsParams: Map<bigint, ExecutionWithChainId[]>;
  setExecutionsParamsByChainId: (
    executionsParams: ExecutionWithChainId[],
  ) => void;
  addExecutionsParamsByChainId: (
    executionsParams: ExecutionWithChainId[],
  ) => void;
  resetExecutionsParams: () => void;
  partialUserOperationsQueryState: string;
  isPartialUserOperationsQueryStateTooLarge: boolean;
  setPartialUserOperationsQueryState: () => void;
  partialUserOperations: Partial<UserOperation>[];
  resetPartialUserOperations: () => void;
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
        executionsParams: new Map(),
        setExecutionsParamsByChainId: executionsParams =>
          set(state => {
            const chainId = BigInt(executionsParams[0].chainId);
            state.executionsParams.set(chainId, executionsParams);
            return { executionsParams: state.executionsParams };
          }),
        addExecutionsParamsByChainId: executionsParams =>
          set(state => {
            const chainId = BigInt(executionsParams[0].chainId);
            const existingExecutionsParams =
              state.executionsParams.get(chainId);
            if (existingExecutionsParams) {
              state.executionsParams.set(
                chainId,
                existingExecutionsParams.concat(executionsParams),
              );
            } else {
              state.executionsParams.set(chainId, executionsParams);
            }
            return { executionsParams: state.executionsParams };
          }),
        resetExecutionsParams: () =>
          set(() => {
            return { executionsParams: new Map() };
          }),
        partialUserOperationsQueryState: "",
        isPartialUserOperationsQueryStateTooLarge: false,
        setPartialUserOperationsQueryState: () =>
          set(state => {
            const queryState = userOperationsParser.serialize(
              generatePartialUserOperations(
                "0x0000000000000000000000000000000000000000" as Address,
                // Flat map the executionsParams
                Array.from(state.executionsParams.values()).flat(),
              ),
            );

            return {
              partialUserOperationsQueryState: queryState,
              isPartialUserOperationsQueryStateTooLarge:
                queryState.length > 2_000,
            };
          }),
        partialUserOperations: [],
        resetPartialUserOperations: () =>
          set(() => {
            return { partialUserOperations: [] };
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
