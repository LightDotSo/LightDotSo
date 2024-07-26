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

import type { Hex } from "viem";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PendingTransaction = {
  hash: Hex;
  chainId: number;
};

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type TransactionsStore = {
  pendingTransactions: { [hash: string]: PendingTransaction };
  addPendingTransaction: (transaction: PendingTransaction) => void;
  removePendingTransaction: (hash: string) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTransactions = create(
  devtools(
    persist<TransactionsStore>(
      (set) => ({
        pendingTransactions: {},
        addPendingTransaction: (transaction) =>
          set((state) => {
            // Checks if the transaction is already in the state to prevent duplicates.
            if (state.pendingTransactions[transaction.hash])
              throw new Error("This transaction hash is already present.");
            return {
              pendingTransactions: {
                ...state.pendingTransactions,
                [transaction.hash]: transaction,
              },
            };
          }),
        removePendingTransaction: (hash) =>
          set((state) => {
            // Checks if the transaction is not in the state to prevent errors.
            if (!state.pendingTransactions[hash])
              throw new Error("This transaction hash is not present.");
            const pendingTransactions = { ...state.pendingTransactions };
            delete pendingTransactions[hash];
            return { pendingTransactions: pendingTransactions };
          }),
      }),
      {
        name: "transactions-state-v1",
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
      anonymousActionType: "useTransactions",
      name: "TransactionsStore",
      serialize: { options: true },
    },
  ),
);
