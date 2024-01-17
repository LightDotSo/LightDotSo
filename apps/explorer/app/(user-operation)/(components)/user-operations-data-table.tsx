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

import {
  useQueryUserOperations,
  useQueryUserOperationsCount,
} from "@lightdotso/query";
import { userOperationColumns } from "@lightdotso/table";
import { TableSectionWrapper } from "@lightdotso/ui";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(user-operation)/(components)/data-table/data-table";
import { usePaginationQueryState, useIsTestnetQueryState } from "@/queryStates";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface UserOperationsDataTableProps {
  address: Address | null;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationsDataTable: FC<UserOperationsDataTableProps> = ({
  address,
}) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [isTestnetState] = useIsTestnetQueryState();
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

  const { userOperations } = useQueryUserOperations({
    address: address ?? null,
    status: "history",
    order: "asc",
    limit: paginationState.pageSize,
    offset: offsetCount,
    is_testnet: isTestnetState ?? false,
  });

  const { userOperationsCount } = useQueryUserOperationsCount({
    address: address ?? null,
    status: "history",
    is_testnet: isTestnetState ?? false,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

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
    <TableSectionWrapper>
      <DataTable
        data={userOperations ?? []}
        columns={userOperationColumns}
        pageCount={pageCount ?? 0}
      />
    </TableSectionWrapper>
  );
};
