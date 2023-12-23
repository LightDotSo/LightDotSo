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

"use client";

import { getTransactions, getTransactionsCount } from "@lightdotso/client";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(wallet)/[address]/overview/history/(components)/data-table/columns";
import { DataTable } from "@/app/(wallet)/[address]/overview/history/(components)/data-table/data-table";
import type {
  TransactionCountData,
  TransactionData,
  WalletSettingsData,
} from "@/data";
import { queries } from "@/queries";
import { usePaginationQueryState } from "@/querystates";

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
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const offsetCount = useMemo(() => {
    return paginationState.pageSize * paginationState.pageIndex;
  }, [paginationState.pageSize, paginationState.pageIndex]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queries.wallet.settings({ address }).queryKey);

  const currentData: TransactionData[] | undefined = queryClient.getQueryData(
    queries.transaction.list({
      address,
      limit: paginationState.pageSize,
      offset: offsetCount,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
  );

  const { data: transactions } = useQuery<TransactionData[] | null>({
    placeholderData: keepPreviousData,
    queryKey: queries.transaction.list({
      address,
      limit: paginationState.pageSize,
      offset: offsetCount,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queryFn: async () => {
      const res = await getTransactions({
        params: {
          query: {
            address,
            limit: paginationState.pageSize,
            offset: offsetCount,
            is_testnet: walletSettings?.is_enabled_testnet ?? false,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  const currentCountData: TransactionCountData | undefined =
    queryClient.getQueryData(
      queries.transaction.listCount({
        address: address as Address,
        is_testnet: walletSettings?.is_enabled_testnet ?? false,
      }).queryKey,
    );

  const { data: transactionsCount } = useQuery<TransactionCountData | null>({
    queryKey: queries.transaction.listCount({
      address: address as Address,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getTransactionsCount({
        params: {
          query: {
            address: address,
            is_testnet: walletSettings?.is_enabled_testnet ?? false,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentCountData ?? null;
        },
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const pageCount = useMemo(() => {
    if (!transactionsCount || !transactionsCount?.count) {
      return null;
    }
    return Math.ceil(transactionsCount.count / paginationState.pageSize);
  }, [transactionsCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!pageCount) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-background p-4">
      <DataTable
        data={transactions ?? []}
        columns={columns}
        pageCount={pageCount}
      />
    </div>
  );
};
