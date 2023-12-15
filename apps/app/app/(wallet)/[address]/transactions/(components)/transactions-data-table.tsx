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

import { getUserOperations, getUserOperationsCount } from "@lightdotso/client";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(wallet)/[address]/transactions/(components)/data-table/columns";
import { DataTable } from "@/app/(wallet)/[address]/transactions/(components)/data-table/data-table";
import type { UserOperationCountData, UserOperationData } from "@/data";
import { queries } from "@/queries";
import { useTables } from "@/stores";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionsDataTableProps {
  address: Address;
  status: "all" | "proposed" | "executed";
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionsDataTable: FC<TransactionsDataTableProps> = ({
  address,
  status,
}) => {
  const { userOperationPagination } = useTables();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const offsetCount = useMemo(() => {
    return userOperationPagination.pageSize * userOperationPagination.pageIndex;
  }, [userOperationPagination.pageSize, userOperationPagination.pageIndex]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: UserOperationData[] | undefined = queryClient.getQueryData(
    queries.user_operation.list({
      address,
      status,
      limit: userOperationPagination.pageSize,
      offset: offsetCount,
    }).queryKey,
  );

  const { data: transactions } = useQuery<UserOperationData[] | null>({
    placeholderData: keepPreviousData,
    queryKey: queries.user_operation.list({
      address,
      status,
      limit: userOperationPagination.pageSize,
      offset: offsetCount,
    }).queryKey,
    queryFn: async () => {
      const res = await getUserOperations({
        params: {
          query: {
            address,
            status: status === "all" ? undefined : status,
            limit: userOperationPagination.pageSize,
            offset: offsetCount,
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

  const currentCountData: UserOperationCountData | undefined =
    queryClient.getQueryData(
      queries.user_operation.listCount({ address: address as Address, status })
        .queryKey,
    );

  const { data: userOperationsCount } = useQuery<UserOperationCountData | null>(
    {
      queryKey: queries.user_operation.listCount({
        address: address as Address,
        status,
      }).queryKey,
      queryFn: async () => {
        if (!address) {
          return null;
        }

        const res = await getUserOperationsCount({
          params: {
            query: {
              address: address,
              status: status === "all" ? undefined : status,
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
    },
  );

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const pageCount = useMemo(() => {
    if (!userOperationsCount || !userOperationsCount?.count) {
      return null;
    }
    return Math.ceil(
      userOperationsCount.count / userOperationPagination.pageSize,
    );
  }, [userOperationsCount, userOperationPagination.pageSize]);

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
