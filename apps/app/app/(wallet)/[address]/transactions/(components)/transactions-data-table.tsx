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

import { DataTable } from "@/app/(wallet)/[address]/transactions/(components)/data-table/data-table";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import {
  useQueryUserOperations,
  useQueryUserOperationsCount,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { userOperationColumns } from "@lightdotso/tables";
import { type FC, useMemo } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionsDataTableProps {
  address: Address;
  status: "queued" | "history";
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

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { userOperations, isUserOperationsLoading } = useQueryUserOperations({
    address: address as Address,
    status: status,
    order: status === "queued" ? "asc" : "desc",
    limit: paginationState.pageSize,
    offset: offsetCount,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  const { userOperationsCount, isUserOperationsCountLoading } =
    useQueryUserOperationsCount({
      address: address as Address,
      status: status,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return isUserOperationsLoading || isUserOperationsCountLoading;
  }, [isUserOperationsLoading, isUserOperationsCountLoading]);

  const pageCount = useMemo(() => {
    if (!userOperationsCount?.count) {
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
      isTestnet={walletSettings?.is_enabled_testnet ?? false}
      columns={userOperationColumns}
      pageCount={pageCount ?? 0}
    />
  );
};
