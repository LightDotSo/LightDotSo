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

import { Loader } from "@/app/(wallet)/[address]/deposit/loader";
import { handler } from "@/handlers/[address]/deposit/handler";
import { preloader } from "@/preloaders/[address]/deposit/preloader";
import { SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Address } from "viem";

// ------------------------------------------------------c-----------------------
// Props
// -----------------------------------------------------------------------------

export type PageProps = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{
    transfer?: string;
  }>;
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(await params);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { walletSettings, nfts, balances } = await handler(
    await params,
    await searchParams,
  );

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.wallet.settings({ address: (await params).address as Address })
      .queryKey,
    walletSettings,
  );

  queryClient.setQueryData(
    queryKeys.socket.balance({
      address: (await params).address as Address,
    }).queryKey,
    balances,
  );

  queryClient.setQueryData(
    queryKeys.nft.list({
      address: (await params).address as Address,
      is_testnet: walletSettings?.is_enabled_testnet,
      limit: SIMPLEHASH_MAX_COUNT,
      cursor: null,
    }).queryKey,
    nfts,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Loader params={await params} searchParams={await searchParams} />
    </HydrationBoundary>
  );
}
