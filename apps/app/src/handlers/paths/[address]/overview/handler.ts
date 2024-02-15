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

import { OVERVIEW_ROW_COUNT, SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import {
  getPortfolio,
  getNfts,
  getNftValuation,
  getTransactions,
  getTokens,
} from "@lightdotso/services";
import type { Address } from "viem";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (params: { address: string }) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { walletSettings } = await addressHandler(params);

  const tokensPromise = getTokens({
    address: params.address as Address,
    offset: 0,
    limit: OVERVIEW_ROW_COUNT,
    is_testnet: walletSettings.is_enabled_testnet,
    group: true,
    chain_ids: null,
  });

  const portfolioPromise = getPortfolio({ address: params.address as Address });

  const nftsPromise = getNfts({
    address: params.address as Address,
    limit: SIMPLEHASH_MAX_COUNT,
    is_testnet: walletSettings.is_enabled_testnet,
    cursor: null,
  });

  const nftValuationPromise = getNftValuation({
    address: params.address as Address,
  });

  const transactionsPromise = getTransactions({
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
