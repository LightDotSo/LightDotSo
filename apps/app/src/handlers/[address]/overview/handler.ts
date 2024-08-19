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

import { handler as addressHandler } from "@/handlers/[address]/handler";
import { OVERVIEW_ROW_COUNT, SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import {
  getCachedNftValuation,
  getCachedNfts,
  getCachedPortfolio,
  getCachedTokens,
  getCachedTransactions,
} from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { notFound } from "next/navigation";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (params: { address: string }) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  if (!validateAddress(params.address)) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { walletSettings } = await addressHandler(params);

  const tokensPromise = getCachedTokens({
    address: params.address as Address,
    offset: 0,
    limit: OVERVIEW_ROW_COUNT,
    is_testnet: walletSettings.is_enabled_testnet,
    group: true,
    chain_ids: null,
  });

  const portfolioPromise = getCachedPortfolio({
    address: params.address as Address,
  });

  const nftsPromise = getCachedNfts({
    address: params.address as Address,
    limit: SIMPLEHASH_MAX_COUNT,
    is_testnet: walletSettings.is_enabled_testnet,
    cursor: null,
  });

  const nftValuationPromise = getCachedNftValuation({
    address: params.address as Address,
  });

  const transactionsPromise = getCachedTransactions({
    address: params.address as Address,
    offset: 0,
    limit: OVERVIEW_ROW_COUNT,
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const [tokensRes, portfolioRes, nftsRes, nftValuationRes, transactionsRes] =
    await Promise.all([
      tokensPromise,
      portfolioPromise,
      nftsPromise,
      nftValuationPromise,
      transactionsPromise,
    ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  return {
    walletSettings: walletSettings,
    tokens: tokensRes.unwrapOr([]),
    portfolio: portfolioRes.unwrapOr({
      balance: 0,
      balance_change_24h: 0,
      balance_change_24h_percentage: 0,
      balances: [],
    }),
    nfts: nftsRes.unwrapOr([]),
    nftValuation: nftValuationRes.unwrapOr({
      wallets: [{ address: params.address, usd_value: 0 }],
    }),
    transactions: transactionsRes.unwrapOr([]),
  };
};
