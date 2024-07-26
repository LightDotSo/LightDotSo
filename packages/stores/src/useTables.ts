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

import type {
  ActivityData,
  NftData,
  NotificationData,
  OwnerData,
  TokenData,
  TransactionData,
  UserOperationData,
  WalletData,
} from "@lightdotso/data";
import type {
  ColumnFiltersState,
  ExpandedState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// Generic
// -----------------------------------------------------------------------------

type OnChangeFn<T> = (value: T | ((prevState: T) => T)) => void;

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type TablesStore = {
  activityColumnFilters: ColumnFiltersState;
  activityColumnVisibility: VisibilityState;
  activityRowSelection: RowSelectionState;
  activitySorting: SortingState;
  activityTable: Table<ActivityData> | null;
  setActivityColumnFilters: OnChangeFn<ColumnFiltersState>;
  setActivityColumnVisibility: OnChangeFn<VisibilityState>;
  setActivityRowSelection: OnChangeFn<RowSelectionState>;
  setActivitySorting: OnChangeFn<SortingState>;
  setActivityTable: (tableObject: Table<ActivityData>) => void;
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
  notificationColumnFilters: ColumnFiltersState;
  notificationColumnVisibility: VisibilityState;
  notificationRowSelection: RowSelectionState;
  notificationSorting: SortingState;
  notificationTable: Table<NotificationData> | null;
  setNotificationColumnFilters: OnChangeFn<ColumnFiltersState>;
  setNotificationColumnVisibility: OnChangeFn<VisibilityState>;
  setNotificationRowSelection: OnChangeFn<RowSelectionState>;
  setNotificationSorting: OnChangeFn<SortingState>;
  setNotificationTable: (tableObject: Table<NotificationData>) => void;
  ownerColumnFilters: ColumnFiltersState;
  ownerColumnVisibility: VisibilityState;
  ownerRowSelection: RowSelectionState;
  ownerSorting: SortingState;
  ownerTable: Table<OwnerData> | null;
  setOwnerColumnFilters: OnChangeFn<ColumnFiltersState>;
  setOwnerColumnVisibility: OnChangeFn<VisibilityState>;
  setOwnerRowSelection: OnChangeFn<RowSelectionState>;
  setOwnerSorting: OnChangeFn<SortingState>;
  setOwnerTable: (tableObject: Table<OwnerData>) => void;
  userOperationColumnFilters: ColumnFiltersState;
  userOperationColumnVisibility: VisibilityState;
  userOperationRowSelection: RowSelectionState;
  userOperationSorting: SortingState;
  userOperationTable: Table<UserOperationData> | null;
  setUserOperationColumnFilters: OnChangeFn<ColumnFiltersState>;
  setUserOperationColumnVisibility: OnChangeFn<VisibilityState>;
  setUserOperationRowSelection: OnChangeFn<RowSelectionState>;
  setUserOperationSorting: OnChangeFn<SortingState>;
  setUserOperationTable: (tableObject: Table<UserOperationData>) => void;
  tokenColumnFilters: ColumnFiltersState;
  tokenColumnVisibility: VisibilityState;
  tokenExpandedState: ExpandedState;
  tokenRowSelection: RowSelectionState;
  tokenSorting: SortingState;
  tokenTable: Table<TokenData> | null;
  setTokenColumnFilters: OnChangeFn<ColumnFiltersState>;
  setTokenColumnVisibility: OnChangeFn<VisibilityState>;
  setTokenExpandedState: OnChangeFn<ExpandedState>;
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
  walletColumnFilters: ColumnFiltersState;
  walletColumnVisibility: VisibilityState;
  walletRowSelection: RowSelectionState;
  walletSorting: SortingState;
  walletTable: Table<WalletData> | null;
  setWalletColumnFilters: OnChangeFn<ColumnFiltersState>;
  setWalletColumnVisibility: OnChangeFn<VisibilityState>;
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
      (set) => ({
        activityColumnFilters: [],
        activityColumnVisibility: {},
        activityRowSelection: {},
        activitySorting: [],
        activityTable: null,
        setActivityColumnFilters: (columnFilters) =>
          set((prevState) => ({
            ...prevState,
            transactionColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.transactionColumnFilters)
                : columnFilters,
          })),
        setActivityColumnVisibility: (columnVisibility) =>
          set((prevState) => ({
            ...prevState,
            transactionColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.transactionColumnVisibility)
                : columnVisibility,
          })),
        setActivityRowSelection: (rowSelection) =>
          set((prevState) => ({
            ...prevState,
            transactionRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.transactionRowSelection)
                : rowSelection,
          })),
        setActivitySorting: (sorting) =>
          set((prevState) => ({
            ...prevState,
            transactionSorting:
              sorting instanceof Function
                ? sorting(prevState.transactionSorting)
                : sorting,
          })),
        setActivityTable: (tableObject) =>
          set({
            activityTable: tableObject,
            ownerTable: null,
            nftTable: null,
            notificationTable: null,
            userOperationTable: null,
            tokenTable: null,
            transactionTable: null,
            walletTable: null,
          }),
        nftColumnFilters: [
          {
            id: "spam_score",
            value: "0",
          },
        ],
        nftColumnVisibility: { spam_score: false },
        nftRowSelection: {},
        nftSorting: [],
        nftTable: null,
        setNftColumnFilters: (columnFilters) =>
          set((prevState) => ({
            ...prevState,
            nftColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.nftColumnFilters)
                : columnFilters,
          })),
        setNftColumnVisibility: (columnVisibility) =>
          set((prevState) => ({
            ...prevState,
            nftColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.nftColumnVisibility)
                : columnVisibility,
          })),
        setNftRowSelection: (rowSelection) =>
          set((prevState) => ({
            ...prevState,
            nftRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.nftRowSelection)
                : rowSelection,
          })),
        setNftSorting: (sorting) =>
          set((prevState) => ({
            ...prevState,
            nftSorting:
              sorting instanceof Function
                ? sorting(prevState.nftSorting)
                : sorting,
          })),
        setNftTable: (tableObject) =>
          set({
            nftTable: tableObject,
            activityTable: null,
            notificationTable: null,
            ownerTable: null,
            tokenTable: null,
            userOperationTable: null,
            transactionTable: null,
            walletTable: null,
          }),
        notificationColumnFilters: [],
        notificationColumnVisibility: {},
        notificationRowSelection: {},
        notificationSorting: [],
        notificationTable: null,
        setNotificationColumnFilters: (columnFilters) =>
          set((prevState) => ({
            ...prevState,
            notificationColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.notificationColumnFilters)
                : columnFilters,
          })),
        setNotificationColumnVisibility: (columnVisibility) =>
          set((prevState) => ({
            ...prevState,
            notificationColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.notificationColumnVisibility)
                : columnVisibility,
          })),
        setNotificationRowSelection: (rowSelection) =>
          set((prevState) => ({
            ...prevState,
            notificationRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.notificationRowSelection)
                : rowSelection,
          })),
        setNotificationSorting: (sorting) =>
          set((prevState) => ({
            ...prevState,
            notificationSorting:
              sorting instanceof Function
                ? sorting(prevState.notificationSorting)
                : sorting,
          })),
        setNotificationTable: (tableObject) =>
          set({
            notificationTable: tableObject,
            activityTable: null,
            nftTable: null,
            ownerTable: null,
            tokenTable: null,
            userOperationTable: null,
            transactionTable: null,
            walletTable: null,
          }),
        ownerColumnFilters: [],
        ownerColumnVisibility: {},
        ownerRowSelection: {},
        ownerSorting: [],
        ownerTable: null,
        setOwnerColumnFilters: (columnFilters) =>
          set((prevState) => ({
            ...prevState,
            ownerColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.ownerColumnFilters)
                : columnFilters,
          })),
        setOwnerColumnVisibility: (columnVisibility) =>
          set((prevState) => ({
            ...prevState,
            ownerColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.ownerColumnVisibility)
                : columnVisibility,
          })),
        setOwnerRowSelection: (rowSelection) =>
          set((prevState) => ({
            ...prevState,
            ownerRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.ownerRowSelection)
                : rowSelection,
          })),
        setOwnerSorting: (sorting) =>
          set((prevState) => ({
            ...prevState,
            ownerSorting:
              sorting instanceof Function
                ? sorting(prevState.ownerSorting)
                : sorting,
          })),
        setOwnerTable: (tableObject) =>
          set({
            ownerTable: tableObject,
            activityTable: null,
            nftTable: null,
            notificationTable: null,
            userOperationTable: null,
            tokenTable: null,
            transactionTable: null,
            walletTable: null,
          }),
        userOperationColumnFilters: [],
        userOperationColumnVisibility: {},
        userOperationRowSelection: {},
        userOperationSorting: [],
        userOperationTable: null,
        setUserOperationColumnFilters: (columnFilters) =>
          set((prevState) => ({
            ...prevState,
            userOperationColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.userOperationColumnFilters)
                : columnFilters,
          })),
        setUserOperationColumnVisibility: (columnVisibility) =>
          set((prevState) => ({
            ...prevState,
            userOperationColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.userOperationColumnVisibility)
                : columnVisibility,
          })),
        setUserOperationRowSelection: (rowSelection) =>
          set((prevState) => ({
            ...prevState,
            userOperationRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.userOperationRowSelection)
                : rowSelection,
          })),
        setUserOperationSorting: (sorting) =>
          set((prevState) => ({
            ...prevState,
            userOperationSorting:
              sorting instanceof Function
                ? sorting(prevState.userOperationSorting)
                : sorting,
          })),
        setUserOperationTable: (tableObject) =>
          set({
            userOperationTable: tableObject,
            activityTable: null,
            ownerTable: null,
            nftTable: null,
            notificationTable: null,
            transactionTable: null,
            tokenTable: null,
            walletTable: null,
          }),
        tokenColumnFilters: [],
        tokenColumnVisibility: {},
        tokenExpandedState: {},
        tokenRowSelection: {},
        tokenSorting: [],
        tokenTable: null,
        setTokenColumnFilters: (columnFilters) =>
          set((prevState) => ({
            ...prevState,
            tokenColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.tokenColumnFilters)
                : columnFilters,
          })),
        setTokenColumnVisibility: (columnVisibility) =>
          set((prevState) => ({
            ...prevState,
            tokenColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.tokenColumnVisibility)
                : columnVisibility,
          })),
        setTokenRowSelection: (rowSelection) =>
          set((prevState) => ({
            ...prevState,
            tokenRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.tokenRowSelection)
                : rowSelection,
          })),
        setTokenSorting: (sorting) =>
          set((prevState) => ({
            ...prevState,
            tokenSorting:
              sorting instanceof Function
                ? sorting(prevState.tokenSorting)
                : sorting,
          })),
        setTokenTable: (tableObject) =>
          set({
            tokenTable: tableObject,
            activityTable: null,
            ownerTable: null,
            nftTable: null,
            notificationTable: null,
            userOperationTable: null,
            transactionTable: null,
            walletTable: null,
          }),
        transactionColumnFilters: [],
        transactionColumnVisibility: {},
        transactionRowSelection: {},
        transactionSorting: [],
        transactionTable: null,
        setTransactionColumnFilters: (columnFilters) =>
          set((prevState) => ({
            ...prevState,
            transactionColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.transactionColumnFilters)
                : columnFilters,
          })),
        setTransactionColumnVisibility: (columnVisibility) =>
          set((prevState) => ({
            ...prevState,
            transactionColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.transactionColumnVisibility)
                : columnVisibility,
          })),
        setTokenExpandedState: (expandedState) =>
          set((prevState) => ({
            ...prevState,
            tokenExpandedState:
              expandedState instanceof Function
                ? expandedState(prevState.tokenExpandedState)
                : expandedState,
          })),
        setTransactionRowSelection: (rowSelection) =>
          set((prevState) => ({
            ...prevState,
            transactionRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.transactionRowSelection)
                : rowSelection,
          })),
        setTransactionSorting: (sorting) =>
          set((prevState) => ({
            ...prevState,
            transactionSorting:
              sorting instanceof Function
                ? sorting(prevState.transactionSorting)
                : sorting,
          })),
        setTransactionTable: (tableObject) =>
          set({
            transactionTable: tableObject,
            activityTable: null,
            ownerTable: null,
            nftTable: null,
            notificationTable: null,
            userOperationTable: null,
            tokenTable: null,
            walletTable: null,
          }),
        walletColumnFilters: [],
        walletColumnVisibility: {},
        walletRowSelection: {},
        walletSorting: [],
        walletTable: null,
        setWalletColumnFilters: (columnFilters) =>
          set((prevState) => ({
            ...prevState,
            walletColumnFilters:
              columnFilters instanceof Function
                ? columnFilters(prevState.walletColumnFilters)
                : columnFilters,
          })),
        setWalletColumnVisibility: (columnVisibility) =>
          set((prevState) => ({
            ...prevState,
            walletColumnVisibility:
              columnVisibility instanceof Function
                ? columnVisibility(prevState.walletColumnVisibility)
                : columnVisibility,
          })),
        setWalletRowSelection: (rowSelection) =>
          set((prevState) => ({
            ...prevState,
            walletRowSelection:
              rowSelection instanceof Function
                ? rowSelection(prevState.walletRowSelection)
                : rowSelection,
          })),
        setWalletSorting: (sorting) =>
          set((prevState) => ({
            ...prevState,
            walletSorting:
              sorting instanceof Function
                ? sorting(prevState.walletSorting)
                : sorting,
          })),
        setWalletTable: (tableObject) =>
          set({
            walletTable: tableObject,
            activityTable: null,
            ownerTable: null,
            nftTable: null,
            notificationTable: null,
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
