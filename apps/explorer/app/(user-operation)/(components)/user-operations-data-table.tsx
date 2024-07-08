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

import {
  usePaginationQueryState,
  useIsTestnetQueryState,
} from "@lightdotso/nuqs";
import {
  useQueryUserOperations,
  useQueryUserOperationsCount,
} from "@lightdotso/query";
import { userOperationColumns } from "@lightdotso/tables";
import { TableSectionWrapper } from "@lightdotso/ui";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(user-operation)/(components)/data-table/data-table";

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

  const { userOperations, isUserOperationsLoading } = useQueryUserOperations({
    address: address ?? null,
    status: "history",
    order: "desc",
    limit: paginationState.pageSize,
    offset: offsetCount,
    is_testnet: isTestnetState ?? false,
  });

  const { userOperationsCount, isUserOperationsCountLoading } =
    useQueryUserOperationsCount({
      address: address ?? null,
      status: "history",
      is_testnet: isTestnetState ?? false,
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
    <TableSectionWrapper>
      <DataTable
        isLoading={isLoading}
        isTestnet={isTestnetState ?? false}
        data={userOperations ?? []}
        columns={userOperationColumns}
        pageCount={pageCount ?? 0}
      />
    </TableSectionWrapper>
  );
};
