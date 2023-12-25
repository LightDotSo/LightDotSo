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

import { getActivities, getActivitiesCount } from "@lightdotso/client";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(wallet)/[address]/activity/(components)/data-table/columns";
import { DataTable } from "@/app/(wallet)/[address]/activity/(components)/data-table/data-table";
import type { ActivityData, ActivityCountData } from "@/data";
import { queries } from "@/queries";
import { usePaginationQueryState } from "@/querystates";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ActivityDataTableProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ActivityDataTable: FC<ActivityDataTableProps> = ({ address }) => {
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

  const currentData: ActivityData[] | undefined = queryClient.getQueryData(
    queries.activity.list({
      address,
      limit: paginationState.pageSize,
      offset: offsetCount,
    }).queryKey,
  );

  const { data: activities } = useQuery<ActivityData[] | null>({
    placeholderData: keepPreviousData,
    queryKey: queries.activity.list({
      address,
      limit: paginationState.pageSize,
      offset: offsetCount,
    }).queryKey,
    queryFn: async () => {
      const res = await getActivities({
        params: {
          query: {
            address,
            limit: paginationState.pageSize,
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

  const currentCountData: ActivityCountData | undefined =
    queryClient.getQueryData(
      queries.activity.listCount({
        address: address as Address,
      }).queryKey,
    );

  const { data: activitiesCount } = useQuery<ActivityCountData | null>({
    queryKey: queries.activity.listCount({
      address: address as Address,
    }).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getActivitiesCount({
        params: {
          query: {
            address: address,
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
    if (!activitiesCount || !activitiesCount?.count) {
      return null;
    }
    return Math.ceil(activitiesCount.count / paginationState.pageSize);
  }, [activitiesCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!pageCount) {
    return null;
  }

  return (
    <DataTable
      data={activities ?? []}
      columns={columns}
      pageCount={pageCount}
    />
  );
};
