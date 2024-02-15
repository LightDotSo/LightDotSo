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

import { usePaginationQueryState } from "@lightdotso/nuqs";
import { useQueryWallets, useQueryWalletsCount } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { walletColumns } from "@lightdotso/tables";
import { TableSectionWrapper } from "@lightdotso/ui";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(authenticated)/wallets/(components)/data-table/data-table";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WalletsDataTable: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();

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

  const { wallets, isWalletsLoading } = useQueryWallets({
    address: address as Address,
    limit: paginationState.pageSize,
    offset: offsetCount,
  });

  const { walletsCount, isWalletsCountLoading } = useQueryWalletsCount({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return isWalletsLoading || isWalletsCountLoading;
  }, [isWalletsLoading, isWalletsCountLoading]);

  const pageCount = useMemo(() => {
    if (!walletsCount || !walletsCount?.count) {
      return null;
    }
    return Math.ceil(walletsCount.count / paginationState.pageSize);
  }, [walletsCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TableSectionWrapper>
      <DataTable
        isLoading={isLoading}
        data={wallets ?? []}
        columns={walletColumns}
        pageCount={pageCount ?? 0}
      />
    </TableSectionWrapper>
  );
};
