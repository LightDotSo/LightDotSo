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
  tokenColumnFilters: ColumnFiltersState;
  tokenColumnVisibility: VisibilityState;
  tokenRowSelection: RowSelectionState;
  tokenSorting: SortingState;
  tokenTable: Table<TokenData> | null;
  setTokenColumnFilters: OnChangeFn<ColumnFiltersState>;
  setTokenColumnVisibility: OnChangeFn<VisibilityState>;
  setTokenRowSelection: OnChangeFn<RowSelectionState>;
  setTokenSorting: OnChangeFn<SortingState>;
  setTokenTable: (tableObject: Table<TokenData>) => void;
  transactionColumnFilters: ColumnFiltersState;
  transactionColumnVisibility: VisibilityState;
  transactionRowSelection: RowSelectionState;
  transactionSorting: SortingState;
  transactionTable: Table<TransactionData> | null;
  setTransactionColumnFilters: OnChangeFn<ColumnFiltersState>;
  setTransactionColumnVisibility: OnChangeFn<VisibilityState>;
  setTransactionRowSelection: OnChangeFn<RowSelectionState>;
  setTransactionSorting: OnChangeFn<SortingState>;
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
        tokenColumnFilters: [],
        tokenColumnVisibility: { ["chain_id"]: false },
        tokenRowSelection: {},
        tokenSorting: [],
        tokenTable: null,
        setTokenColumnFilters: columnFilters =>
          set(prevState => ({
            ...prevState,
            tokenColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.tokenColumnFilters)
                : columnFilters,
          })),
        setTokenColumnVisibility: columnVisibility =>
          set(prevState => ({
            ...prevState,
            tokenColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.tokenColumnVisibility)
                : columnVisibility,
          })),
        setTokenRowSelection: rowSelection =>
          set(prevState => ({
            ...prevState,
            tokenRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.tokenRowSelection)
                : rowSelection,
          })),
        setTokenSorting: sorting =>
          set(prevState => ({
            ...prevState,
            tokenSorting:
              sorting instanceof Function
                ? sorting(prevState.tokenSorting)
                : sorting,
          })),
        setTokenTable: tableObject => set({ tokenTable: tableObject }),
        transactionColumnFilters: [],
        transactionColumnVisibility: {},
        transactionRowSelection: {},
        transactionSorting: [],
        transactionTable: null,
        setTransactionColumnFilters: columnFilters =>
          set(prevState => ({
            ...prevState,
            transactionColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.transactionColumnFilters)
                : columnFilters,
          })),
        setTransactionColumnVisibility: columnVisibility =>
          set(prevState => ({
            ...prevState,
            transactionColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.transactionColumnVisibility)
                : columnVisibility,
          })),
        setTransactionRowSelection: rowSelection =>
          set(prevState => ({
            ...prevState,
            transactionRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.transactionRowSelection)
                : rowSelection,
          })),
        setTransactionSorting: sorting =>
          set(prevState => ({
            ...prevState,
            transactionSorting:
              sorting instanceof Function
                ? sorting(prevState.transactionSorting)
                : sorting,
          })),
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
