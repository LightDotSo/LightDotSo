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

import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { unstable_noStore } from "next/cache";
import type { Address } from "viem";
import { TokensDataTable } from "@/app/(wallet)/[address]/overview/tokens/(components)/tokens-data-table";
import { TokensDataTablePagination } from "@/app/(wallet)/[address]/overview/tokens/(components)/tokens-data-table-pagination";
import { PortfolioSection } from "@/components/section/portfolio-section";
import { TokenPortfolio } from "@/components/token/token-portfolio";
import { handler } from "@/handlers/[address]/overview/tokens/handler";
import { preloader } from "@/preloaders/[address]/overview/tokens/preloader";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface PageProps {
  params: { address: Address };
  searchParams: {
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

  const { paginationState, walletSettings, tokens, tokensCount, portfolio } =
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
    queryKeys.portfolio.get({ address: params.address as Address }).queryKey,
    portfolio,
  );

  queryClient.setQueryData(
    queryKeys.token.list({
      address: params.address as Address,
      limit: paginationState.pageSize,
      offset: paginationState.pageIndex * paginationState.pageSize,
      is_testnet: walletSettings?.is_enabled_testnet,
      group: true,
      chain_ids: null,
    }).queryKey,
    tokens,
  );

  queryClient.setQueryData(
    queryKeys.token.listCount({
      address: params.address as Address,
      is_testnet: walletSettings?.is_enabled_testnet,
      chain_ids: null,
    }).queryKey,
    tokensCount,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PortfolioSection title="Total Token Value">
        <TokenPortfolio address={params.address as Address} />
      </PortfolioSection>
      <TokensDataTable address={params.address as Address} />
      <TokensDataTablePagination />
    </HydrationBoundary>
  );
}
