// Copyright 2023-2024 Light.
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

import { SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { unstable_noStore } from "next/cache";
import type { Address } from "viem";
import { NftsDataTable } from "@/app/(wallet)/[address]/overview/nfts/(components)/nfts-data-table";
import { NftsDataTablePagination } from "@/app/(wallet)/[address]/overview/nfts/(components)/nfts-data-table-pagination";
import { NftPortfolio } from "@/components/nft/nft-portfolio";
import { PortfolioSection } from "@/components/section/portfolio-section";
import { handler } from "@/handlers/[address]/overview/nfts/handler";
import { preloader } from "@/preloaders/[address]/overview/nfts/preloader";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface PageProps {
  params: { address: Address };
  searchParams: {
    cursor?: string;
    pagination?: string;
  };
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Cache
  // ---------------------------------------------------------------------------

  unstable_noStore();

  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(params, searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { cursorState, paginationState, walletSettings, nfts, nftValuation } =
    await handler(params, searchParams);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.wallet.settings({ address: params.address as Address }).queryKey,
    walletSettings,
  );

  queryClient.setQueryData(
    queryKeys.nft_valuation.get({ address: params.address as Address })
      .queryKey,
    nftValuation,
  );

  queryClient.setQueryData(
    queryKeys.nft.list({
      address: params.address as Address,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
      limit: SIMPLEHASH_MAX_COUNT,
      cursor: paginationState.pageIndex === 0 ? null : cursorState,
    }).queryKey,
    nfts,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PortfolioSection title="Total NFTs Value">
        <NftPortfolio address={params.address as Address} />
      </PortfolioSection>
      <NftsDataTable address={params.address as Address} />
      <NftsDataTablePagination />
    </HydrationBoundary>
  );
}
