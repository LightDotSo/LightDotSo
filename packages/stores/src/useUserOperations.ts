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

import type { SimulationData } from "@lightdotso/data";
import type { UserOperation } from "@lightdotso/schemas";
import type { Hex } from "viem";
import { create } from "zustand";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface UserOperationDetailsItem {
  title: string;
  value: string | number;
  href?: string;
}

export interface UserOperationDevInfo {
  title: string;
  data: any;
  isNumber?: boolean;
}

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type UserOperationsStore = {
  internalUserOperations: UserOperation[];
  setInternalUserOperationByChainId: (
    chainId: number,
    operation: UserOperation,
  ) => void;
  pendingSubmitUserOperationHashes: Hex[];
  addPendingSubmitUserOperationHash: (hash: Hex) => void;
  resetPendingSubmitUserOperationHashes: () => void;
  userOperationDetails: { [chainId: number]: UserOperationDetailsItem[] };
  userOperationDevInfo: { [chainId: number]: UserOperationDevInfo[] };
  userOperationSimulations: { [chainId: number]: SimulationData };
  setUserOperationDetails: (
    chainId: number,
    details: UserOperationDetailsItem[],
  ) => void;
  removeUserOperationDetails: (chainId: number) => void;
  resetUserOperationDetails: () => void;
  setUserOperationDevInfo: (
    chainId: number,
    info: UserOperationDevInfo[],
  ) => void;
  removeUserOperationDevInfo: (chainId: number) => void;
  resetUserOperationDevInfo: () => void;
  setUserOperationSimulation: (
    chainId: number,
    simulation: SimulationData,
  ) => void;
  removeUserOperationSimulation: (chainId: number) => void;
  resetUserOperationSimulation: () => void;
  resetAll: () => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperations = create<UserOperationsStore>(set => ({
  internalUserOperations: [],
  setInternalUserOperationByChainId: (chainId, operation) =>
    set(state => {
      // Gets the current internalUserOperations
      const internalUserOperations = [...state.internalUserOperations];

      // Finds the index of the operation matching the chainId
      const operationIndex = internalUserOperations.findIndex(
        op => Number(op.chainId) === chainId,
      );

      // If the operation is found, it updates it, otherwise it adds it to the array
      if (operationIndex !== -1) {
        internalUserOperations[operationIndex] = operation;
      } else {
        internalUserOperations.push(operation);
      }

      return { internalUserOperations: internalUserOperations };
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
  userOperationDetails: {},
  userOperationDevInfo: {},
  userOperationSimulations: {},
  setUserOperationDetails: (chainId, details) =>
    set(state => {
      return {
        userOperationDetails: {
          ...state.userOperationDetails,
          [chainId]: details,
        },
      };
    }),
  removeUserOperationDetails: chainId =>
    set(state => {
      // Checks if the transaction is not in the state to prevent errors.
      if (!state.userOperationDetails[chainId])
        throw new Error("Details for this chainId are not present.");

      const userOperationDetails = { ...state.userOperationDetails };
      delete userOperationDetails[chainId];

      return { userOperationDetails: userOperationDetails };
    }),
  resetUserOperationDetails: () =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set(state => {
      return { userOperationDetails: {} };
    }),
  setUserOperationDevInfo: (chainId, info) =>
    set(state => {
      return {
        userOperationDevInfo: {
          ...state.userOperationDevInfo,
          [chainId]: info,
        },
      };
    }),
  removeUserOperationDevInfo: chainId =>
    set(state => {
      // Checks if the transaction is not in the state to prevent errors.
      if (!state.userOperationDevInfo[chainId])
        throw new Error("DevInfo for this chainId are not present.");

      const userOperationDevInfo = { ...state.userOperationDevInfo };
      delete userOperationDevInfo[chainId];

      return { userOperationDevInfo: userOperationDevInfo };
    }),
  resetUserOperationDevInfo: () =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set(state => {
      return { userOperationDevInfo: {} };
    }),
  setUserOperationSimulation: (chainId, simulation) =>
    set(state => {
      return {
        userOperationSimulations: {
          ...state.userOperationSimulations,
          [chainId]: simulation,
        },
      };
    }),
  removeUserOperationSimulation: chainId =>
    set(state => {
      // Checks if the transaction is not in the state to prevent errors.
      if (!state.userOperationSimulations[chainId])
        throw new Error("Simulation for this chainId are not present.");

      const userOperationSimulations = {
        ...state.userOperationSimulations,
      };
      delete userOperationSimulations[chainId];

      return { userOperationSimulations: userOperationSimulations };
    }),
  resetUserOperationSimulation: () =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set(state => {
      return { userOperationSimulations: {} };
    }),
  resetAll: () =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set(state => {
      return {
        userOperationDetails: {},
        userOperationDevInfo: {},
        userOperationSimulations: {},
      };
    }),
}));
