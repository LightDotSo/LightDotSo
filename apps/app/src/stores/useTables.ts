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

import type {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type {
  TokenData,
  ConfigurationOwnerData,
  NftData,
  WalletData,
  TransactionData,
} from "@/data";

// -----------------------------------------------------------------------------
// Generic
// -----------------------------------------------------------------------------

type OnChangeFn<T> = (value: T | ((prevState: T) => T)) => void;

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type TablesStore = {
  nftColumnFilters: ColumnFiltersState;
  nftColumnVisibility: VisibilityState;
  nftRowSelection: RowSelectionState;
  nftSorting: SortingState;
  nftTable: Table<NftData> | null;
  setNftColumnFilters: OnChangeFn<ColumnFiltersState>;
  setNftColumnVisibility: OnChangeFn<VisibilityState>;
  setNftRowSelection: OnChangeFn<RowSelectionState>;
  setNftSorting: OnChangeFn<SortingState>;
  setNftTable: (tableObject: Table<NftData>) => void;
  ownerTable: Table<ConfigurationOwnerData> | null;
  setOwnerTable: (tableObject: Table<ConfigurationOwnerData>) => void;
  tokenTable: Table<TokenData> | null;
  setTokenTable: (tableObject: Table<TokenData>) => void;
  transactionTable: Table<TransactionData> | null;
  setTransactionTable: (tableObject: Table<TransactionData>) => void;
  walletTable: Table<WalletData> | null;
  setWalletTable: (tableObject: Table<WalletData>) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTables = create(
  devtools(
    persist<TablesStore>(
      set => ({
        nftColumnFilters: [
          {
            id: "spam_score",
            value: "0",
          },
        ],
        nftColumnVisibility: { ["spam_score"]: false },
        nftRowSelection: {},
        nftSorting: [],
        nftTable: null,
        setNftColumnFilters: columnFilters =>
          set(prevState => ({
            ...prevState,
            nftColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.nftColumnFilters)
                : columnFilters,
          })),
        setNftColumnVisibility: columnVisibility =>
          set(prevState => ({
            ...prevState,
            nftColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.nftColumnVisibility)
                : columnVisibility,
          })),
        setNftRowSelection: rowSelection =>
          set(prevState => ({
            ...prevState,
            nftRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.nftRowSelection)
                : rowSelection,
          })),
        setNftSorting: sorting =>
          set(prevState => ({
            ...prevState,
            nftSorting:
              sorting instanceof Function
                ? sorting(prevState.nftSorting)
                : sorting,
          })),
        setNftTable: tableObject => set({ nftTable: tableObject }),
        ownerTable: null,
        setOwnerTable: tableObject => set({ ownerTable: tableObject }),
        tokenTable: null,
        setTokenTable: tableObject => set({ tokenTable: tableObject }),
        transactionTable: null,
        setTransactionTable: tableObject =>
          set({ transactionTable: tableObject }),
        walletTable: null,
        setWalletTable: tableObject => set({ walletTable: tableObject }),
      }),
      {
        name: "table-state-v1",
        storage: createJSONStorage(() => sessionStorage),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useTables",
      name: "TablesStore",
      serialize: {
        options: true,
      },
    },
  ),
);
