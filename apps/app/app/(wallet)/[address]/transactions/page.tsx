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

import { TRANSACTION_ROW_COUNT } from "@lightdotso/const";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Address } from "viem";
import { OverviewList } from "@/app/(wallet)/[address]/transactions/(components)/overview/overview-list";
import { handler } from "@/handlers/[address]/transactions/handler";
import { preloader } from "@/preloaders/[address]/transactions/preloader";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(params);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const {
    walletSettings,
    userOperationsCount,
    queuedUserOperations,
    queuedUserOperationsCount,
    historyUserOperations,
    historyUserOperationsCount,
  } = await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.wallet.settings({ address: params.address as Address }).queryKey,
    walletSettings,
  );

  queryClient.setQueryData(
    queryKeys.user_operation.listCount({
      address: params.address as Address,
      status: null,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    userOperationsCount,
  );

  queryClient.setQueryData(
    queryKeys.user_operation.list({
      address: params.address as Address,
      status: "queued",
      order: "asc",
      limit: TRANSACTION_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queuedUserOperations,
  );

  queryClient.setQueryData(
    queryKeys.user_operation.listCount({
      address: params.address as Address,
      status: "queued",
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queuedUserOperationsCount,
  );

  queryClient.setQueryData(
    queryKeys.user_operation.list({
      address: params.address as Address,
      status: "history",
      order: "desc",
      limit: TRANSACTION_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    historyUserOperations,
  );

  queryClient.setQueryData(
    queryKeys.user_operation.listCount({
      address: params.address as Address,
      status: "history",
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    historyUserOperationsCount,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OverviewList address={params.address as Address} />
    </HydrationBoundary>
  );
}
