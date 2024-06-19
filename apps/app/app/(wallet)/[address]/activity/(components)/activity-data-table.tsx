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
import { useQueryActivities, useQueryActivitiesCount } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { activityColumns } from "@lightdotso/tables";
import { Login } from "@lightdotso/templates";
import { TableSectionWrapper } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(wallet)/[address]/activity/(components)/data-table/data-table";

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
  // Stores
  // ---------------------------------------------------------------------------

  const { sessionId } = useAuth();

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

  const { activities, isActivitiesLoading } = useQueryActivities({
    address: address as Address,
    limit: paginationState.pageSize,
    offset: offsetCount,
  });

  const { activitiesCount, isActivitiesCountLoading } = useQueryActivitiesCount(
    {
      address: address as Address,
    },
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return isActivitiesLoading || isActivitiesCountLoading;
  }, [isActivitiesLoading, isActivitiesCountLoading]);

  const pageCount = useMemo(() => {
    if (!activitiesCount || !activitiesCount?.count) {
      return null;
    }
    return Math.ceil(activitiesCount.count / paginationState.pageSize);
  }, [activitiesCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {!sessionId && (
        <div className="rounded-md border border-border bg-background">
          <Login />
        </div>
      )}
      <TableSectionWrapper className={cn(sessionId ? "block" : "hidden")}>
        <DataTable
          isLoading={isLoading}
          data={activities ?? []}
          columns={activityColumns}
          pageCount={pageCount ?? 0}
        />
      </TableSectionWrapper>
    </>
  );
};
