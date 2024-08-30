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

import { DataTable } from "@/app/(authenticated)/notifications/(components)/data-table/data-table";
import {
  useAddressQueryState,
  usePaginationQueryState,
} from "@lightdotso/nuqs";
import {
  useQueryNotifications,
  useQueryNotificationsCount,
} from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { notificationColumns } from "@lightdotso/tables";
import { Login } from "@lightdotso/templates";
import { TableSectionWrapper } from "@lightdotso/ui/wrappers";
import { cn } from "@lightdotso/utils";
import { type FC, useMemo } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NotificationsDataTable: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { sessionId } = useAuth();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState] = usePaginationQueryState();
  const [addressState] = useAddressQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const offsetCount = useMemo(() => {
    return paginationState.pageSize * paginationState.pageIndex;
  }, [paginationState.pageSize, paginationState.pageIndex]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { notifications, isNotificationsLoading } = useQueryNotifications({
    address: addressState as Address,
    limit: paginationState.pageSize,
    offset: offsetCount,
  });

  const { notificationsCount, isNotificationsCountLoading } =
    useQueryNotificationsCount({
      address: addressState as Address,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return isNotificationsLoading || isNotificationsCountLoading;
  }, [isNotificationsLoading, isNotificationsCountLoading]);

  const pageCount = useMemo(() => {
    if (!notificationsCount?.count) {
      return null;
    }
    return Math.ceil(notificationsCount.count / paginationState.pageSize);
  }, [notificationsCount, paginationState.pageSize]);

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
          data={notifications ?? []}
          columns={notificationColumns}
          pageCount={pageCount ?? 0}
        />
      </TableSectionWrapper>
    </>
  );
};
