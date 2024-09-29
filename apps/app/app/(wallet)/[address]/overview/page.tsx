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

import { Loader } from "@/app/(wallet)/[address]/overview/loader";
import { handler } from "@/handlers/[address]/overview/handler";
import { preloader } from "@/preloaders/[address]/overview/preloader";
import { OVERVIEW_ROW_COUNT, SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface PageProps {
  params: Promise<{ address: Address; isDemo?: boolean }>;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(await params);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const {
    walletSettings,
    tokens,
    transactions,
    portfolio,
    nfts,
    nftValuation,
  } = await handler(await params);

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
    queryKeys.portfolio.get({ address: (await params).address as Address })
      .queryKey,
    portfolio,
  );

  queryClient.setQueryData(
    queryKeys.token.list({
      address: (await params).address as Address,
      limit: OVERVIEW_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet,
      group: true,
      chain_ids: null,
    }).queryKey,
    tokens,
  );

  queryClient.setQueryData(
    queryKeys.nft_valuation.get({ address: (await params).address as Address })
      .queryKey,
    nftValuation,
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

  queryClient.setQueryData(
    queryKeys.transaction.list({
      address: (await params).address as Address,
      limit: OVERVIEW_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
    transactions,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Loader params={await params} />
    </HydrationBoundary>
  );
}
