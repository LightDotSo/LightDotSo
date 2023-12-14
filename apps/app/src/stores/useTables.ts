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
  PaginationState,
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
  UserOperationData,
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
  nftPagination: PaginationState;
  nftRowSelection: RowSelectionState;
  nftSorting: SortingState;
  nftTable: Table<NftData> | null;
  setNftColumnFilters: OnChangeFn<ColumnFiltersState>;
  setNftColumnVisibility: OnChangeFn<VisibilityState>;
  setNftPagination: OnChangeFn<PaginationState>;
  setNftRowSelection: OnChangeFn<RowSelectionState>;
  setNftSorting: OnChangeFn<SortingState>;
  setNftTable: (tableObject: Table<NftData>) => void;
  ownerColumnFilters: ColumnFiltersState;
  ownerColumnVisibility: VisibilityState;
  ownerPagination: PaginationState;
  ownerRowSelection: RowSelectionState;
  ownerSorting: SortingState;
  ownerTable: Table<ConfigurationOwnerData> | null;
  setOwnerColumnFilters: OnChangeFn<ColumnFiltersState>;
  setOwnerColumnVisibility: OnChangeFn<VisibilityState>;
  setOwnerPagination: OnChangeFn<PaginationState>;
  setOwnerRowSelection: OnChangeFn<RowSelectionState>;
  setOwnerSorting: OnChangeFn<SortingState>;
  setOwnerTable: (tableObject: Table<ConfigurationOwnerData>) => void;
  userOperationColumnFilters: ColumnFiltersState;
  userOperationColumnVisibility: VisibilityState;
  userOperationPagination: PaginationState;
  userOperationRowSelection: RowSelectionState;
  userOperationSorting: SortingState;
  userOperationTable: Table<UserOperationData> | null;
  setUserOperationColumnFilters: OnChangeFn<ColumnFiltersState>;
  setUserOperationColumnVisibility: OnChangeFn<VisibilityState>;
  setUserOperationPagination: OnChangeFn<PaginationState>;
  setUserOperationRowSelection: OnChangeFn<RowSelectionState>;
  setUserOperationSorting: OnChangeFn<SortingState>;
  setUserOperationTable: (tableObject: Table<UserOperationData>) => void;
  tokenColumnFilters: ColumnFiltersState;
  tokenColumnVisibility: VisibilityState;
  tokenPagination: PaginationState;
  tokenRowSelection: RowSelectionState;
  tokenSorting: SortingState;
  tokenTable: Table<TokenData> | null;
  setTokenColumnFilters: OnChangeFn<ColumnFiltersState>;
  setTokenColumnVisibility: OnChangeFn<VisibilityState>;
  setTokenPagination: OnChangeFn<PaginationState>;
  setTokenRowSelection: OnChangeFn<RowSelectionState>;
  setTokenSorting: OnChangeFn<SortingState>;
  setTokenTable: (tableObject: Table<TokenData>) => void;
  transactionColumnFilters: ColumnFiltersState;
  transactionColumnVisibility: VisibilityState;
  transactionPagination: PaginationState;
  transactionRowSelection: RowSelectionState;
  transactionSorting: SortingState;
  transactionTable: Table<TransactionData> | null;
  setTransactionColumnFilters: OnChangeFn<ColumnFiltersState>;
  setTransactionColumnVisibility: OnChangeFn<VisibilityState>;
  setTransactionPagination: OnChangeFn<PaginationState>;
  setTransactionRowSelection: OnChangeFn<RowSelectionState>;
  setTransactionSorting: OnChangeFn<SortingState>;
  setTransactionTable: (tableObject: Table<TransactionData>) => void;
  walletColumnFilters: ColumnFiltersState;
  walletColumnVisibility: VisibilityState;
  walletPagination: PaginationState;
  walletRowSelection: RowSelectionState;
  walletSorting: SortingState;
  walletTable: Table<WalletData> | null;
  setWalletColumnFilters: OnChangeFn<ColumnFiltersState>;
  setWalletColumnVisibility: OnChangeFn<VisibilityState>;
  setWalletPagination: OnChangeFn<PaginationState>;
  setWalletRowSelection: OnChangeFn<RowSelectionState>;
  setWalletSorting: OnChangeFn<SortingState>;
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
        nftPagination: {
          pageIndex: 0,
          pageSize: 10,
        },
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
        setNftPagination: pagination =>
          set(prevState => ({
            ...prevState,
            nftPagination:
              pagination instanceof Function
                ? pagination(prevState.nftPagination)
                : pagination,
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
        setNftTable: tableObject =>
          set({
            nftTable: tableObject,
            ownerTable: null,
            tokenTable: null,
            userOperationTable: null,
            transactionTable: null,
            walletTable: null,
          }),
        ownerColumnFilters: [],
        ownerColumnVisibility: {},
        ownerPagination: {
          pageIndex: 0,
          pageSize: 10,
        },
        ownerRowSelection: {},
        ownerSorting: [],
        ownerTable: null,
        setOwnerColumnFilters: columnFilters =>
          set(prevState => ({
            ...prevState,
            ownerColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.ownerColumnFilters)
                : columnFilters,
          })),
        setOwnerColumnVisibility: columnVisibility =>
          set(prevState => ({
            ...prevState,
            ownerColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.ownerColumnVisibility)
                : columnVisibility,
          })),
        setOwnerPagination: pagination =>
          set(prevState => ({
            ...prevState,
            ownerPagination:
              pagination instanceof Function
                ? pagination(prevState.ownerPagination)
                : pagination,
          })),
        setOwnerRowSelection: rowSelection =>
          set(prevState => ({
            ...prevState,
            ownerRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.ownerRowSelection)
                : rowSelection,
          })),
        setOwnerSorting: sorting =>
          set(prevState => ({
            ...prevState,
            ownerSorting:
              sorting instanceof Function
                ? sorting(prevState.ownerSorting)
                : sorting,
          })),
        setOwnerTable: tableObject =>
          set({
            ownerTable: tableObject,
            nftTable: null,
            userOperationTable: null,
            tokenTable: null,
            transactionTable: null,
            walletTable: null,
          }),
        userOperationColumnFilters: [],
        userOperationColumnVisibility: {},
        userOperationPagination: {
          pageIndex: 0,
          pageSize: 10,
        },
        userOperationRowSelection: {},
        userOperationSorting: [],
        userOperationTable: null,
        setUserOperationColumnFilters: columnFilters =>
          set(prevState => ({
            ...prevState,
            userOperationColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.userOperationColumnFilters)
                : columnFilters,
          })),
        setUserOperationColumnVisibility: columnVisibility =>
          set(prevState => ({
            ...prevState,
            userOperationColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.userOperationColumnVisibility)
                : columnVisibility,
          })),
        setUserOperationPagination: pagination =>
          set(prevState => ({
            ...prevState,
            userOperationPagination:
              pagination instanceof Function
                ? pagination(prevState.userOperationPagination)
                : pagination,
          })),
        setUserOperationRowSelection: rowSelection =>
          set(prevState => ({
            ...prevState,
            userOperationRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.userOperationRowSelection)
                : rowSelection,
          })),
        setUserOperationSorting: sorting =>
          set(prevState => ({
            ...prevState,
            userOperationSorting:
              sorting instanceof Function
                ? sorting(prevState.userOperationSorting)
                : sorting,
          })),
        setUserOperationTable: tableObject =>
          set({
            userOperationTable: tableObject,
            ownerTable: null,
            nftTable: null,
            transactionTable: null,
            tokenTable: null,
            walletTable: null,
          }),
        tokenColumnFilters: [],
        tokenColumnVisibility: { ["chain_id"]: false },
        tokenPagination: {
          pageIndex: 0,
          pageSize: 10,
        },
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
        setTokenPagination: pagination =>
          set(prevState => ({
            ...prevState,
            tokenPagination:
              pagination instanceof Function
                ? pagination(prevState.tokenPagination)
                : pagination,
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
        setTokenTable: tableObject =>
          set({
            tokenTable: tableObject,
            ownerTable: null,
            nftTable: null,
            userOperationTable: null,
            transactionTable: null,
            walletTable: null,
          }),
        transactionColumnFilters: [],
        transactionColumnVisibility: {},
        transactionPagination: {
          pageIndex: 0,
          pageSize: 10,
        },
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
        setTransactionPagination: pagination =>
          set(prevState => ({
            ...prevState,
            transactionPagination:
              pagination instanceof Function
                ? pagination(prevState.transactionPagination)
                : pagination,
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
          set({
            transactionTable: tableObject,
            ownerTable: null,
            nftTable: null,
            userOperationTable: null,
            tokenTable: null,
            walletTable: null,
          }),
        walletColumnFilters: [],
        walletColumnVisibility: {},
        walletPagination: {
          pageIndex: 0,
          pageSize: 10,
        },
        walletRowSelection: {},
        walletSorting: [],
        walletTable: null,
        setWalletColumnFilters: columnFilters =>
          set(prevState => ({
            ...prevState,
            walletColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.walletColumnFilters)
                : columnFilters,
          })),
        setWalletColumnVisibility: columnVisibility =>
          set(prevState => ({
            ...prevState,
            walletColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.walletColumnVisibility)
                : columnVisibility,
          })),
        setWalletPagination: pagination =>
          set(prevState => ({
            ...prevState,
            walletPagination:
              pagination instanceof Function
                ? pagination(prevState.walletPagination)
                : pagination,
          })),
        setWalletRowSelection: rowSelection =>
          set(prevState => ({
            ...prevState,
            walletRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.walletRowSelection)
                : rowSelection,
          })),
        setWalletSorting: sorting =>
          set(prevState => ({
            ...prevState,
            walletSorting:
              sorting instanceof Function
                ? sorting(prevState.walletSorting)
                : sorting,
          })),
        setWalletTable: tableObject =>
          set({
            walletTable: tableObject,
            ownerTable: null,
            nftTable: null,
            userOperationTable: null,
            tokenTable: null,
            transactionTable: null,
          }),
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
