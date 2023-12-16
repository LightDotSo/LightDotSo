/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable @next/next/no-img-element */
// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Address } from "viem";
import { OverviewList } from "@/app/(wallet)/[address]/overview/(components)/overview/overview-list";
import { OVERVIEW_ROW_COUNT } from "@/const/numbers";
import { handler } from "@/handlers/paths/[address]/overview/handler";
import { preloader } from "@/preloaders/paths/[address]/overview/preloader";
import { queries } from "@/queries";
import { getQueryClient } from "@/services";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface PageProps {
  params: { address: Address };
}

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

  const { walletSettings, tokens, portfolio, nfts, nftValuation } =
    await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queries.wallet.settings({ address: params.address as Address }).queryKey,
    walletSettings,
  );
  queryClient.setQueryData(
    queries.portfolio.get({ address: params.address as Address }).queryKey,
    portfolio,
  );
  queryClient.setQueryData(
    queries.token.list({
      address: params.address as Address,
      limit: OVERVIEW_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
    tokens,
  );
  queryClient.setQueryData(
    queries.nft_valuation.get({ address: params.address as Address }).queryKey,
    nftValuation,
  );
  queryClient.setQueryData(
    queries.nft.list({
      address: params.address as Address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
    nfts,
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
