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
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

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
  userOperationDetails: { [chainId: number]: UserOperationDetailsItem[] };
  userOperationDevInfo: { [chainId: number]: UserOperationDevInfo[] };
  userOperationSimulations: { [chainId: number]: SimulationData };
  addUserOperationDetails: (
    chainId: number,
    details: UserOperationDetailsItem[],
  ) => void;
  removeUserOperationDetails: (chainId: number) => void;
  addUserOperationDevInfo: (
    chainId: number,
    info: UserOperationDevInfo[],
  ) => void;
  removeUserOperationDevInfo: (chainId: number) => void;
  addUserOperationSimulation: (
    chainId: number,
    simulation: SimulationData,
  ) => void;
  removeUserOperationSimulation: (chainId: number) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperations = create(
  devtools(
    persist<UserOperationsStore>(
      set => ({
        userOperationDetails: {},
        userOperationDevInfo: {},
        userOperationSimulations: {},
        addUserOperationDetails: (chainId, details) =>
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

            return { userOperationDetails };
          }),
        addUserOperationDevInfo: (chainId, info) =>
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

            return { userOperationDevInfo };
          }),
        addUserOperationSimulation: (chainId, simulation) =>
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

            return { userOperationSimulations };
          }),
      }),
      {
        name: "user-operations-state-v1",
        storage: createJSONStorage(() => sessionStorage),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useUserOperations",
      name: "UserOperationsStore",
      serialize: { options: true },
    },
  ),
);
