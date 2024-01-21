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

import type { WalletSettingsData } from "@lightdotso/data";
import {
  useQueryUserOperations,
  useQueryUserOperationsCount,
} from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { userOperationColumns } from "@lightdotso/tables";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(wallet)/[address]/transactions/(components)/data-table/data-table";
import { usePaginationQueryState } from "@/queryStates";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionsDataTableProps {
  address: Address;
  status: "proposed" | "history";
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionsDataTable: FC<TransactionsDataTableProps> = ({
  address,
  status,
}) => {
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

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { userOperations, isUserOperationsLoading } = useQueryUserOperations({
    address,
    status,
    order: status === "proposed" ? "asc" : "desc",
    limit: paginationState.pageSize,
    offset: offsetCount,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  const { userOperationsCount, isUserOperationsCountLoading } =
    useQueryUserOperationsCount({
      address,
      status,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return isUserOperationsLoading || isUserOperationsCountLoading;
  }, [isUserOperationsLoading, isUserOperationsCountLoading]);

  const pageCount = useMemo(() => {
    if (!userOperationsCount || !userOperationsCount?.count) {
      return null;
    }
    return Math.ceil(userOperationsCount.count / paginationState.pageSize);
  }, [userOperationsCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <DataTable
      isLoading={isLoading}
      data={userOperations ?? []}
      address={address}
      columns={userOperationColumns}
      pageCount={pageCount ?? 0}
    />
  );
};
