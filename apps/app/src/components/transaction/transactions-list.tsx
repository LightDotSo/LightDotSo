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

"use client";

import type { TransactionData } from "@lightdotso/data";
import {
  useQueryTransactions,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { useTables } from "@lightdotso/stores";
import { TransactionTable, transactionColumns } from "@lightdotso/tables";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type TransactionsListProps = {
  address: Address;
  limit: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionsList: FC<TransactionsListProps> = ({
  address,
  limit,
}) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    transactionColumnFilters,
    transactionColumnVisibility,
    transactionRowSelection,
    transactionSorting,
    setTransactionSorting,
    setTransactionColumnVisibility,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useQueryWalletSettings({
    address: address,
  });

  const { transactions } = useQueryTransactions({
    address: address,
    limit: limit,
    offset: 0,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  // ---------------------------------------------------------------------------
  // Table Options
  // ---------------------------------------------------------------------------

  const tableOptions = {
    data: transactions ?? ([] as TransactionData[]),
    columns: transactionColumns,
    state: {
      sorting: transactionSorting,
      columnVisibility: transactionColumnVisibility,
      rowSelection: transactionRowSelection,
      columnFilters: transactionColumnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
    },
    paginateExpandedRows: false,
    enableRowSelection: false,
    onSortingChange: setTransactionSorting,
    onColumnVisibilityChange: setTransactionColumnVisibility,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TransactionTable
      isLoading={false}
      pageSize={limit}
      data={transactions ?? []}
      tableOptions={tableOptions}
    />
  );
};
