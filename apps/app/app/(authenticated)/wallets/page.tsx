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

import { WalletsDataTablePagination } from "@/app/(authenticated)/wallets/(components)/wallets-data-table-pagination";
import { WalletsDataTableToolbar } from "@/app/(authenticated)/wallets/(components)/wallets-data-table-toolbar";
import { Loader } from "@/app/(authenticated)/wallets/loader";
import { handler } from "@/handlers/wallets/handler";
import { preloader } from "@/preloaders/wallets/preloader";
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
  };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

// TODO: Add implement session based search params handler

export default async function Page({ searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  await preloader(searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { paginationState, user, wallets, walletsCount } =
    await handler(searchParams);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.wallet.list({
      address: user.id === "" ? null : (user.address as Address),
      limit: paginationState.pageSize,
      offset: paginationState.pageIndex * paginationState.pageSize,
      user_id: undefined,
    }).queryKey,
    wallets,
  );

  queryClient.setQueryData(
    queryKeys.wallet.listCount({
      address: user.id === "" ? null : (user.address as Address),
      user_id: undefined,
    }).queryKey,
    walletsCount,
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WalletsDataTableToolbar />
      <Loader />
      <WalletsDataTablePagination />
    </HydrationBoundary>
  );
}
