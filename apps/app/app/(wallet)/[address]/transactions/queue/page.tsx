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

import { TransactionsDataTablePagination } from "@/app/(wallet)/[address]/transactions/(components)/transactions-data-table-pagination";
import { Loader } from "@/app/(wallet)/[address]/transactions/queue/loader";
import { handler } from "@/handlers/[address]/transactions/queue/handler";
import { preloader } from "@/preloaders/[address]/transactions/queue/preloader";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type PageProps = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{
    pagination?: string;
  }>;
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(await params, await searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const {
    paginationState,
    walletSettings,
    userOperations,
    userOperationsCount,
  } = await handler(await params, await searchParams);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.wallet.settings({
      address: (await params).address as Address,
    }).queryKey,
    walletSettings,
  );

  queryClient.setQueryData(
    queryKeys.user_operation.list({
      address: (await params).address as Address,
      status: "queued",
      order: "asc",
      limit: paginationState.pageSize,
      offset: paginationState.pageIndex * paginationState.pageSize,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    userOperations,
  );

  queryClient.setQueryData(
    queryKeys.user_operation.listCount({
      address: (await params).address as Address,
      status: "queued",
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    userOperationsCount,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Loader params={await params} searchParams={await searchParams} />
      <TransactionsDataTablePagination />
    </HydrationBoundary>
  );
}
