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

import { useQueryWallets, useQueryWalletsCount } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { walletColumns } from "@lightdotso/tables";
import { TableSectionWrapper } from "@lightdotso/ui";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(authenticated)/wallets/(components)/data-table/data-table";
import { usePaginationQueryState } from "@lightdotso/nuqs";

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
