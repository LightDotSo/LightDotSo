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

import { NotificationsDataTablePagination } from "@/app/(authenticated)/notifications/(components)/notifications-data-table-pagination";
import { NotificationsDataTableToolbar } from "@/app/(authenticated)/notifications/(components)/notifications-data-table-toolbar";
import { Loader } from "@/app/(authenticated)/notifications/loader";
import { handler } from "@/handlers/notifications/handler";
import { preloader } from "@/preloaders/notifications/preloader";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  searchParams: {
    pagination?: string;
    address?: string;
  };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  await preloader(searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const {
    addressState,
    paginationState,
    user,
    notifications,
    notificationsCount,
  } = await handler(searchParams);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.notification.list({
      address: user.id === "" ? null : (addressState as Address),
      limit: paginationState.pageSize,
      offset: paginationState.pageIndex * paginationState.pageSize,
      user_id: null,
    }).queryKey,
    notifications,
  );

  queryClient.setQueryData(
    queryKeys.notification.listCount({
      address: user.id === "" ? null : (addressState as Address),
      user_id: null,
    }).queryKey,
    notificationsCount,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsDataTableToolbar />
      <Loader />
      <NotificationsDataTablePagination />
    </HydrationBoundary>
  );
}
