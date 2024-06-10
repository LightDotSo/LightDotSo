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

import { paginationParser } from "@lightdotso/nuqs";
import { getPortfolio, getTokens, getTokensCount } from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { Result } from "neverthrow";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import type { Address } from "viem";
import { handler as addressHandler } from "@/handlers/[address]/handler";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (
  params: { address: string },
  searchParams: {
    pagination?: string;
  },
) => {
  // ---------------------------------------------------------------------------
  // Cache
  // ---------------------------------------------------------------------------

  unstable_noStore();

  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  if (!validateAddress(params.address)) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { walletSettings } = await addressHandler(params);

  const tokensPromise = getTokens({
    address: params.address as Address,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    is_testnet: walletSettings.is_enabled_testnet,
    group: true,
    chain_ids: null,
  });

  const tokensCountPromise = getTokensCount({
    address: params.address as Address,
    is_testnet: walletSettings.is_enabled_testnet,
    chain_ids: null,
  });

  const portfolioPromise = getPortfolio({ address: params.address as Address });

  const [tokens, tokensCount, portfolio] = await Promise.all([
    tokensPromise,
    tokensCountPromise,
    portfolioPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([tokens, tokensCount, portfolio]);

  return res.match(
    ([tokens, tokensCount, portfolio]) => {
      return {
        paginationState: paginationState,
        walletSettings: walletSettings,
        tokens: tokens,
        tokensCount: tokensCount,
        portfolio: portfolio,
      };
    },
    () => {
      return {
        paginationState: paginationState,
        walletSettings: walletSettings,
        tokens: [],
        tokensCount: {
          count: 0,
        },
        portfolio: {
          balance: 0,
          balance_change_24h: 0,
          balance_change_24h_percentage: 0,
          balances: [],
        },
      };
    },
  );
};
