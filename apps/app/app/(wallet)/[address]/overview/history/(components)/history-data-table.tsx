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

"use client";

import { DataTable } from "@/app/(wallet)/[address]/overview/history/(components)/data-table/data-table";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import {
  useQueryTransactions,
  useQueryTransactionsCount,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { transactionColumns } from "@lightdotso/tables/transaction";
import { TableSectionWrapper } from "@lightdotso/ui/wrappers";
import { type FC, useMemo } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface HistoryDataTableProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const HistoryDataTable: FC<HistoryDataTableProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const offsetCount = useMemo(() => {
    return paginationState.pageSize * paginationState.pageIndex;
  }, [paginationState.pageSize, paginationState.pageIndex]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { transactions, isTransactionsLoading } = useQueryTransactions({
    address: address as Address,
    limit: paginationState.pageSize,
    offset: offsetCount,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  const { transactionsCount, isTransactionsCountLoading } =
    useQueryTransactionsCount({
      address: address as Address,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return isTransactionsLoading || isTransactionsCountLoading;
  }, [isTransactionsLoading, isTransactionsCountLoading]);

  const pageCount = useMemo(() => {
    if (!transactionsCount?.count) {
      return null;
    }
    return Math.ceil(transactionsCount.count / paginationState.pageSize);
  }, [transactionsCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TableSectionWrapper>
      <DataTable
        isLoading={isLoading}
        data={transactions ?? []}
        columns={transactionColumns}
        pageCount={pageCount ?? 0}
      />
    </TableSectionWrapper>
  );
};
